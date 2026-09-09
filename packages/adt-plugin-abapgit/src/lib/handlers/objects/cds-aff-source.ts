import { bdef } from '../../../schemas/generated';
import { createHandler } from '../base';
import {
  serializeDualFormat,
  affGetSource,
  affFromAbapGit,
  affSetSources,
  affFromAffJson,
} from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type CdsAffSourceObject = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

/** Create the shared dual-format source-and-metadata layout used by CDS source types.
 * Supports both AFF JSON (default) and legacy abapGit XML metadata. */
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
    getSource: affGetSource,
    fromAbapGit: ({ SKEY }) => affFromAbapGit(SKEY),
    fromAffJson: (json) => affFromAffJson(json, ''),
    setSources: affSetSources,
    serialize: (object, ctx, options?: FormatSerializeOptions) =>
      serializeDualFormat(object, ctx, options, {
        typeLabel: type,
        sourceExt: 'acds',
        jsonExt: `${ctx.fileExtension}.json`,
      }),
  });
}
