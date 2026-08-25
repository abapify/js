import { ddlx } from '../../../schemas/generated';
import { createHandler } from '../base';
import { serializeAffSource } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type DdlxLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

export const ddlExtensionHandler = createHandler<DdlxLike, typeof ddlx>(
  'DDLX',
  {
    schema: ddlx,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_DDLX',
    serializer_version: 'v1.0.0',
    toAbapGit: (obj) => ({
      SKEY: { TYPE: 'DDLX', NAME: String(obj?.name ?? '').toUpperCase() },
    }),
    serialize: (object, ctx, options?: FormatSerializeOptions) =>
      serializeAffSource(object, ctx, options?.sources, {
        typeLabel: 'DDLX',
        sourceExt: 'acds',
        jsonExt: 'ddlx.json',
      }),
  },
);
