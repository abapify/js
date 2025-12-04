/**
 * INTF (Interface) object serializer for abapGit format
 * Maps ADK v2 Interface objects to abapGit XML structure
 */

import type { AdkInterface } from '@abapify/adk-v2';
import { createSerializer } from '../../lib/create-serializer';
import { AbapGitIntfValuesSchema } from './schema';
import type { VseoInterfTable } from './types';

/**
 * Map ADK v2 Interface to abapGit VSEOINTERF structure
 */
function mapInterfaceToAbapGit(intf: AdkInterface): VseoInterfTable {
  // Access properties directly from AdkInterface
  return {
    CLSNAME: intf.name || '',
    LANGU: 'E',
    DESCRIPT: intf.description || '',
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
