import { ddls } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import { resolveMainSource, buildAffJsonMetadata } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

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
  async serialize(
    object,
    ctx,
    options?: FormatSerializeOptions,
  ): Promise<SerializedFile[]> {
    const source = await resolveMainSource(object, options?.sources, 'DDLS');
    const name = ctx.getObjectName(object);
    return [
      ...(shouldIncludeSource(source, options?.sources?.main)
        ? [ctx.createFile(`${name}.ddls.acds`, source)]
        : []),
      ctx.createFile(
        `${name}.ddls.json`,
        `${JSON.stringify(
          {
            formatVersion: '1',
            header: {
              description: object.description || String(object.name ?? ''),
              originalLanguage: (object.originalLanguage ?? 'en').toLowerCase(),
              ...(object.abapLanguageVersion
                ? { abapLanguageVersion: object.abapLanguageVersion }
                : {}),
            },
            sourceOrigin: object.sourceOrigin ?? 'abapDevelopmentTools',
            sourceType: object.sourceType ?? 'unknown',
          },
          null,
          2,
        )}\n`,
      ),
    ];
  },
});
