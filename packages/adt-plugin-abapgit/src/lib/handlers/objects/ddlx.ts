import { ddlx } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import { resolveMainSource, buildAffJsonMetadata } from '../source-resolver';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';

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
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const source = await resolveMainSource(object, options?.sources, 'DDLX');
      const name = ctx.getObjectName(object);
      return [
        ...(shouldIncludeSource(source, options?.sources?.main)
          ? [ctx.createFile(`${name}.ddlx.acds`, source)]
          : []),
        ctx.createFile(
          `${name}.ddlx.json`,
          buildAffJsonMetadata(
            object.description || String(object.name ?? ''),
            object.originalLanguage ?? 'en',
            object.abapLanguageVersion,
          ),
        ),
      ];
    },
  },
);
