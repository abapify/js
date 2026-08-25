import { dcls } from '../../../schemas/generated';
import { createHandler } from '../base';
import { serializeAffSource } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type DclsLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

export const dclSourceHandler = createHandler<DclsLike, typeof dcls>('DCLS', {
  schema: dcls,
  version: 'v1.0.0',
  serializer: 'LCL_OBJECT_DCLS',
  serializer_version: 'v1.0.0',
  toAbapGit: (obj) => ({
    SKEY: { TYPE: 'DCLS', NAME: String(obj?.name ?? '').toUpperCase() },
  }),
  serialize: (object, ctx, options?: FormatSerializeOptions) =>
    serializeAffSource(object, ctx, options?.sources, {
      typeLabel: 'DCLS',
      sourceExt: 'acds',
      jsonExt: 'dcls.json',
    }),
});
