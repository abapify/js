import { ddlx } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';

type DdlxLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

export const ddlExtensionHandler = createHandler<DdlxLike, typeof ddlx>(
  'DDLX',
  {
    schema: ddlx,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_DDLX',
    serializer_version: 'v1.0.0',
    toAbapGit: (obj) => ({
      SKEY: { TYPE: 'DDLX', NAME: String(obj?.name ?? '').toUpperCase() },
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
          ? [ctx.createFile(`${name}.ddlx.acds`, source)]
          : []),
        ctx.createFile(
          `${name}.ddlx.json`,
          `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
        ),
      ];
    },
  },
);
