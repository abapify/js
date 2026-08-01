import type { Stats } from 'node:fs';
import {
  lstat,
  mkdir,
  readFile,
  readlink,
  realpath,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, isAbsolute, posix, relative, resolve, sep } from 'node:path';
import type { MaterializedFormatFile } from '@abapify/adt-plugin';
import { compareStrings, sha256 } from './deterministic';
import { AdtFlowError } from './types';

export interface DesiredFile extends MaterializedFormatFile {
  owner: string;
}

export interface RepositoryPlan {
  writes: Map<string, string>;
  removes: string[];
  unchanged: string[];
  moved: Array<{ from: string; to: string }>;
}

function isValidRelativeInput(path: string): boolean {
  if (!path) return false;
  if (path.includes('\\')) return false;
  return !isAbsolute(path) && !posix.isAbsolute(path);
}

function isValidNormalizedPath(normalized: string, original: string): boolean {
  return (
    normalized !== '..' &&
    !normalized.startsWith('../') &&
    normalized === original
  );
}

export function safeRelativePath(path: string): string {
  if (!isValidRelativeInput(path)) {
    throw new AdtFlowError(
      'path_invalid',
      'Flow paths must be non-empty repository-relative POSIX paths.',
      { path },
    );
  }
  const normalized = posix.normalize(path);
  if (!isValidNormalizedPath(normalized, path)) {
    throw new AdtFlowError(
      'path_invalid',
      'Flow path normalization would escape or change the repository path.',
      { path },
    );
  }
  return normalized;
}

export function absolutePath(root: string, relativePath: string): string {
  const safe = safeRelativePath(relativePath);
  const absoluteRoot = resolve(root);
  const absolute = resolve(absoluteRoot, ...safe.split('/'));
  if (
    absolute !== absoluteRoot &&
    !absolute.startsWith(`${absoluteRoot}${sep}`)
  ) {
    throw new AdtFlowError(
      'path_invalid',
      'Flow path escapes the repository root.',
      { path: relativePath },
    );
  }
  return absolute;
}

function pathEscapesRoot(rel: string): boolean {
  return rel === '' || rel.startsWith('..') || isAbsolute(rel);
}

function isInsideRoot(realRoot: string, target: string): boolean {
  const rel = relative(realRoot, target);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

async function lstatSafe(path: string): Promise<Stats | undefined> {
  try {
    return await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function resolveSymlink(
  current: string,
  component: string,
  realRoot: string,
): Promise<string> {
  const next = resolve(current, component);
  const stats = await lstatSafe(next);
  if (!stats || !stats.isSymbolicLink()) return next;

  const target = await readlink(next);
  const resolvedTarget = resolve(dirname(next), target);
  if (!isInsideRoot(realRoot, resolvedTarget)) {
    throw new AdtFlowError(
      'path_invalid',
      'Flow path resolves outside the repository root.',
      { path: next },
    );
  }
  return resolvedTarget;
}

function ensureDirectory(stats: Stats, isLast: boolean, path: string): void {
  if (isLast) return;
  if (stats.isDirectory()) return;
  throw new AdtFlowError(
    'path_invalid',
    'Flow path parent is not a directory.',
    { path },
  );
}

async function validatePhysicalRoot(
  root: string,
  absolute: string,
): Promise<void> {
  const rootResolved = resolve(root);
  const rel = relative(rootResolved, absolute);
  if (pathEscapesRoot(rel)) {
    throw new AdtFlowError(
      'path_invalid',
      'Flow path escapes the repository root.',
      { path: absolute },
    );
  }

  const realRoot = await realpath(rootResolved);
  const components = rel.split(sep).filter(Boolean);
  let current = realRoot;
  const lastIndex = components.length - 1;

  for (let i = 0; i <= lastIndex; i++) {
    const component = components[i];
    current = resolve(current, component);
    const stats = await lstatSafe(current);
    if (!stats) return;

    if (stats.isSymbolicLink()) {
      current = await resolveSymlink(dirname(current), component, realRoot);
      continue;
    }

    ensureDirectory(stats, i === lastIndex, current);
  }
}

async function withEnoent<T>(
  operation: () => Promise<T>,
  enoentValue: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return enoentValue;
    throw error;
  }
}

async function withValidatedPath<T>(
  root: string,
  path: string,
  operation: (absolute: string) => Promise<T>,
  enoentValue: T,
): Promise<T> {
  return withEnoent(async () => {
    const absolute = absolutePath(root, path);
    await validatePhysicalRoot(root, absolute);
    return operation(absolute);
  }, enoentValue);
}

export async function readText(
  root: string,
  path: string,
): Promise<string | undefined> {
  return withValidatedPath(
    root,
    path,
    (absolute) => readFile(absolute, 'utf8'),
    undefined,
  );
}

async function fileExists(root: string, path: string): Promise<boolean> {
  return withValidatedPath(
    root,
    path,
    async (absolute) => (await stat(absolute)).isFile(),
    false,
  );
}

export async function walkFiles(
  root: string,
  relativeDir: string,
): Promise<string[]> {
  const absoluteDir = absolutePath(root, relativeDir);
  await validatePhysicalRoot(root, absoluteDir);
  let entries;
  try {
    entries = await readdir(absoluteDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const files: string[] = [];
  for (const entry of entries.sort((left, right) =>
    compareStrings(left.name, right.name),
  )) {
    const child = posix.join(relativeDir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) files.push(...(await walkFiles(root, child)));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

export function validateDesiredFiles(files: readonly DesiredFile[]): void {
  const exact = new Map<string, string>();
  const portable = new Map<string, string>();
  for (const file of files) {
    const path = safeRelativePath(file.path);
    if (exact.has(path)) {
      throw new AdtFlowError(
        'path_collision',
        'The desired tree contains a duplicate path.',
        { path },
      );
    }
    exact.set(path, file.owner);
    const folded = path.toLocaleLowerCase('en-US');
    const existingPath = portable.get(folded);
    if (existingPath && existingPath !== path) {
      throw new AdtFlowError(
        'path_collision',
        'Desired paths collide on a case-insensitive filesystem.',
        { path, existingPath },
      );
    }
    portable.set(folded, path);
  }
}

export async function verifyOwnedHashes(
  root: string,
  files: readonly { path: string; hash: string }[],
): Promise<boolean> {
  for (const file of files) {
    const content = await readText(root, file.path);
    if (content === undefined || sha256(content) !== file.hash) return false;
  }
  return true;
}

export async function planRepositoryChanges(
  root: string,
  desired: readonly DesiredFile[],
  ownedPaths: ReadonlySet<string>,
  ownedOwners?: ReadonlyMap<string, string>,
): Promise<RepositoryPlan> {
  validateDesiredFiles(desired);
  const desiredByPath = new Map(desired.map((file) => [file.path, file]));
  const existingSourcePaths = await walkFiles(root, 'src');
  const existingByFoldedPath = new Map(
    existingSourcePaths.map((path) => [path.toLowerCase(), path]),
  );
  const writes = new Map<string, string>();
  const unchanged: string[] = [];

  for (const file of desired) {
    const portableCollision = existingByFoldedPath.get(file.path.toLowerCase());
    if (portableCollision && portableCollision !== file.path) {
      throw new AdtFlowError(
        'path_collision',
        'A desired path collides with an existing path on a case-insensitive filesystem.',
        { path: file.path, existingPath: portableCollision },
      );
    }
    const current = await readText(root, file.path);
    if (current === undefined) {
      writes.set(file.path, file.content);
    } else if (!ownedPaths.has(file.path)) {
      throw new AdtFlowError(
        'path_collision',
        'A desired path is occupied by an unowned file.',
        { path: file.path },
      );
    } else if (current === file.content) {
      unchanged.push(file.path);
    } else {
      writes.set(file.path, file.content);
    }
  }

  const removes: string[] = [];
  for (const path of [...ownedPaths]
    .filter((item) => !desiredByPath.has(item))
    .sort()) {
    if (await fileExists(root, path)) removes.push(path);
  }
  const removedByHash = new Map<string, string[]>();
  for (const path of removes) {
    const content = await readText(root, path);
    if (content === undefined) continue;
    const hash = sha256(content);
    removedByHash.set(hash, [...(removedByHash.get(hash) ?? []), path]);
  }
  const moved: Array<{ from: string; to: string }> = [];
  for (const [to, content] of writes) {
    const candidates = removedByHash.get(sha256(content));
    const toOwner = desiredByPath.get(to)?.owner;
    const from = candidates?.find(
      (candidate) => !ownedOwners || ownedOwners.get(candidate) === toOwner,
    );
    if (from) {
      candidates?.splice(candidates.indexOf(from), 1);
      moved.push({ from, to });
    }
  }

  return { writes, removes, unchanged: unchanged.sort(), moved };
}

let tempSequence = 0;

async function atomicWrite(
  root: string,
  path: string,
  content: string | Buffer,
): Promise<void> {
  const absolute = absolutePath(root, path);
  await validatePhysicalRoot(root, absolute);
  await mkdir(dirname(absolute), { recursive: true });
  const temporary = `${absolute}.adt-flow-${process.pid}-${tempSequence++}.tmp`;
  await validatePhysicalRoot(root, temporary);
  try {
    await writeFile(temporary, content);
    await rename(temporary, absolute);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function captureSnapshots(
  root: string,
  paths: Iterable<string>,
): Promise<Map<string, Buffer | undefined>> {
  const snapshots = new Map<string, Buffer | undefined>();
  for (const path of paths) {
    try {
      snapshots.set(path, await readFile(absolutePath(root, path)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      snapshots.set(path, undefined);
    }
  }
  return snapshots;
}

async function restoreSnapshots(
  root: string,
  snapshots: ReadonlyMap<string, Buffer | undefined>,
): Promise<void> {
  for (const [path, content] of snapshots) {
    if (content === undefined)
      await rm(absolutePath(root, path), { force: true });
    else await atomicWrite(root, path, content);
  }
}

export async function applyRepositoryPlan(
  root: string,
  plan: RepositoryPlan,
): Promise<void> {
  const snapshots = await captureSnapshots(root, [
    ...plan.writes.keys(),
    ...plan.removes,
  ]);

  try {
    for (const [path, content] of plan.writes)
      await atomicWrite(root, path, content);
    for (const path of plan.removes) {
      const absolute = absolutePath(root, path);
      await validatePhysicalRoot(root, absolute);
      await rm(absolute, { force: true });
    }
  } catch (error) {
    try {
      await restoreSnapshots(root, snapshots);
    } catch (rollbackError) {
      throw new AdtFlowError(
        'apply_failed',
        'Flow apply failed and rollback could not restore the complete tree.',
        {
          cause: String(error),
          rollback: String(rollbackError),
        },
      );
    }
    throw new AdtFlowError(
      'apply_failed',
      'Flow apply failed; the previous tree was restored.',
      { cause: String(error) },
    );
  }
}
