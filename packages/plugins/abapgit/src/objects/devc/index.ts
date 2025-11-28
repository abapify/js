/**
 * DEVC (Package) object serializer for abapGit format
 * Maps ADK Package objects to abapGit XML structure
 */

import type { Package } from '@abapify/adk';
import { createSerializer } from '../../lib/create-serializer.js';
import { AbapGitDevcValuesSchema } from './schema.js';
import type { DevcTable } from './types.js';

/**
 * Map ADK Package to abapGit DEVC structure
 *
 * Note: DEVCLASS is not included in abapGit package.devc.xml files (only CTEXT)
 */
function mapPackageToAbapGit(pkg: Package): DevcTable {
  const data = pkg.getData();

  return {
    CTEXT: data.description || '',
  };
}

/**
 * Serialize ADK Package to abapGit XML
 */
export const serializePackage = createSerializer({
  valuesSchema: AbapGitDevcValuesSchema,
  mapper: mapPackageToAbapGit,
  serializerClass: 'LCL_OBJECT_DEVC',
});
