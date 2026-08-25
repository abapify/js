import { dcls } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';

type DclsLike = {
  name?: string;
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
        ? [ctx.createFile(`${name}.dcls.acds`, source)]
        : []),
      ctx.createFile(
        `${name}.dcls.json`,
        `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
      ),
    ];
  },
});
