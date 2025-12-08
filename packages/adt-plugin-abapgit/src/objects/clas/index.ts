/**
 * CLAS (Class) object serializer for abapGit format
 * Maps ADK v2 Class objects to abapGit XML structure
 */

import type { AdkClass } from '@abapify/adk';
import { clas } from '../../schemas/generated';
import { buildAbapGitEnvelope } from '../../lib/shared-schema';

/**
 * Serialize ADK Class to abapGit XML
 */
export function serializeClass(cls: AdkClass): string {
  const adkData = cls.dataSync;

  // Check if class has test classes
  const hasTestClasses = adkData.include?.some(
    (inc: any) => inc.includeType === 'testclasses'
  );

  const data = {
    CLSNAME: adkData.name || '',
    LANGU: 'E',
    DESCRIPT: adkData.description || '',
    STATE: '1',
    CLSCCINCL: 'X',
    FIXPT: 'X',
    UNICODE: 'X',
    ...(hasTestClasses ? { WITH_UNIT_TESTS: 'X' } : {}),
  };
  
  // Use ts-xsd schema to build the inner content
  const innerXml = clas.build(data);
  
  // Wrap in abapGit envelope
  return buildAbapGitEnvelope(innerXml, 'LCL_OBJECT_CLAS');
}
