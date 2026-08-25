/**
 * BDEF (RAP Behavior Definition) object handler for abapGit format
 *
 * BDEF is source-driven: the semantic content lives in an `.abdl` file and
 * the official ABAP File Format stores its metadata in a `.json` sidecar.
 *
 * File layout:
 *   src/zbp_foo.bdef.abdl — behavior source text
 *   src/zbp_foo.bdef.json — ABAP File Formats metadata
 *
 * The handler uses the string form of `createHandler` ('BDEF') because
 * the ADK object (`AdkBehaviorDefinition`) is a lightweight class without
 * the AdkObject save/lock machinery — all lifecycle is source-based.
 *
 * We override `serialize` because this AFF layout is JSON rather than the
 * legacy abapGit XML envelope.
 */

import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import {
  FormatMaterializationError,
  type FormatSerializeOptions,
} from '@abapify/adt-plugin';

// BDEF is not derived from AdkObject — we cast to the minimal handler shape
// via the string form of createHandler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BdefLike = any;

type BdefSourceObject = { getSource?: () => Promise<string> | string };

async function resolveBdefSource(
  object: BdefSourceObject,
  sources: Readonly<Record<string, string | undefined>> | undefined,
): Promise<string | undefined> {
  if (sources !== undefined) {
    const keys = Object.keys(sources);
    if (keys.some((key) => key !== 'main')) {
      throw new FormatMaterializationError(
        'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
        `BDEF only supports the 'main' source component; received ${keys.join(', ')}.`,
      );
    }
    return sources.main;
  }
  return typeof object?.getSource === 'function'
    ? await object.getSource()
    : '';
}

export const behaviorDefinitionHandler = createHandler<BdefLike, typeof bdef>(
  'BDEF',
  {
    schema: bdef,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_BDEF',
    serializer_version: 'v1.0.0',

    toAbapGit: (obj) => ({
      SKEY: {
        TYPE: 'BDEF',
        NAME: String(obj?.name ?? '').toUpperCase(),
      },
    }),

    // Source is `.abdl` text retrieved from ADT `source/main`.
    getSource: (obj) =>
      typeof obj?.getSource === 'function'
        ? obj.getSource()
        : Promise.resolve(''),

    fromAbapGit: ({ SKEY }) => ({
      name: String(SKEY?.NAME ?? '').toUpperCase(),
    }),

    // Custom serialize — official BDEF AFF is `.abdl` plus `.json`.
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const files: SerializedFile[] = [];
      const objectName = ctx.getObjectName(object);

      // Source: <name>.bdef.abdl. When a source map is supplied it is
      // authoritative; otherwise fall back to the mutable object getter.
      const source = await resolveBdefSource(object, options?.sources);
      if (shouldIncludeSource(source, options?.sources?.main)) {
        files.push(
          ctx.createFile(`${objectName}.${ctx.fileExtension}.abdl`, source),
        );
      }

      // Metadata: <name>.bdef.json
      const metadata = object as {
        description?: string;
        originalLanguage?: string;
        abapLanguageVersion?: string;
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
          `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
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
