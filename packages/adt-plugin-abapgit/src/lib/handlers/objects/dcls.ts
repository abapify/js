/**
 * DCLS (ABAP Data Control Language Source) object handler for abapGit format
 *
 * DCLS is source-driven: the semantic content lives in an `.acds` file.
 * Supports BOTH formats:
 *   - AFF (default): `.dcls.acds` source + `.dcls.json` metadata sidecar
 *   - Legacy XML:    `.dcls.acds` source + `.dcls.xml` metadata
 */

import { dcls } from '../../../schemas/generated';
import { createHandler } from '../base';
import {
  serializeDualFormat,
  affGetSource,
  affFromAbapGit,
  affSetSources,
  affFromAffJson,
} from '../source-resolver';
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
  getSource: affGetSource,
  fromAbapGit: ({ SKEY }) => affFromAbapGit(SKEY),
  fromAffJson: (json) => affFromAffJson(json, ''),
  serialize: (object, ctx, options?: FormatSerializeOptions) =>
    serializeDualFormat(object, ctx, options, {
      typeLabel: 'DCLS',
      sourceExt: 'acds',
      jsonExt: 'dcls.json',
    }),
  setSources: affSetSources,
});
