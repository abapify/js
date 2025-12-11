/**
 * XSD Schema Codegen
 * 
 * Generate TypeScript literal types from XSD files.
 * Uses the existing parseXsd() parser and transforms the result
 * into a TypeScript literal that can be used with InferSchema<T>.
 * 
 * ## Recommended: Use the new generators module
 * 
 * ```typescript
 * import { defineConfig, rawSchema, inferredTypes, indexBarrel } from 'ts-xsd/generators';
 * 
 * export default defineConfig({
 *   sources: { ... },
 *   generators: [rawSchema(), inferredTypes(), indexBarrel()],
 * });
 * ```
 * 
 * See `ts-xsd/src/generators/` for the new composable generator system.
 */

// Legacy API - still works but prefer generators module for new projects
export { generateSchemaLiteral, generateSchemaFile } from './generate';

// Interface generation
export { generateInterfaces, generateSimpleInterfaces } from './interface-generator';
export type { GeneratorOptions, SimpleGeneratorOptions } from './interface-generator';

// Types - config, hooks, generator plugin interface
export * from './types';

// Runner - codegen engine
export { runCodegen, type RunnerOptions, type RunnerResult } from './runner';

// Presets - pre-configured generator combinations
export { presets } from './presets';
export type {
  SimpleSchemaPresetOptions,
  TypedSchemaPresetOptions,
  FullSchemaPresetOptions,
} from './presets';
