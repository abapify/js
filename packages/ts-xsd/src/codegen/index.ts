/**
 * XSD Schema Codegen
 * 
 * Generate TypeScript literal types from XSD files.
 * Uses the existing parseXsd() parser and transforms the result
 * into a TypeScript literal that can be used with InferSchema<T>.
 */

// Legacy API (still works)
export { generateSchemaLiteral, generateSchemaFile } from './generate';

// Interface generation
export { generateInterfaces, generateInterfacesWithDeps } from './interface-generator';
export type { GeneratorOptions, GenerateResult } from './interface-generator';
