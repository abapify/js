/**
 * CLAS (Class) object serializer for abapGit format
 * Maps ADK v2 Class objects to abapGit XML structure
 */

import type { AdkClass } from '@abapify/adk-v2';
import { createSerializer } from '../../lib/create-serializer';
import { AbapGitClasValuesSchema } from './schema';
import type { VseoClassTable } from './types';

/**
 * Map ADK v2 Class to abapGit VSEOCLASS structure
 */
function mapClassToAbapGit(cls: AdkClass): VseoClassTable {
  // Access data synchronously - object should already be loaded
  const data = cls.dataSync;

  // Check if class has test classes
  const hasTestClasses = data.include?.some(
    (inc: any) => inc.includeType === 'testclasses'
  );

  const result: VseoClassTable = {
    CLSNAME: data.name || '',
    LANGU: 'E',
    DESCRIPT: data.description || '',
    STATE: '1',
    CLSCCINCL: 'X',
    FIXPT: 'X',
    UNICODE: 'X',
  };

  if (hasTestClasses) {
    result.WITH_UNIT_TESTS = 'X';
  }

  return result;
}

/**
 * Serialize ADK Class to abapGit XML
 */
export const serializeClass = createSerializer({
  valuesSchema: AbapGitClasValuesSchema,
  mapper: mapClassToAbapGit,
  serializerClass: 'LCL_OBJECT_CLAS',
});
