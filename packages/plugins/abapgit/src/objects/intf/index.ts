/**
 * INTF (Interface) object serializer for abapGit format
 * Maps ADK Interface objects to abapGit XML structure
 */

import type { Interface } from '@abapify/adk';
import { createSerializer } from '../../lib/create-serializer.js';
import { AbapGitIntfValuesSchema } from './schema.js';
import type { VseoInterfTable } from './types.js';

/**
 * Map ADK Interface to abapGit VSEOINTERF structure
 */
function mapInterfaceToAbapGit(intf: Interface): VseoInterfTable {
  const data = intf.getData();

  return {
    CLSNAME: data.name || '',
    LANGU: 'E',
    DESCRIPT: data.description || '',
    EXPOSURE: '2', // 2 = Public
    STATE: '1', // 1 = Active
    UNICODE: 'X',
  };
}

/**
 * Serialize ADK Interface to abapGit XML
 */
export const serializeInterface = createSerializer({
  valuesSchema: AbapGitIntfValuesSchema,
  mapper: mapInterfaceToAbapGit,
  serializerClass: 'LCL_OBJECT_INTF',
});
