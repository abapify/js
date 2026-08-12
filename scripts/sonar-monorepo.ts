#!/usr/bin/env bun
/**
 * Generate SonarQube Cloud monorepo artifacts for the abapify Nx workspace:
 *   - sonar-monorepo.json  -> bulk import into SonarQube Cloud
 *   - sonar-matrix.json    -> matrix used by .github/workflows/sonar.yml
 *
 * Run with: bunx tsx scripts/sonar-monorepo.ts
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const ORG = 'abapify';
const MONOREPO = 'adt-cli';
const EXISTING_ADT_CLI_KEY = `${ORG}_${MONOREPO}`;

const ROOT_EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  'tmp',
  'git_modules',
  '.verdaccio',
  '.nx',
]);

interface NxProject {
  name: string;
  root: string;
  sourceRoot: string | null;
}

interface SonarProject {
  projectKey: string;
  projectName: string;
  sources: string;
}

async function run(cmd: string): Promise<string> {
  const { stdout } = await execAsync(cmd, {
    cwd: ROOT,
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

function hasSourceFiles(dir: string): boolean {
  if (!existsSync(dir)) return false;
  const entries = readdirSync(dir);
  return entries.some((entry) => {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) return false;
    return /\.(ts|tsx|js|mjs|cjs|jsx|css|scss|yml|yaml|sh)$/.test(entry);
  });
}

function hasDirFiles(dir: string): boolean {
  return existsSync(dir) && readdirSync(dir).length > 0;
}

function topLevelSourceDirs(projectRootTlds: Set<string>): string[] {
  const excluded = new Set<string>(ROOT_EXCLUDED_DIRS);
  for (const tld of projectRootTlds) {
    excluded.add(tld);
  }

  const dirs: string[] = [];
  for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const { name } = entry;
    if (name.startsWith('.') && name !== '.github') continue;
    if (excluded.has(name)) continue;
    if (hasDirFiles(join(ROOT, name))) dirs.push(name);
  }
  dirs.sort();
  return dirs;
}

function readPackageName(root: string): string | undefined {
  const pkgPath = join(ROOT, root, 'package.json');
  if (!existsSync(pkgPath)) return undefined;
  try {
    return (JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name?: string })
      .name;
  } catch {
    return undefined;
  }
}

function sanitizeKeyPart(part: string): string {
  return part.replace(/[^A-Za-z0-9._:-]/g, '_');
}

function computeKey({
  root,
  packageName,
  nxName,
}: {
  root: string;
  packageName: string | undefined;
  nxName: string;
}): string {
  if (root === '.') {
    return `${ORG}_${MONOREPO}_root`;
  }

  const base = root.split('/').pop() ?? nxName;
  const suffixSource = packageName ?? base;
  const suffix = suffixSource.replace(/^@abapify\//, '');
  const cleanSuffix = sanitizeKeyPart(suffix);

  if (root === 'packages/adt-cli' && cleanSuffix === 'adt-cli') {
    // Preserve the existing single-project key for the main CLI package.
    return EXISTING_ADT_CLI_KEY;
  }

  return `${ORG}_${MONOREPO}_${cleanSuffix}`;
}

function computeName({
  nxName,
  packageName,
}: {
  nxName: string;
  packageName: string | undefined;
}): string {
  return packageName ?? nxName;
}

function determineSources({
  root,
  sourceRoot,
  projectRootTlds,
}: {
  root: string;
  sourceRoot: string | null;
  projectRootTlds: Set<string>;
}): string | null {
  if (root === '.') {
    const parts = topLevelSourceDirs(projectRootTlds);
    return parts.length > 0 ? parts.join(',') : null;
  }

  const srcDir = join(ROOT, root, 'src');
  if (hasDirFiles(srcDir)) {
    return `${root}/src`;
  }

  if (sourceRoot && hasDirFiles(join(ROOT, sourceRoot))) {
    return sourceRoot;
  }

  if (hasSourceFiles(join(ROOT, root))) {
    return root;
  }

  return null;
}

async function main(): Promise<void> {
  const projectsRaw = await run('bunx nx show projects --json');
  const projectNames: string[] = JSON.parse(projectsRaw) as string[];

  const details = await Promise.all(
    projectNames.map(async (name) => {
      const raw = await run(`bunx nx show project ${name} --json`);
      return JSON.parse(raw) as NxProject;
    }),
  );

  const projectRootTlds = new Set(
    details.filter((p) => p.root !== '.').map((p) => p.root.split('/')[0]),
  );

  const projects: SonarProject[] = [];

  for (const p of details) {
    const sources = determineSources({
      root: p.root,
      sourceRoot: p.sourceRoot,
      projectRootTlds,
    });
    if (!sources) {
      // eslint-disable-next-line no-console
      console.log(`Skipping ${p.name}: no analyzable source directory`);
      continue;
    }

    const packageName = readPackageName(p.root);
    const projectName = computeName({ nxName: p.name, packageName });
    const projectKey = computeKey({
      root: p.root,
      packageName,
      nxName: p.name,
    });

    projects.push({ projectKey, projectName, sources });
  }

  const importFile = projects.map(({ projectKey, projectName }) => ({
    projectKey,
    projectName,
  }));

  const matrixFile = { include: projects };

  writeFileSync(
    join(ROOT, 'sonar-monorepo.json'),
    JSON.stringify(importFile, null, 2) + '\n',
  );
  writeFileSync(
    join(ROOT, 'sonar-matrix.json'),
    JSON.stringify(matrixFile, null, 2) + '\n',
  );

  // eslint-disable-next-line no-console
  console.log(`Generated ${projects.length} Sonar projects`);
}

try {
  await main();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
}
