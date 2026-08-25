import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';

type CdsAffSourceObject = {
  name?: string;
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
    async serialize(object, ctx): Promise<SerializedFile[]> {
      const source =
        typeof object.getSource === 'function' ? await object.getSource() : '';
      const name = ctx.getObjectName(object);
      const header = {
        description: object.description || String(object.name ?? ''),
        originalLanguage: (object.originalLanguage ?? 'en').toLowerCase(),
        ...(object.abapLanguageVersion
          ? { abapLanguageVersion: object.abapLanguageVersion }
          : {}),
      };
      return [
        ...(shouldIncludeSource(source)
          ? [ctx.createFile(`${name}.${ctx.fileExtension}.acds`, source)]
          : []),
        ctx.createFile(
          `${name}.${ctx.fileExtension}.json`,
          `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
        ),
      ];
    },
  });
}
