import { dcls } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import { resolveMainSource, buildAffJsonMetadata } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

type DclsLike = {
  name: string;
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
  async serialize(
    object,
    ctx,
    options?: FormatSerializeOptions,
  ): Promise<SerializedFile[]> {
    const source = await resolveMainSource(object, options?.sources, 'DCLS');
    const name = ctx.getObjectName(object);
    return [
      ...(shouldIncludeSource(source, options?.sources?.main)
        ? [ctx.createFile(`${name}.dcls.acds`, source)]
        : []),
      ctx.createFile(
        `${name}.dcls.json`,
        buildAffJsonMetadata(
          object.description || String(object.name ?? ''),
          object.originalLanguage ?? 'EN',
          object.abapLanguageVersion,
        ),
      ),
    ];
  },
});
