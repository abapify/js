/**
 * ADT XSD Import Resolver
 * 
 * Transforms SAP Eclipse platform:/ URLs to local relative paths
 * 
 * Example:
 *   platform:/plugin/com.sap.adt.tools.core.base/model/adtcore.xsd
 *   → ./adtcore
 */

import type { ImportResolver } from 'ts-xsd/codegen';

/**
 * Resolve SAP ADT platform:/ URLs to local paths
 */
const resolve: ImportResolver = (schemaLocation: string, _namespace: string): string => {
  // platform:/plugin/.../model/foo.xsd → ./foo
  const match = schemaLocation.match(/\/model\/([^/]+)\.xsd$/);
  if (match) {
    return `./${match[1]}`;
  }
  
  // Fallback: just strip .xsd
  return schemaLocation.replace(/\.xsd$/, '');
};

export default resolve;
export { resolve };
