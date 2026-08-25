/**
 * SRVD (RAP Service Definition) object handler for abapGit format
 *
 * SRVD is source-driven: the semantic content lives in an `.acds` file and
 * the official ABAP File Format stores its metadata in a `.json` sidecar.
 *
 * File layout:
 *   src/zui_foo.srvd.acds — service source text
 *   src/zui_foo.srvd.json — ABAP File Formats metadata
 *
 * The handler uses the string form of `createHandler` ('SRVD') because
 * the ADK object (`AdkServiceDefinition`) is a lightweight class without
 * the AdkObject save/lock machinery — all lifecycle is source-based.
 *
 * We override `serialize` because this AFF layout is JSON rather than the
 * legacy abapGit XML envelope.
 */

import { srvd } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import {
  FormatMaterializationError,
  type FormatSerializeOptions,
} from '@abapify/adt-plugin';

type SrvdLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  sourceOrigin?: string;
  sourceType?: string;
  getSource?: () => Promise<string> | string;
};

type SrvdSourceObject = { getSource?: () => Promise<string> | string };

async function resolveSrvdSource(
  object: SrvdSourceObject,
  sources: Readonly<Record<string, string | undefined>> | undefined,
): Promise<string | undefined> {
  if (sources !== undefined) {
    const keys = Object.keys(sources);
    if (keys.some((key) => key !== 'main')) {
      throw new FormatMaterializationError(
        'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
        `SRVD only supports the 'main' source component; received ${keys.join(', ')}.`,
      );
    }
    return sources.main;
  }
  return typeof object?.getSource === 'function'
    ? await object.getSource()
    : '';
}

export const serviceDefinitionHandler = createHandler<SrvdLike, typeof srvd>(
  'SRVD',
  {
    schema: srvd,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_SRVD',
    serializer_version: 'v1.0.0',

    toAbapGit: (obj) => ({
      SKEY: {
        TYPE: 'SRVD',
        NAME: String(obj?.name ?? '').toUpperCase(),
      },
    }),

    // Source is `.acds` text retrieved from ADT `source/main`.
    getSource: (obj) =>
      typeof obj?.getSource === 'function'
        ? obj.getSource()
        : Promise.resolve(''),

    fromAbapGit: ({ SKEY }) => ({
      name: String(SKEY?.NAME ?? '').toUpperCase(),
    }),

    // Custom serialize — official SRVD AFF is `.acds` plus `.json`.
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const files: SerializedFile[] = [];
      const objectName = ctx.getObjectName(object);

      // Source: <name>.srvd.acds. When a source map is supplied it is
      // authoritative; otherwise fall back to the mutable object getter.
      const source = await resolveSrvdSource(object, options?.sources);
      if (shouldIncludeSource(source, options?.sources?.main)) {
        files.push(
          ctx.createFile(`${objectName}.${ctx.fileExtension}.acds`, source),
        );
      }

      // Metadata: <name>.srvd.json
      const metadata = object as {
        description?: string;
        originalLanguage?: string;
        abapLanguageVersion?: string;
        sourceOrigin?: string;
        sourceType?: string;
      };
      const header = {
        description: metadata.description || String(object?.name ?? ''),
        originalLanguage: (metadata.originalLanguage ?? 'en').toLowerCase(),
        ...(metadata.abapLanguageVersion
          ? { abapLanguageVersion: metadata.abapLanguageVersion }
          : {}),
      };
      files.push(
        ctx.createFile(
          `${objectName}.${ctx.fileExtension}.json`,
          `${JSON.stringify(
            {
              formatVersion: '1',
              header,
              generalInformation: {
                sourceOrigin: metadata.sourceOrigin ?? 'abapDevelopmentTools',
                sourceType: metadata.sourceType ?? 'definition',
              },
            },
            null,
            2,
          )}\n`,
        ),
      );

      return files;
    },

    setSources: (obj, sources) => {
      if (sources.main !== undefined) {
        (obj as unknown as { _pendingSource: string })._pendingSource =
          sources.main;
      }
    },
  },
);
