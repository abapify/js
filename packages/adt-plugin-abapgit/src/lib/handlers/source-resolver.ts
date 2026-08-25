import { FormatMaterializationError } from '@abapify/adt-plugin';

type SourceObject = { getSource?: () => Promise<string> | string };

/**
 * Resolve the `main` source component for an AFF source handler.
 *
 * If `sources` is supplied, only the `main` key is accepted — any other
 * key throws `FORMAT_SOURCE_COMPONENT_UNSUPPORTED`. When `sources` is
 * absent, falls back to `object.getSource()`.
 */
export async function resolveMainSource(
  object: SourceObject,
  sources: Readonly<Record<string, string | undefined>> | undefined,
  typeLabel: string,
): Promise<string | undefined> {
  if (sources !== undefined) {
    const keys = Object.keys(sources);
    if (keys.some((key) => key !== 'main')) {
      throw new FormatMaterializationError(
        'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
        `${typeLabel} only supports the 'main' source component; received ${keys.join(', ')}.`,
      );
    }
    return sources.main;
  }
  return typeof object.getSource === 'function' ? await object.getSource() : '';
}

/**
 * Build the standard AFF JSON metadata file content for a CDS/RAP
 * source object.
 */
export function buildAffJsonMetadata(
  description: string,
  originalLanguage: string,
  abapLanguageVersion?: string,
): string {
  const header = {
    description,
    originalLanguage: originalLanguage.toLowerCase(),
    ...(abapLanguageVersion ? { abapLanguageVersion } : {}),
  };
  return `${JSON.stringify({ formatVersion: '1', header }, null, 2)}\n`;
}
