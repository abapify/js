/**
 * Interfaces Generator
 *
 * Generates TypeScript interfaces from XSD schemas.
 * This is an alias for flattenedInterfaces({ flatten: false }).
 *
 * @deprecated Use flattenedInterfaces({ flatten: false }) instead
 */

import type { GeneratorPlugin } from '../codegen/types';
import { flattenedInterfaces } from './flattened-interfaces';

// ============================================================================
// Options
// ============================================================================

export interface InterfacesOptions {
  /** Output file name pattern. Use {name} for schema name, {source} for source name (default: '{name}.types.ts') */
  filePattern?: string;
  /** Add file header comment */
  header?: boolean;
  /** Generate all complex types as separate interfaces */
  generateAllTypes?: boolean;
  /** Add JSDoc comments */
  addJsDoc?: boolean;
  /** Custom name for the root schema type */
  rootTypeName?: string;
  /**
   * Import path pattern for types from imported schemas.
   * Use {name} for schema name. e.g., './{name}.types'
   * If not provided, inheritance is flattened (all properties copied).
   */
  importPattern?: string;
}

// ============================================================================
// Generator
// ============================================================================

/**
 * Create an interfaces generator plugin
 *
 * Generates TypeScript interfaces from XSD complex types.
 * This is now a wrapper around flattenedInterfaces({ flatten: false }).
 *
 * @deprecated Use flattenedInterfaces({ flatten: false }) instead
 *
 * @example
 * ```ts
 * import { rawSchema, flattenedInterfaces, indexBarrel } from 'ts-xsd/generators';
 *
 * export default defineConfig({
 *   generators: [
 *     rawSchema(),
 *     flattenedInterfaces({ flatten: false }),  // Generates interfaces
 *     indexBarrel(),
 *   ],
 * });
 * ```
 */
export function interfaces(options: InterfacesOptions = {}): GeneratorPlugin {
  const { filePattern = '{name}.types.ts', header = true, addJsDoc = true } = options;

  // Delegate to flattenedInterfaces with flatten: false
  return flattenedInterfaces({
    filePattern,
    header,
    flatten: false,
    addJsDoc,
  });
}
