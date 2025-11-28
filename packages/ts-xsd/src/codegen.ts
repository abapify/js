/**
 * ts-xsd Code Generator
 *
 * Re-exports from modular codegen structure:
 * - codegen/xs/schema.ts   - xs:schema parsing
 * - codegen/xs/types.ts    - xs:simpleType / type mapping
 * - codegen/xs/element.ts  - xs:element handling
 * - codegen/xs/attribute.ts - xs:attribute handling
 * - codegen/xs/sequence.ts - xs:sequence / xs:choice handling
 * - codegen/generator.ts   - Pluggable generator interface
 */

export { 
  generateFromXsd, 
  generateIndex,
  generateBatch,
  scanXsdDirectory,
  collectDependencies,
  extractImportedSchemas,
  parseXsdToSchemaData,
  type CodegenOptions, 
  type GeneratedSchema, 
  type ImportResolver, 
  type ImportedSchema,
  type Generator,
  type GeneratorContext,
  type SchemaData,
  type SchemaImport,
  type BatchOptions,
  type BatchResult,
} from './codegen/index';

// Export built-in generators
export { raw as rawGenerator, factory as factoryGenerator } from './generators';
