/**
 * XSD Schema Codegen
 * 
 * Generate TypeScript literal types from XSD files.
 * Uses the existing parseXsd() parser and transforms the result
 * into a TypeScript literal that can be used with InferSchema<T>.
 */

export { generateSchemaLiteral, generateSchemaFile } from './generate';
