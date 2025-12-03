/**
 * ts-xsd Configuration for Custom Schemas
 * 
 * Generates TypeScript schemas from our custom XSD extensions.
 * Output: src/schemas/generated/custom/
 * 
 * Usage:
 *   npx ts-xsd codegen -c tsxsd.custom.config.ts
 */

import { defineConfig, factory } from 'ts-xsd';

/**
 * Custom schemas (our extensions to SAP schemas)
 */
const schemas = [
  'Ecore',                     // Eclipse EMF stub (used by SAP XSDs)
  'atomExtended',              // Extends SAP's atom.xsd with title, category
  'templatelinkExtended',      // Extends SAP's templatelink.xsd with templateLinks container
  'discovery',                 // AtomPub Service Document (RFC 5023)
  'http',                       // HTTP sessions (CSRF token, links)
  'transportmanagment-single', // Single transport GET response
  'transportfind',             // Transport find response (ABAP XML)
  'transportmanagment-create', // Transport create request
];

/**
 * Resolver for XSD imports (custom schemas)
 * 
 * Custom schemas reference:
 * - ../sap/foo.xsd → ../sap/foo (SAP schemas)
 * - foo.xsd → ./foo (same folder)
 */
function resolveImport(schemaLocation: string): string {
  // ../sap/foo.xsd → ../sap/foo (custom schemas referencing sap/)
  const sapMatch = schemaLocation.match(/\.\.\/sap\/([^/]+)\.xsd$/);
  if (sapMatch) return `../sap/${sapMatch[1]}`;
  
  // foo.xsd → ./foo (same folder reference)
  return `./${schemaLocation.replace(/\.xsd$/, '')}`;
}

export default defineConfig({
  input: ['.xsd/custom/*.xsd'],
  output: 'src/schemas/generated/custom',
  generator: factory({ path: '../../../speci', exportMergedType: true, exportElementTypes: true }),
  resolver: resolveImport,
  schemas,
  stubs: true,
  clean: true,
  extractTypes: true,  // Extract and embed types in .ts files to avoid TS7056
  factoryPath: '../../../speci',
});
