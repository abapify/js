/**
 * SRVD (RAP Service Definition) object handler for abapGit format
 *
 * SRVD is source-driven: the semantic content lives in a `.asrvd` file
 * (CDS-like service definition) and abapGit stores it alongside
 * a minimal SKEY metadata block.
 *
 * File layout:
 *   src/zui_foo.srvd.asrvd   — service source (.asrvd text)
 *   src/zui_foo.srvd.xml     — minimal metadata wrapper
 *
 * The handler uses the string form of `createHandler` ('SRVD') because
 * the ADK object (`AdkServiceDefinition`) is a lightweight class without
 * the AdkObject save/lock machinery — all lifecycle is source-based.
 *
 * We override `serialize` so the source file gets the `.asrvd` extension
 * instead of the default `.abap`.
 */

import { srvd } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

// SRVD is not derived from AdkObject — we cast to the minimal handler shape
// via the string form of createHandler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SrvdLike = any;

type SrvdSourceObject = { getSource?: () => Promise<string> | string };

async function resolveSrvdSource(
  object: SrvdSourceObject,
  suppliedSource: string | undefined,
): Promise<string | undefined> {
  if (suppliedSource !== undefined) return suppliedSource;
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

    // Source is `.asrvd` text retrieved from ADT `source/main`.
    getSource: (obj) =>
      typeof obj?.getSource === 'function'
        ? obj.getSource()
        : Promise.resolve(''),

    fromAbapGit: ({ SKEY }) => ({
      name: String(SKEY?.NAME ?? '').toUpperCase(),
    }),

    // Custom serialize — file extension for SRVD source is `.asrvd`, not `.abap`.
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const files: SerializedFile[] = [];
      const objectName = ctx.getObjectName(object);

      // Source: <name>.srvd.asrvd. Respect explicitly supplied sources first,
      // then fall back to the mutable object getter.
      const suppliedSource = options?.sources?.main;
      let source: string | undefined;
      try {
        source = await resolveSrvdSource(object, suppliedSource);
      } catch {
        // Source not available — skip
      }
      if (shouldIncludeSource(source, suppliedSource)) {
        files.push(
          ctx.createFile(`${objectName}.${ctx.fileExtension}.asrvd`, source),
        );
      }

      // Metadata: <name>.srvd.xml
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
