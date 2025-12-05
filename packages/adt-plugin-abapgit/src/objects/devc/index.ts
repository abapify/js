/**
 * DEVC (Package) object serializer for abapGit format
 * Maps ADK v2 Package objects to abapGit XML structure
 */

import type { AdkPackage } from '@abapify/adk';
import { createSerializer } from '../../lib/create-serializer';
import { AbapGitDevcValuesSchema } from './schema';
import type { DevcTable } from './types';

/**
 * Map ADK v2 Package to abapGit DEVC structure
 *
 * Note: DEVCLASS is not included in abapGit package.devc.xml files (only CTEXT)
 */
function mapPackageToAbapGit(pkg: AdkPackage): DevcTable {
  // Access description directly from AdkPackage
  return {
    CTEXT: pkg.description || '',
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
