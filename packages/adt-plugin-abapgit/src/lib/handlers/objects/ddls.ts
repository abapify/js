import { ddls } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import {
  resolveMainSource,
  buildAffJson,
  createAffSourceFile,
} from '../source-resolver';
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
        `${objectName}.ddls.json`,
        buildAffJson(
          object.description || String(object.name ?? ''),
          object.originalLanguage ?? 'en',
          object.abapLanguageVersion,
          {
            sourceOrigin: object.sourceOrigin ?? 'abapDevelopmentTools',
            sourceType: object.sourceType ?? 'unknown',
          },
        ),
      ),
    ];
  },
});
