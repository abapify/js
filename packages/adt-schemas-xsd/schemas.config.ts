/**
 * ADT Schemas Configuration
 * 
 * List the XSD schemas to generate TypeScript from.
 * The codegen will automatically resolve dependencies via xsd:import.
 * 
 * Usage:
 *   npx tsx scripts/generate.ts
 */

// Import XSD files directly - ts-xsd loader handles parsing
// Note: These imports will be resolved by the generate script

export const schemas = [
  // Core ADT types
  'adtcore',
  'abapsource',
  
  // OO types
  'abapoo',
  'classes',
  'interfaces',
  
  // ATC (ABAP Test Cockpit)
  'atc',
  'atcresult',
  'atcworklist',
  
  // Transport
  'transportmanagment',
  'transportsearch',
  
  // Configuration
  'configuration',
  'configurations',
  
  // Checks & Activation
  'checkrun',
  'checklist',
  
  // Debugging
  'debugger',
  'logpoint',
  'traces',
  
  // Refactoring
  'quickfixes',
  
  // Other
  'log',
] as const;

/**
 * Custom resolver for SAP platform:/ URLs
 */
export function resolveImport(schemaLocation: string, _namespace: string): string {
  // platform:/plugin/.../model/foo.xsd → ./foo
  const match = schemaLocation.match(/\/model\/([^/]+)\.xsd$/);
  if (match) return `./${match[1]}`;
  
  // Relative: foo.xsd → ./foo
  if (!schemaLocation.includes('/')) {
    return `./${schemaLocation.replace(/\.xsd$/, '')}`;
  }
  
  return schemaLocation.replace(/\.xsd$/, '');
}
