/**
 * DEVC (Package) object serializer for abapGit format
 * Maps ADK v2 Package objects to abapGit XML structure
 */

import type { AdkPackage } from '@abapify/adk';
import { devc } from '../../schemas/generated';
import { buildAbapGitEnvelope } from '../../lib/shared-schema';

/**
 * Serialize ADK Package to abapGit XML
 * Note: DEVCLASS is not included in abapGit package.devc.xml files (only CTEXT)
 */
export function serializePackage(pkg: AdkPackage): string {
  const data = {
    CTEXT: pkg.description || '',
  };
  
  // Use ts-xsd schema to build the inner content
  const innerXml = devc.build(data);
  
  // Wrap in abapGit envelope
  return buildAbapGitEnvelope(innerXml, 'LCL_OBJECT_DEVC');
}
