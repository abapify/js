/**
 * Base namespace utilities for ADT schemas
 *
 * This is the ONLY file that imports ts-xml directly.
 * All other schema files should import from here.
 */

import { tsxml, parse, build, type InferSchema } from 'ts-xml';

/**
 * Namespace configuration
 */
export interface NamespaceConfig {
  readonly uri: string;
  readonly prefix: string;
}

/**
 * Field definition helpers
 */
export interface FieldHelper {
  /**
   * Create an attribute field definition
   */
  attr(
    name: string,
    type?: 'string'
  ): { kind: 'attr'; name: string; type: 'string' };

  /**
   * Create a single element field definition
   */
  elem<T extends ReturnType<typeof tsxml.schema>>(
    name: string,
    schema: T
  ): { kind: 'elem'; name: string; schema: T };

  /**
   * Create a multiple elements field definition
   */
  elems<T extends ReturnType<typeof tsxml.schema>>(
    name: string,
    schema: T
  ): { kind: 'elems'; name: string; schema: T };
}

/**
 * Namespace factory result
 */
export interface Namespace extends FieldHelper {
  readonly uri: string;
  readonly prefix: string;
  readonly schema: typeof tsxml.schema;
}

/**
 * Create a namespace with helper utilities
 *
 * @param config - Namespace configuration (URI and prefix)
 * @returns Namespace object with helper methods
 *
 * @example
 * ```typescript
 * const adtcore = createNamespace({
 *   uri: "http://www.sap.com/adt/core",
 *   prefix: "adtcore"
 * });
 *
 * const fields = {
 *   uri: adtcore.attr("uri"),
 *   child: adtcore.elem("child", ChildSchema),
 * };
 *
 * const schema = adtcore.schema({
 *   tag: "adtcore:myElement",
 *   fields
 * } as const);
 * ```
 */
export function createNamespace(config: NamespaceConfig): Namespace {
  const { uri, prefix } = config;

  return {
    // Namespace constants
    uri,
    prefix,

    // Direct access to tsxml.schema
    schema: tsxml.schema,

    // Helper to create attribute fields
    attr: (name: string, type: 'string' = 'string') => ({
      kind: 'attr' as const,
      name: `${prefix}:${name}`,
      type,
    }),

    // Helper to create single element fields
    elem: <T extends ReturnType<typeof tsxml.schema>>(
      name: string,
      schema: T
    ) => ({
      kind: 'elem' as const,
      name: `${prefix}:${name}`,
      schema,
    }),

    // Helper to create multiple elements fields
    elems: <T extends ReturnType<typeof tsxml.schema>>(
      name: string,
      schema: T
    ) => ({
      kind: 'elems' as const,
      name: `${prefix}:${name}`,
      schema,
    }),
  };
}

/**
 * Re-export ts-xml utilities for external use
 */
export { parse, build, type InferSchema };
