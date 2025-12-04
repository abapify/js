/**
 * ts-xsd Configuration for abapGit Schemas
 * 
 * Generates TypeScript schemas from abapGit XSD files.
 * Output: src/schemas/
 * 
 * Usage:
 *   npx nx run adt-plugin-abapgit:codegen
 */

import { defineConfig, factory } from 'ts-xsd';

/**
 * abapGit schemas to generate
 */
const schemas = [
  // Object types
  'clas',    // VSEOCLASS - Class metadata
  'intf',    // VSEOINTERF - Interface metadata
  'devc',    // DEVC - Package metadata
  'doma',    // DD01V, DD07V_TAB - Domain metadata
  'dtel',    // DD04V - Data element metadata
];

/**
 * Resolver for XSD imports
 */
function resolveImport(schemaLocation: string): string {
  // Same folder imports
  return `./${schemaLocation.replace(/\.xsd$/, '')}`;
}

export default defineConfig({
  input: ['xsd/*.xsd'],
  output: 'src/schemas',
  generator: factory({ path: '../speci', exportMergedType: true, exportElementTypes: true }),
  resolver: resolveImport,
  schemas,
  stubs: true,
  clean: true,
  extractTypes: true,
  factoryPath: '../speci',
});
