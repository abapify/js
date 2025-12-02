/**
 * ts-xsd - Type-safe XSD schemas for TypeScript
 *
 * Parse and build XML with full type inference from XSD-like schemas.
 * 
 * Schema format:
 * - element[] - top-level xsd:element declarations
 * - complexType{} - xsd:complexType definitions
 * - simpleType{} - xsd:simpleType definitions (optional)
 */

// Core functions
export { parse, build, type BuildOptions } from './xml';

// Config helpers
export { defineConfig, type CodegenConfig } from './config';

// Generator factory functions
export { raw, factory, type RawOptions, type FactoryOptions } from './generators';

// Types
export type {
  XsdSchema,
  XsdComplexType,
  XsdSimpleType,
  XsdElementDecl,
  XsdField,
  XsdAttribute,
  InferXsd,
  InferElement,
  InferAnyElement,
  InferComplexType,
} from './types';

export type { Generator, GeneratorContext, SchemaData, SchemaImport } from './codegen/generator';
