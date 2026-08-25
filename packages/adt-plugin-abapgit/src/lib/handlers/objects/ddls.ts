import { ddls } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';

type DdlsLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  sourceOrigin?: string;
  sourceType?: string;
  getSource?: () => Promise<string> | string;
};

export const ddlSourceHandler = createHandler<DdlsLike, typeof ddls>('DDLS', {
  schema: ddls,
  version: 'v1.0.0',
  serializer: 'LCL_OBJECT_DDLS',
  serializer_version: 'v1.0.0',
  toAbapGit: (obj) => ({
    SKEY: { TYPE: 'DDLS', NAME: String(obj?.name ?? '').toUpperCase() },
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
        ? [ctx.createFile(`${name}.ddls.acds`, source)]
        : []),
      ctx.createFile(
        `${name}.ddls.json`,
        `${JSON.stringify({ formatVersion: '1', header, sourceOrigin: object.sourceOrigin ?? 'abapDevelopmentTools', sourceType: object.sourceType ?? 'unknown' }, null, 2)}\n`,
      ),
    ];
  },
});
