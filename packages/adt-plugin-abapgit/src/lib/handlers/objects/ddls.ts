/**
 * DDLS (Data Definition Language Source) object handler for abapGit format
 *
 * DDLS is source-driven: the semantic content lives in an `.acds` file.
 * Supports BOTH formats:
 *   - AFF (default): `.ddls.acds` source + `.ddls.json` metadata sidecar
 *   - Legacy XML:    `.ddls.acds` source + `.ddls.xml` metadata
 */

import { ddls } from '../../../schemas/generated';
import { createHandler } from '../base';
import {
  serializeDualFormat,
  affGetSource,
  affFromAbapGit,
  affSetSources,
  affFromAffJson,
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
  getSource: affGetSource,
  fromAbapGit: ({ SKEY }) => affFromAbapGit(SKEY),
  fromAffJson: (json) => ({
    ...affFromAffJson(json, ''),
    // Preserve DDLS-specific metadata for round-trip
    sourceOrigin: (json as { sourceOrigin?: string })?.sourceOrigin,
    sourceType: (json as { sourceType?: string })?.sourceType,
  }),
  serialize: (object, ctx, options?: FormatSerializeOptions) =>
    serializeDualFormat(object, ctx, options, {
      typeLabel: 'DDLS',
      sourceExt: 'acds',
      jsonExt: 'ddls.json',
      extra: {
        sourceOrigin: object.sourceOrigin ?? 'abapDevelopmentTools',
        sourceType: object.sourceType ?? 'unknown',
      },
    }),
  setSources: affSetSources,
});
