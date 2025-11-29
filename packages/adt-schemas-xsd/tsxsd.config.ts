/**
 * ts-xsd Configuration for ADT Schemas
 * 
 * Generates TypeScript schemas from SAP ADT XSD files.
 * 
 * Usage:
 *   npx nx generate adt-schemas-xsd
 */

import { defineConfig, factory } from 'ts-xsd';

/**
 * SAP schemas to generate (dependencies are auto-resolved)
 */
const schemas = [
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
];

/**
 * Manual schemas (extensions of SAP schemas)
 * These use xs:redefine to extend SAP schemas
 */
const manualSchemas = [
  'transportmanagment-single',  // Single transport GET response
];

/**
 * Resolver for XSD imports
 * 
 * After normalize-xsd.ts runs, all schemaLocation values are simple filenames:
 * - adtcore.xsd → ./adtcore
 * - ../sap/foo.xsd → ./foo (for manual schemas referencing sap/)
 * - Ecore.xsd → ../manual/Ecore (Eclipse EMF stub in manual folder)
 */
function resolveImport(schemaLocation: string): string {
  // Ecore.xsd → ../manual/Ecore (Eclipse EMF stub)
  if (schemaLocation === 'Ecore.xsd') {
    return '../manual/Ecore';
  }
  
  // ../sap/foo.xsd → ./foo (manual schemas referencing sap/)
  const sapMatch = schemaLocation.match(/\.\.\/sap\/([^/]+)\.xsd$/);
  if (sapMatch) return `./${sapMatch[1]}`;
  
  // foo.xsd → ./foo
  return `./${schemaLocation.replace(/\.xsd$/, '')}`;
}

export default defineConfig({
  // Process both SAP and manual XSD files
  input: ['.xsd/sap/*.xsd', '.xsd/manual/*.xsd'],
  output: 'src/schemas/generated',
  generator: factory({ path: '../../speci' }),
  resolver: resolveImport,
  // Generate all SAP schemas + manual schemas
  schemas: [...schemas, ...manualSchemas],
  stubs: true,
  // Clean output directory before generating (removes stale schemas)
  clean: true,
});
