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
import { resolveMainSource, buildAffJsonMetadata } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type BdefLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

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
      const source = await resolveMainSource(object, options?.sources, 'BDEF');
      if (shouldIncludeSource(source, options?.sources?.main)) {
        files.push(
          ctx.createFile(`${objectName}.${ctx.fileExtension}.abdl`, source),
        );
      }

      // Metadata: <name>.bdef.json
      files.push(
        ctx.createFile(
          `${objectName}.${ctx.fileExtension}.json`,
          buildAffJsonMetadata(
            object.description || String(object?.name ?? ''),
            object.originalLanguage ?? 'en',
            object.abapLanguageVersion,
          ),
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
