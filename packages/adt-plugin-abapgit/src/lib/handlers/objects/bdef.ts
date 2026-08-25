/**
 * BDEF (RAP Behavior Definition) object handler for abapGit format
 *
 * BDEF is source-driven: the semantic content lives in an `.abdl` file and
 * the official ABAP File Format stores its metadata in a `.json` sidecar.
 *
 * File layout:
 *   src/zbp_foo.bdef.abdl — behavior source text
 *   src/zbp_foo.bdef.json — ABAP File Formats metadata
 */

import { bdef } from '../../../schemas/generated';
import { createHandler } from '../base';
import {
  serializeAffSource,
  affGetSource,
  affFromAbapGit,
  affSetSources,
} from '../source-resolver';
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

    getSource: affGetSource,
    fromAbapGit: ({ SKEY }) => affFromAbapGit(SKEY),

    serialize: (object, ctx, options?: FormatSerializeOptions) =>
      serializeAffSource(object, ctx, options?.sources, {
        typeLabel: 'BDEF',
        sourceExt: 'abdl',
        jsonExt: `${ctx.fileExtension}.json`,
      }),

    setSources: affSetSources,
  },
);
