import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { affFromAffJson } from '../source-resolver';

type UistLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
};

export const launchpadSpaceTemplateHandler = createHandler<UistLike, typeof bdef>(
  'UIST',
  {
    schema: bdef,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_UIST',
    serializer_version: 'v1.0.0',
    toAbapGit: (obj) => ({
      SKEY: { TYPE: 'UIST', NAME: String(obj?.name ?? '').toUpperCase() },
    }),
    fromAffJson: (json) => affFromAffJson(json, ''),
    async serialize(object, ctx): Promise<SerializedFile[]> {
      const header = {
        description: object.description || String(object.name ?? ''),
        originalLanguage: (object.originalLanguage ?? 'en').toLowerCase(),
      };
      return [
        ctx.createFile(
          `${ctx.getObjectName(object)}.uist.json`,
          `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
        ),
      ];
    },
  },
);
