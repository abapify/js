import { realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

function isWithin(root: string, candidate: string): boolean {
  const path = relative(root, candidate);
  return path === '' || (!path.startsWith('..') && !isAbsolute(path));
}

export async function resolveFlowWorkspaceRoot(
  requested: string,
  allowedRoots: readonly string[] = [process.cwd()],
): Promise<string> {
  if (!isAbsolute(requested))
    throw new Error('workspaceRoot must be absolute.');
  const candidate = await realpath(resolve(requested));
  if (!(await stat(candidate)).isDirectory()) {
    throw new Error('workspaceRoot must resolve to a directory.');
  }
  const allowed = await Promise.all(
    allowedRoots.map((root) => realpath(resolve(root))),
  );
  if (!allowed.some((root) => isWithin(root, candidate))) {
    throw new Error('workspaceRoot is outside the server-owned roots.');
  }
  return candidate;
}
