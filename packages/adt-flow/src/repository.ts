import {
  mkdir,
  readFile,
  realpath,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, isAbsolute, posix, resolve, sep } from 'node:path';
import type { FormatPlugin, MaterializedFormatFile } from '@abapify/adt-plugin';
import { compareStrings, sha256 } from './deterministic';
import { AdtFlowError, type FlowObjectIdentity } from './types';

export interface DesiredFile extends MaterializedFormatFile {
  owner: string;
}

export interface RepositoryPlan {
  writes: Map<string, string>;
  removes: string[];
  unchanged: string[];
  moved: Array<{ from: string; to: string }>;
}

export function safeRelativePath(path: string): string {
  if (
    !path ||
    path.includes('\\') ||
    isAbsolute(path) ||
    posix.isAbsolute(path)
  ) {
    throw new AdtFlowError(
      'path_invalid',
      'Flow paths must be non-empty repository-relative POSIX paths.',
      { path },
    );
  }
  const normalized = posix.normalize(path);
  if (
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized !== path
  ) {
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

async function validatePhysicalRoot(
  root: string,
  absolute: string,
): Promise<void> {
  const realRoot = await realpath(resolve(root));
  let realPath: string;
  try {
    realPath = await realpath(absolute);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const dir = dirname(absolute);
      try {
        const realDir = await realpath(dir);
        realPath = posix.join(realDir, basename(absolute));
      } catch (dirError) {
        if ((dirError as NodeJS.ErrnoException).code === 'ENOENT') {
          // The path does not exist and its parent is missing, so there is
          // nothing to escape to yet.
          return;
        }
        throw dirError;
      }
    } else {
      throw error;
    }
  }
  if (realPath !== realRoot && !realPath.startsWith(`${realRoot}${sep}`)) {
    throw new AdtFlowError(
      'path_invalid',
      'Flow path resolves outside the repository root.',
      { path: absolute },
    );
  }
}

export async function readText(
  root: string,
  path: string,
): Promise<string | undefined> {
  try {
    return await readFile(absolutePath(root, path), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function fileExists(root: string, path: string): Promise<boolean> {
  try {
    return (await stat(absolutePath(root, path))).isFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

export async function walkFiles(
  root: string,
  relativeDir: string,
): Promise<string[]> {
  const absoluteDir = absolutePath(root, relativeDir);
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

function repositoryType(identity: FlowObjectIdentity): string {
  return identity.pgmid.toUpperCase() === 'LIMU' &&
    identity.type.toUpperCase() === 'REPS'
    ? 'PROG'
    : identity.type;
}

export async function discoverObjectFiles(
  root: string,
  format: FormatPlugin,
  identity: FlowObjectIdentity,
  files?: readonly string[],
): Promise<string[]> {
  if (!format.parseFilename) return [];
  const matches: string[] = [];
  const expectedType = repositoryType(identity).toUpperCase();
  const expectedName = identity.name.toUpperCase();
  const sourceFiles = files ?? (await walkFiles(root, 'src'));
  for (const path of sourceFiles) {
    const parsed = format.parseFilename(basename(path));
    if (
      parsed?.name.toUpperCase() === expectedName &&
      parsed.type.toUpperCase() === expectedType
    ) {
      matches.push(path);
    }
  }
  return matches;
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
  await mkdir(dirname(absolute), { recursive: true });
  await validatePhysicalRoot(root, absolute);
  const temporary = `${absolute}.adt-flow-${process.pid}-${tempSequence++}.tmp`;
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
    for (const path of plan.removes)
      await rm(absolutePath(root, path), { force: true });
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
