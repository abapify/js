/**
 * Package (DEVC) object handler for abapGit format
 */

import { AdkPackage } from '../adk';
import { devc } from '../schemas';
import { createHandler } from '../base';

/**
 * Package handler for abapGit serialization
 * 
 * Note: Packages in abapGit use "package.devc.xml" as filename,
 * not "$packagename.devc.xml"
 */
export const packageHandler = createHandler(AdkPackage, {
  schema: devc,
  
  // Packages use fixed filename, not object name
  xmlFileName: 'package.devc.xml',

  toAbapGit: (pkg) => ({
    // Note: DEVCLASS is not included in abapGit package.devc.xml files (only CTEXT)
    CTEXT: pkg.description ?? '',
  }),
});
