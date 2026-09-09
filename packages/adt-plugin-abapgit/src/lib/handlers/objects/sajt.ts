import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { affFromAffJson } from '../source-resolver';

type SajtLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
};

export const jobTemplateHandler = createHandler<SajtLike, typeof bdef>(
  'SAJT',
  {
    schema: bdef,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_SAJT',
    serializer_version: 'v1.0.0',
    toAbapGit: (obj) => ({
      SKEY: { TYPE: 'SAJT', NAME: String(obj?.name ?? '').toUpperCase() },
    }),
    fromAffJson: (json) => affFromAffJson(json, ''),
    async serialize(object, ctx): Promise<SerializedFile[]> {
      const header = {
        description: object.description || String(object.name ?? ''),
        originalLanguage: (object.originalLanguage ?? 'en').toLowerCase(),
      };
      return [
        ctx.createFile(
          `${ctx.getObjectName(object)}.sajt.json`,
          `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
        ),
      ];
    },
  },
);
