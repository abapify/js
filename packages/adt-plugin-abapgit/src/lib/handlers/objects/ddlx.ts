/**
 * DDLX (CDS Metadata Extension) object handler for abapGit format
 *
 * DDLX is source-driven: the semantic content lives in an `.acds` file.
 * Supports BOTH formats:
 *   - AFF (default): `.ddlx.acds` source + `.ddlx.json` metadata sidecar
 *   - Legacy XML:    `.ddlx.acds` source + `.ddlx.xml` metadata
 */

import { ddlx } from '../../../schemas/generated';
import { createHandler } from '../base';
import {
  serializeDualFormat,
  affGetSource,
  affFromAbapGit,
  affSetSources,
  affFromAffJson,
} from '../source-resolver';
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
    getSource: affGetSource,
    fromAbapGit: ({ SKEY }) => affFromAbapGit(SKEY),
    fromAffJson: (json) => affFromAffJson(json, ''),
    serialize: (object, ctx, options?: FormatSerializeOptions) =>
      serializeDualFormat(object, ctx, options, {
        typeLabel: 'DDLX',
        sourceExt: 'acds',
        jsonExt: 'ddlx.json',
      }),
    setSources: affSetSources,
  },
);
