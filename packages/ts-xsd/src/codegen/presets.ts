/**
 * Generator Presets
 * 
 * Pre-configured generator combinations for common use cases.
 * 
 * @example
 * ```ts
 * import { defineConfig, presets } from 'ts-xsd/generators';
 * 
 * export default defineConfig({
 *   sources: { ... },
 *   generators: presets.simpleSchemas(),  // rawSchema + indexBarrel
 * });
 * ```
 */

import type { GeneratorPlugin } from './types';
import { rawSchema, type RawSchemaOptions } from '../generators/raw-schema';
import { inferredTypes, type InferredTypesOptions } from '../generators/inferred-types';
import { interfaces, type InterfacesOptions } from '../generators/interfaces';
import { indexBarrel, type IndexBarrelOptions } from '../generators/index-barrel';

// ============================================================================
// Preset Options
// ============================================================================

export interface SimpleSchemaPresetOptions {
  rawSchema?: RawSchemaOptions;
  indexBarrel?: IndexBarrelOptions;
}

export interface TypedSchemaPresetOptions {
  rawSchema?: RawSchemaOptions;
  inferredTypes?: InferredTypesOptions;
  indexBarrel?: IndexBarrelOptions;
}

export interface FullSchemaPresetOptions {
  rawSchema?: RawSchemaOptions;
  interfaces?: InterfacesOptions;
  indexBarrel?: IndexBarrelOptions;
}

// ============================================================================
// Presets
// ============================================================================

/**
 * Preset collection for common generation scenarios
 */
export const presets = {
  /**
   * Simple schemas - raw schema literals only
   * 
   * Output per schema:
   * - `{name}.ts` - raw schema with `as const`
   * - `index.ts` - barrel exports
   * 
   * Use when: You have pre-computed types or use InferSchema at import site
   */
  simpleSchemas(options: SimpleSchemaPresetOptions = {}): GeneratorPlugin[] {
    return [
      rawSchema(options.rawSchema),
      indexBarrel(options.indexBarrel),
    ];
  },

  /**
   * Typed schemas - raw schema + inferred types
   * 
   * Output per schema:
   * - `{name}.ts` - raw schema with `as const`
   * - `{name}.typed.ts` - `InferSchema<typeof schema>` type export
   * - `index.ts` - barrel exports
   * 
   * Use when: You want types co-located with schemas
   */
  typedSchemas(options: TypedSchemaPresetOptions = {}): GeneratorPlugin[] {
    return [
      rawSchema(options.rawSchema),
      inferredTypes(options.inferredTypes),
      indexBarrel(options.indexBarrel),
    ];
  },

  /**
   * Full schemas - raw schema + generated TypeScript interfaces
   * 
   * Output per schema:
   * - `{name}.ts` - raw schema with `as const`
   * - `{name}.types.ts` - TypeScript interfaces via ts-morph
   * - `index.ts` - barrel exports
   * 
   * Use when: You need explicit interfaces (avoids TS2589 deep instantiation)
   */
  fullSchemas(options: FullSchemaPresetOptions = {}): GeneratorPlugin[] {
    return [
      rawSchema(options.rawSchema),
      interfaces(options.interfaces),
      indexBarrel(options.indexBarrel),
    ];
  },
};

// Re-export for convenience
export { rawSchema, inferredTypes, interfaces, indexBarrel };
