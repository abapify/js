import { dcls } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import {
  FormatMaterializationError,
  type FormatSerializeOptions,
} from '@abapify/adt-plugin';

type DclsLike = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

/** Resolve the source component, rejecting keys other than `main`. */
async function resolveDclsSource(
  object: DclsLike,
  sources: Readonly<Record<string, string | undefined>> | undefined,
): Promise<string | undefined> {
  if (sources !== undefined) {
    const keys = Object.keys(sources);
    if (keys.some((key) => key !== 'main')) {
      throw new FormatMaterializationError(
        'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
        `DCLS only supports the 'main' source component; received ${keys.join(', ')}.`,
      );
    }
    return sources.main;
  }
  return typeof object.getSource === 'function' ? await object.getSource() : '';
}

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
    const source = await resolveDclsSource(object, options?.sources);
    const name = ctx.getObjectName(object);
    const header = {
      description: object.description || String(object.name ?? ''),
      originalLanguage: (object.originalLanguage ?? 'en').toLowerCase(),
      ...(object.abapLanguageVersion
        ? { abapLanguageVersion: object.abapLanguageVersion }
        : {}),
    };
    return [
      ...(shouldIncludeSource(source, options?.sources?.main)
        ? [ctx.createFile(`${name}.dcls.acds`, source)]
        : []),
      ctx.createFile(
        `${name}.dcls.json`,
        `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
      ),
    ];
  },
});
