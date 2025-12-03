/**
 * ts-xsd Configuration
 * 
 * Type-safe configuration for ts-xsd codegen.
 */

import type { Generator } from './codegen/generator';
import type { ImportResolver } from './codegen/types';

/**
 * Codegen configuration
 */
export interface CodegenConfig {
  /** Input XSD files or glob pattern */
  input: string | string[];
  /** Output directory for generated TypeScript files */
  output: string;
  /** Generator to use (use factory() or raw() helpers) */
  generator: Generator;
  /** 
   * Import resolver function or module path.
   * Resolves xsd:import schemaLocation to TypeScript import paths.
   */
  resolver?: ImportResolver | string;
  /** 
   * Specific schemas to generate (by name, without .xsd extension).
   * If not provided, generates all schemas found in input.
   * Dependencies are automatically included.
   */
  schemas?: string[];
  /** Generate stub schemas for missing dependencies (default: true) */
  stubs?: boolean;
  /** Namespace prefix for generated code */
  prefix?: string;
  /** Clean output directory before generating (default: false) */
  clean?: boolean;
  /** 
   * Extract expanded types to .d.ts files after generation.
   * This pre-computes complex InferXsd types to simple interfaces,
   * solving TS7056 declaration emit issues.
   */
  extractTypes?: boolean;
  /** 
   * Factory path for type extraction index regeneration.
   * Should match the path used in factory({ path: '...' }).
   * @default '../schema'
   */
  factoryPath?: string;
}

/**
 * Define a ts-xsd configuration with type safety
 * 
 * @example
 * ```typescript
 * // tsxsd.config.ts
 * import { defineConfig, factory } from 'ts-xsd';
 * 
 * export default defineConfig({
 *   input: '.xsd/model/*.xsd',
 *   output: 'src/schemas/generated',
 *   generator: factory({ path: '../../speci' }),
 *   resolver: (location) => {
 *     const match = location.match(/\/model\/([^/]+)\.xsd$/);
 *     return match ? `./${match[1]}` : location.replace(/\.xsd$/, '');
 *   },
 *   schemas: ['adtcore', 'classes', 'interfaces'],
 * });
 * ```
 */
export function defineConfig(config: CodegenConfig): CodegenConfig {
  return config;
}
