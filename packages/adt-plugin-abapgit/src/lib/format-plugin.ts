/**
 * abapGit as a FormatPlugin.
 *
 * This is the thin adapter that plugs the abapGit handler registry into the
 * generic `FormatPlugin` contract defined by `@abapify/adt-plugin`. External
 * consumers (adt-export, adt-diff, adt-cli) interact with this plugin
 * **through the registry only** — they look it up with
 * `getFormatPlugin('abapgit')` and never import this package directly.
 *
 * Registration happens as a side-effect of importing `@abapify/adt-plugin-abapgit`;
 * the CLI bootstraps the registration once in `adt-cli/src/lib/cli.ts`.
 */

import {
  FormatMaterializationError,
  type FormatPlugin,
  type FormatHandler,
  type MaterializedFormatFile,
} from '@abapify/adt-plugin';
import { posix } from 'node:path';
import {
  getHandler as getAbapGitHandler,
  getSupportedTypes,
} from './handlers/registry';
import { parseAbapGitFilename } from './deserializer';
import { calculatePackageDir, parseFolderLogic } from './folder-logic';

function classifyFile(
  path: string,
  handler: FormatHandler,
): Pick<MaterializedFormatFile, 'role' | 'sourceComponent'> {
  const parsed = parseAbapGitFilename(path);
  if (parsed?.extension !== 'abap') {
    return { role: 'metadata' };
  }

  const sourceComponent = parsed.suffix
    ? (handler.suffixToSourceKey?.[parsed.suffix] ?? parsed.suffix)
    : 'main';
  return { role: 'source', sourceComponent };
}

export const abapgitFormatPlugin: FormatPlugin = {
  id: 'abapgit',
  description: 'abapGit serialization format',

  // `supportedTypes` is backed by the live handler registry so registering
  // additional handlers at import time is reflected here without extra work.
  get supportedTypes(): ReadonlyArray<string> {
    return getSupportedTypes();
  },

  getHandler(type: string): FormatHandler | undefined {
    // The concrete abapGit `ObjectHandler` is a structural superset of the
    // generic `FormatHandler`, so this is just a widening cast.
    return getAbapGitHandler(type) as unknown as FormatHandler | undefined;
  },

  async materialize(input) {
    const handler = this.getHandler(input.objectType);
    if (!handler) {
      throw new FormatMaterializationError(
        'FORMAT_OBJECT_TYPE_UNSUPPORTED',
        `abapGit does not support object type "${input.objectType}".`,
      );
    }

    const folderLogic =
      parseFolderLogic(input.formatOptions?.folderLogic) ?? 'prefix';
    const packageDir = calculatePackageDir([...input.packagePath], folderLogic);
    const serialized = await handler.serialize(input.object, {
      ...(input.sources !== undefined ? { sources: input.sources } : {}),
    });
    const files = serialized
      .map((file): MaterializedFormatFile => {
        const path = posix.join('src', packageDir, file.path);
        return {
          ...file,
          path,
          ...classifyFile(file.path, handler),
        };
      })
      .sort((left, right) =>
        left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
      );

    return { files };
  },

  parseFilename(filename: string) {
    const parsed = parseAbapGitFilename(filename);
    return parsed ?? undefined;
  },
};

export default abapgitFormatPlugin;
