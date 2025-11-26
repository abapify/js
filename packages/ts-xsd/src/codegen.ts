/**
 * ts-xsd Code Generator
 *
 * Re-exports from modular codegen structure:
 * - codegen/xs/schema.ts   - xs:schema parsing
 * - codegen/xs/types.ts    - xs:simpleType / type mapping
 * - codegen/xs/element.ts  - xs:element handling
 * - codegen/xs/attribute.ts - xs:attribute handling
 * - codegen/xs/sequence.ts - xs:sequence / xs:choice handling
 */

export { generateFromXsd, type CodegenOptions, type GeneratedSchema, type ImportResolver } from './codegen/index';
