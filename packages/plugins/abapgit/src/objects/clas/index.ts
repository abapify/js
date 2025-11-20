/**
 * CLAS (Class) object serializer for abapGit format
 * Maps ADK Class objects to abapGit XML structure
 */

import type { Class } from '@abapify/adk';
import { createSerializer } from '../../lib/create-serializer.js';
import { AbapGitClasValuesSchema } from './schema.js';
import type { VseoClassTable } from './types.js';

/**
 * Map ADK Class to abapGit VSEOCLASS structure
 */
function mapClassToAbapGit(cls: Class): VseoClassTable {
  const data = cls.getData();

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
