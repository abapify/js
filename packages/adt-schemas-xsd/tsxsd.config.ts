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
 * Schemas to generate (dependencies are auto-resolved)
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
 * Custom resolver for SAP platform:/ URLs
 */
function resolveImport(schemaLocation: string): string {
  // platform:/plugin/.../model/foo.xsd → ./foo
  const match = schemaLocation.match(/\/model\/([^/]+)\.xsd$/);
  if (match) return `./${match[1]}`;
  
  // Relative: foo.xsd → ./foo
  if (!schemaLocation.includes('/')) {
    return `./${schemaLocation.replace(/\.xsd$/, '')}`;
  }
  
  return schemaLocation.replace(/\.xsd$/, '');
}

export default defineConfig({
  input: '.xsd/model/*.xsd',
  output: 'src/schemas/generated',
  generator: factory({ path: '../../speci' }),
  resolver: resolveImport,
  schemas,
  stubs: true,
});
