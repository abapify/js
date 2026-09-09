import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { affFromAffJson } from '../source-resolver';

type ChkvLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
};

export const checkVariantHandler = createHandler<ChkvLike, typeof bdef>(
  'CHKV',
  {
    schema: bdef,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_CHKV',
    serializer_version: 'v1.0.0',
    toAbapGit: (obj) => ({
      SKEY: { TYPE: 'CHKV', NAME: String(obj?.name ?? '').toUpperCase() },
    }),
    fromAffJson: (json) => affFromAffJson(json, ''),
    async serialize(object, ctx): Promise<SerializedFile[]> {
      const header = {
        description: object.description || String(object.name ?? ''),
        originalLanguage: (object.originalLanguage ?? 'en').toLowerCase(),
      };
      return [
        ctx.createFile(
          `${ctx.getObjectName(object)}.chkv.json`,
          `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
        ),
      ];
    },
  },
);
