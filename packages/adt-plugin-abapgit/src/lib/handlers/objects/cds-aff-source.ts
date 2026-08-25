import { bdef } from '../../../schemas/generated';
import { createHandler } from '../base';
import { serializeAffSource } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type CdsAffSourceObject = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

/** Create the shared AFF source-and-metadata layout used by CDS source types. */
export function createCdsAffSourceHandler(
  type: 'DRAS' | 'DRTY' | 'DSFD' | 'DTEB' | 'DTDC' | 'DTIX' | 'DTSC',
) {
  return createHandler<CdsAffSourceObject, typeof bdef>(type, {
    schema: bdef,
    version: 'v1.0.0',
    serializer: `LCL_OBJECT_${type}`,
    serializer_version: 'v1.0.0',
    toAbapGit: (obj) => ({
      SKEY: { TYPE: type, NAME: String(obj?.name ?? '').toUpperCase() },
    }),
    serialize: (object, ctx, options?: FormatSerializeOptions) =>
      serializeAffSource(object, ctx, options?.sources, {
        typeLabel: type,
        sourceExt: 'acds',
        jsonExt: `${ctx.fileExtension}.json`,
      }),
  });
}
