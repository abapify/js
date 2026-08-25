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
import {
  resolveMainSource,
  buildAffJsonWithExtra,
  createAffSourceFile,
  affGetSource,
  affFromAbapGit,
  affSetSources,
} from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type SrvdLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  sourceOrigin?: string;
  sourceType?: string;
  getSource?: () => Promise<string> | string;
};

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
    getSource: affGetSource,

    fromAbapGit: ({ SKEY }) => affFromAbapGit(SKEY),

    // Custom serialize — official SRVD AFF is `.acds` plus `.json`.
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const source = await resolveMainSource(object, options?.sources, 'SRVD');
      const objectName = ctx.getObjectName(object);
      return [
        ...createAffSourceFile(
          ctx,
          object,
          source,
          options?.sources?.main,
          'acds',
        ),
        ctx.createFile(
          `${objectName}.${ctx.fileExtension}.json`,
          buildAffJsonWithExtra(
            object.description || String(object?.name ?? ''),
            object.originalLanguage ?? 'en',
            object.abapLanguageVersion,
            {
              generalInformation: {
                sourceOrigin: object.sourceOrigin ?? 'abapDevelopmentTools',
                sourceType: object.sourceType ?? 'definition',
              },
            },
          ),
        ),
      ];
    },

    setSources: affSetSources,
  },
);
