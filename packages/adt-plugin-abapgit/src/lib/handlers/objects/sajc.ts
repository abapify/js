import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { affFromAffJson } from '../source-resolver';

type SajcLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
};

export const jobCatalogHandler = createHandler<SajcLike, typeof bdef>('SAJC', {
  schema: bdef,
  version: 'v1.0.0',
  serializer: 'LCL_OBJECT_SAJC',
  serializer_version: 'v1.0.0',
  toAbapGit: (obj) => ({
    SKEY: { TYPE: 'SAJC', NAME: String(obj?.name ?? '').toUpperCase() },
  }),
  fromAffJson: (json) => affFromAffJson(json, ''),
  async serialize(object, ctx): Promise<SerializedFile[]> {
    const header = {
      description: object.description || String(object.name ?? ''),
      originalLanguage: (object.originalLanguage ?? 'en').toLowerCase(),
    };
    return [
      ctx.createFile(
        `${ctx.getObjectName(object)}.sajc.json`,
        `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
      ),
    ];
  },
});
