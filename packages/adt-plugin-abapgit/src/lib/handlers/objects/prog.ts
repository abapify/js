/**
 * Program (PROG) object handler for abapGit format
 */

import { AdkProgram } from '../adk';
import { prog } from '../../../schemas/generated';
import { createHandler } from '../base';

export const programHandler = createHandler(AdkProgram, {
  schema: prog,
  version: 'v1.0.0',
  serializer: 'LCL_OBJECT_PROG',
  serializer_version: 'v1.0.0',

  // SAP → Git: Map ADK object to abapGit values
  toAbapGit: (obj) => ({
    TRDIR: {
      NAME: obj.name ?? '',
      SECU: 'S',
      EDTX: 'X',
      SUBC: '1',
    },
  }),

  // Single source file
  getSource: (obj) => obj.getSource(),

  // Git → SAP: Map abapGit values to ADK data
  fromAbapGit: ({ TRDIR }) => ({
    name: (TRDIR?.NAME ?? '').toUpperCase(),
    type: 'PROG/P',
    description: undefined,
  }),

  // Git → SAP: Set source files on ADK object
  // Note: `_pendingSource` is not declared on the public ADK interface —
  // it is an implementation detail for deferred source saving.
  // The `as unknown as` double cast is the established pattern in this codebase.
  setSources: (obj, sources) => {
    if (sources.main) {
      (obj as unknown as { _pendingSource: string })._pendingSource =
        sources.main;
    }
  },
});
