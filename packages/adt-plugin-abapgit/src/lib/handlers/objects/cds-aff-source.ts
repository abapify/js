import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { shouldIncludeSource } from '../source-inclusion';
import {
  FormatMaterializationError,
  type FormatSerializeOptions,
} from '@abapify/adt-plugin';

type CdsAffSourceObject = {
  name: string;
  description?: string;
  originalLanguage?: string;
  abapLanguageVersion?: string;
  getSource?: () => Promise<string> | string;
};

/** Resolve the source component, rejecting keys other than `main`. */
async function resolveCdsAffSource(
  object: CdsAffSourceObject,
  sources: Readonly<Record<string, string | undefined>> | undefined,
): Promise<string | undefined> {
  if (sources !== undefined) {
    const keys = Object.keys(sources);
    if (keys.some((key) => key !== 'main')) {
      throw new FormatMaterializationError(
        'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
        `CDS AFF source only supports the 'main' source component; received ${keys.join(', ')}.`,
      );
    }
    return sources.main;
  }
  return typeof object.getSource === 'function' ? await object.getSource() : '';
}

/** Create the shared AFF source-and-metadata layout used by CDS source types. */
export function createCdsAffSourceHandler(
  type: 'DRAS' | 'DRTY' | 'DSFD' | 'DTEB' | 'DTDC' | 'DTIX' | 'DTSC',
) {
  return createHandler<CdsAffSourceObject, typeof bdef>(type, {
    schema: bdef,
    version: 'v1.0.0',
    serializer: `LCL_OBJECT_${type}`,
    serializer_version: 'v1.0.0',
    toAbapGit: (obj) => ({
      SKEY: { TYPE: type, NAME: String(obj?.name ?? '').toUpperCase() },
    }),
    async serialize(
      object,
      ctx,
      options?: FormatSerializeOptions,
    ): Promise<SerializedFile[]> {
      const source = await resolveCdsAffSource(object, options?.sources);
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
          ? [ctx.createFile(`${name}.${ctx.fileExtension}.acds`, source)]
          : []),
        ctx.createFile(
          `${name}.${ctx.fileExtension}.json`,
          `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`,
        ),
      ];
    },
  });
}
