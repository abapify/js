/**
 * SRVD (RAP Service Definition) object handler for abapGit format
 *
 * SRVD is source-driven: the semantic content lives in an `.acds` file and
 * the official ABAP File Format stores its metadata in a `.json` sidecar.
 *
 * File layout:
 *   src/zui_foo.srvd.acds — service source text
 *   src/zui_foo.srvd.json — ABAP File Formats metadata
 */

import { srvd } from '../../../schemas/generated';
import { createHandler } from '../base';
import {
  serializeAffSource,
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

    getSource: affGetSource,
    fromAbapGit: ({ SKEY }) => affFromAbapGit(SKEY),

    serialize: (object, ctx, options?: FormatSerializeOptions) =>
      serializeAffSource(object, ctx, options?.sources, {
        typeLabel: 'SRVD',
        sourceExt: 'acds',
        jsonExt: `${ctx.fileExtension}.json`,
        extra: {
          generalInformation: {
            sourceOrigin: object.sourceOrigin ?? 'abapDevelopmentTools',
            sourceType: object.sourceType ?? 'definition',
          },
        },
      }),

    setSources: affSetSources,
  },
);
