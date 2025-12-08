/**
 * INTF (Interface) object serializer for abapGit format
 * Maps ADK v2 Interface objects to abapGit XML structure
 */

import type { AdkInterface } from '@abapify/adk';
import { intf } from '../../schemas/generated';
import { buildAbapGitEnvelope } from '../../lib/shared-schema';

/**
 * Serialize ADK Interface to abapGit XML
 */
export function serializeInterface(intfObj: AdkInterface): string {
  const data = {
    CLSNAME: intfObj.name || '',
    LANGU: 'E',
    DESCRIPT: intfObj.description || '',
    EXPOSURE: '2', // 2 = Public
    STATE: '1', // 1 = Active
    UNICODE: 'X',
  };
  
  // Use ts-xsd schema to build the inner content
  const innerXml = intf.build(data);
  
  // Wrap in abapGit envelope
  return buildAbapGitEnvelope(innerXml, 'LCL_OBJECT_INTF');
}
