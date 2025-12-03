/**
 * ts-xsd Configuration for SAP ADT Schemas
 * 
 * Generates TypeScript schemas from SAP's XSD files.
 * Output: src/schemas/generated/sap/
 * 
 * Usage:
 *   npx ts-xsd codegen -c tsxsd.config.ts
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
  
  // Packages
  'packagesV1',
  
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
  
  // Base schemas needed by custom extensions
  'templatelink',  // Used by custom/templatelink
];

/**
 * Resolver for XSD imports (SAP schemas)
 * Output is in generated/sap/, so paths are relative to that
 */
function resolveImport(schemaLocation: string): string {
  // Ecore.xsd → ../custom/Ecore (Eclipse EMF stub in custom folder)
  if (schemaLocation === 'Ecore.xsd') {
    return '../custom/Ecore';
  }
  
  // foo.xsd → ./foo (same folder)
  return `./${schemaLocation.replace(/\.xsd$/, '')}`;
}

export default defineConfig({
  input: ['.xsd/sap/*.xsd', '.xsd/manual/*.xsd'],
  output: 'src/schemas/generated/sap',
  generator: factory({ path: '../../../speci', exportMergedType: true, exportElementTypes: true }),
  resolver: resolveImport,
  schemas,
  stubs: true,
  clean: true,
  extractTypes: true,  // Extract and embed types in .ts files to avoid TS7056
  factoryPath: '../../../speci',
});
