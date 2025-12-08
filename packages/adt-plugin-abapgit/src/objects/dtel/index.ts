/**
 * DTEL (Data Element) object serializer for abapGit format
 * Maps ADK v2 objects to abapGit XML structure
 */

import type { AdkObject } from '@abapify/adk';
import { dtel } from '../../schemas/generated';
import { buildAbapGitEnvelope } from '../../lib/shared-schema';

/**
 * Serialize ADK Data Element to abapGit XML
 *
 * Note: DataElement doesn't have full ADK v2 support yet, so we work with
 *       generic AdkObject and extract what we can from basic properties
 */
export function serializeDataElement(dtelObj: AdkObject): string {
  const data = {
    ROLLNAME: dtelObj.name || '',
    DDLANGUAGE: 'E',
    DDTEXT: dtelObj.description || '',
    HEADLEN: '55',
    SCRLEN1: '10',
    SCRLEN2: '20',
    SCRLEN3: '40',
    DTELMASTER: 'E',
  };
  
  // Use ts-xsd schema to build the inner content
  const innerXml = dtel.build(data);
  
  // Wrap in abapGit envelope
  return buildAbapGitEnvelope(innerXml, 'LCL_OBJECT_DTEL');
}
