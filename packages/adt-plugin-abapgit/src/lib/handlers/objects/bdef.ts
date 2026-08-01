/**
 * BDEF (RAP Behavior Definition) object handler for abapGit format
 *
 * BDEF is source-driven: the semantic content lives in a `.abdl` file
 * (the RAP behavior definition language) and abapGit stores it alongside
 * a minimal SKEY metadata block.
 *
 * File layout:
 *   src/zbp_foo.bdef.abdl   — behavior source (.abdl text)
 *   src/zbp_foo.bdef.xml    — minimal metadata wrapper
 *
 * The handler uses the string form of `createHandler` ('BDEF') because
 * the ADK object (`AdkBehaviorDefinition`) is a lightweight class without
 * the AdkObject save/lock machinery — all lifecycle is source-based.
 *
 * We override `serialize` so the source file gets the `.abdl` extension
 * instead of the default `.abap`.
 */

import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

// BDEF is not derived from AdkObject — we cast to the minimal handler shape
// via the string form of createHandler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BdefLike = any;

type BdefSourceObject = { getSource?: () => Promise<string> | string };

async function resolveBdefSource(
  object: BdefSourceObject,
  suppliedSource: string | undefined,
): Promise<string | undefined> {
  if (suppliedSource !== undefined) return suppliedSource;
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

    // Custom serialize — file extension for BDEF source is `.abdl`, not `.abap`.
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const files: SerializedFile[] = [];
      const objectName = ctx.getObjectName(object);

      // Source: <name>.bdef.abdl. Respect explicitly supplied sources first,
      // then fall back to the mutable object getter.
      const suppliedSource = options?.sources?.main;
      let source: string | undefined;
      try {
        source = await resolveBdefSource(object, suppliedSource);
      } catch {
        // Source not available — skip
      }
      if (shouldIncludeSource(source, suppliedSource)) {
        files.push(
          ctx.createFile(`${objectName}.${ctx.fileExtension}.abdl`, source),
        );
      }

      // Metadata: <name>.bdef.xml
      const xmlContent = ctx.toAbapGitXml(object);
      files.push(
        ctx.createFile(`${objectName}.${ctx.fileExtension}.xml`, xmlContent),
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
