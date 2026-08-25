import { FormatMaterializationError } from '@abapify/adt-plugin';
import type { SerializedFile } from './base';

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

/**
 * Build an AFF JSON metadata file with extra top-level fields.
 * Used by SRVD (generalInformation) and DDLS (sourceOrigin/sourceType).
 */
export function buildAffJsonWithExtra(
  description: string,
  originalLanguage: string,
  abapLanguageVersion: string | undefined,
  extra: Record<string, unknown>,
): string {
  const header = {
    description,
    originalLanguage: originalLanguage.toLowerCase(),
    ...(abapLanguageVersion ? { abapLanguageVersion } : {}),
  };
  return `${JSON.stringify({ formatVersion: '1', header, ...extra }, null, 2)}\n`;
}

/**
 * Create the source file for an AFF handler if the source should be
 * included. Returns an empty array if the source is absent or empty.
 */
export function createAffSourceFile(
  ctx: {
    getObjectName: (obj: unknown) => string;
    fileExtension: string;
    createFile: (path: string, content: string) => SerializedFile;
  },
  object: unknown,
  source: string | undefined,
  suppliedSource: string | undefined,
  sourceExt: string,
): SerializedFile[] {
  if (source !== undefined && (suppliedSource !== undefined || source !== '')) {
    const name = ctx.getObjectName(object);
    return [
      ctx.createFile(`${name}.${ctx.fileExtension}.${sourceExt}`, source),
    ];
  }
  return [];
}

/**
 * Shared `getSource` handler function for source-driven AFF objects
 * (BDEF, SRVD). Delegates to `obj.getSource()` when available.
 */
export function affGetSource(obj: SourceObject): Promise<string> {
  return typeof obj?.getSource === 'function'
    ? Promise.resolve(obj.getSource())
    : Promise.resolve('');
}

/**
 * Shared `fromAbapGit` handler function for source-driven AFF objects.
 * Extracts the uppercased name from the SKEY envelope.
 */
export function affFromAbapGit(SKEY: { NAME?: string } | undefined): {
  name: string;
} {
  return { name: String(SKEY?.NAME ?? '').toUpperCase() };
}

/**
 * Shared `setSources` handler function for source-driven AFF objects.
 * Stores the `main` source on a `_pendingSource` property.
 */
export function affSetSources(obj: unknown, sources: { main?: string }): void {
  if (sources.main !== undefined) {
    (obj as unknown as { _pendingSource: string })._pendingSource =
      sources.main;
  }
}
