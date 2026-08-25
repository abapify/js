import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import {
  resolveMainSource,
  buildAffJsonMetadata,
  createAffSourceFile,
} from '../source-resolver';
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
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const source = await resolveMainSource(object, options?.sources, type);
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
          buildAffJsonMetadata(
            object.description || String(object.name ?? ''),
            object.originalLanguage ?? 'EN',
            object.abapLanguageVersion,
          ),
        ),
      ];
    },
  });
}
