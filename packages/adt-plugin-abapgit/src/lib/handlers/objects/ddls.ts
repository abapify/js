import { ddls } from '../../../schemas/generated';
import { createHandler } from '../base';
import { serializeAffSource } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type DdlsLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  sourceOrigin?: string;
  sourceType?: string;
  getSource?: () => Promise<string> | string;
};

export const ddlSourceHandler = createHandler<DdlsLike, typeof ddls>('DDLS', {
  schema: ddls,
  version: 'v1.0.0',
  serializer: 'LCL_OBJECT_DDLS',
  serializer_version: 'v1.0.0',
  toAbapGit: (obj) => ({
    SKEY: { TYPE: 'DDLS', NAME: String(obj?.name ?? '').toUpperCase() },
  }),
  serialize: (object, ctx, options?: FormatSerializeOptions) =>
    serializeAffSource(object, ctx, options?.sources, {
      typeLabel: 'DDLS',
      sourceExt: 'acds',
      jsonExt: 'ddls.json',
      extra: {
        sourceOrigin: object.sourceOrigin ?? 'abapDevelopmentTools',
        sourceType: object.sourceType ?? 'unknown',
      },
    }),
});
