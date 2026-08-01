import { lstat, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

function isWithin(root: string, candidate: string): boolean {
  const path = relative(root, candidate);
  return (
    path === '' ||
    (!isAbsolute(path) && !path.split(sep).filter(Boolean).includes('..'))
  );
}

export async function resolveFlowWorkspaceRoot(
  requested: string,
  allowedRoots: readonly string[] = [process.cwd()],
): Promise<string> {
  if (!isAbsolute(requested))
    throw new Error('workspaceRoot must be absolute.');
  const requestedPath = resolve(requested);
  const requestedStats = await lstat(requestedPath);
  if (!requestedStats.isDirectory() || requestedStats.isSymbolicLink()) {
    throw new Error('workspaceRoot must be a real directory (no symlinks).');
  }
  const candidate = await realpath(requestedPath);
  const allowed = await Promise.all(
    allowedRoots.map((root) => realpath(resolve(root))),
  );
  if (!allowed.some((root) => isWithin(root, candidate))) {
    throw new Error('workspaceRoot is outside the server-owned roots.');
  }
  return candidate;
}
