/**
 * Base namespace utilities for ADT schemas
 *
 * This is the ONLY file that imports ts-xml directly.
 * All other schema files should import from here.
 */

import { tsxml, parse, build, type InferSchema } from "ts-xml";

/**
 * Namespace configuration
 */
export interface NamespaceConfig {
  readonly uri: string;
  readonly prefix: string;
}

/**
 * ADT Schema interface - contract that all schemas must implement
 *
 * Provides bidirectional XML ↔ TypeScript transformation with full typing
 *
 * @template T - The TypeScript type for the schema
 *
 * @example
 * ```typescript
 * // Each namespace exports an AdtSchema implementation
 * import type { AdtSchema } from "@abapify/adt-schemas/base.ts";
 * import type { ClassType } from "@abapify/adt-schemas/oo/classes.ts";
 *
 * const classSchema: AdtSchema<ClassType> = {
 *   fromAdtXml: (xml) => parse(ClassSchema, xml),
 *   toAdtXml: (data, options) => build(ClassSchema, data, options),
 * };
 * ```
 */
export interface AdtSchema<T> {
  /**
   * Parse ADT XML to typed TypeScript object
   *
   * @param xml - XML string
   * @returns Typed object
   */
  fromAdtXml(xml: string): T;

  /**
   * Build ADT XML from typed TypeScript object
   *
   * @param data - Typed object
   * @param options - Optional build options (xmlDecl, encoding)
   * @returns XML string
   */
  toAdtXml(data: T, options?: { xmlDecl?: boolean; encoding?: string }): string;
}

/**
 * Helper to create an AdtSchema implementation
 *
 * @param schema - ts-xml schema
 * @returns AdtSchema implementation with fromAdtXml and toAdtXml
 *
 * @example
 * ```typescript
 * export const ClassAdtSchema = createAdtSchema(ClassSchema);
 * // Usage: const classObj = ClassAdtSchema.fromAdtXml(xml);
 * ```
 */
export function createAdtSchema<TSchema extends ReturnType<typeof tsxml.schema>>(
  schema: TSchema
): AdtSchema<InferSchema<TSchema>> {
  return {
    fromAdtXml: (xml: string) => {
      return parse(schema, xml);
    },
    toAdtXml: (data: InferSchema<TSchema>, options?: { xmlDecl?: boolean; encoding?: string }) => {
      return build(schema, data, options);
    },
  };
}

/**
 * Field definition helpers
 */
export interface FieldHelper {
  /**
   * Create an attribute field definition
   */
  attr(name: string, type?: "string"): { kind: "attr"; name: string; type: "string" };

  /**
   * Create a single element field definition
   */
  elem<T extends ReturnType<typeof tsxml.schema>>(
    name: string,
    schema: T
  ): { kind: "elem"; name: string; schema: T };

  /**
   * Create a multiple elements field definition
   */
  elems<T extends ReturnType<typeof tsxml.schema>>(
    name: string,
    schema: T
  ): { kind: "elems"; name: string; schema: T };
}

/**
 * Namespace factory result
 */
export interface Namespace extends FieldHelper {
  readonly uri: string;
  readonly prefix: string;
  readonly schema: typeof tsxml.schema;
  readonly inferType: <T extends ReturnType<typeof tsxml.schema>>(_schema: T) => InferSchema<T>;
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
    attr: (name: string, type: "string" = "string") => ({
      kind: "attr" as const,
      name: `${prefix}:${name}`,
      type,
    }),

    // Helper to create single element fields
    elem: <T extends ReturnType<typeof tsxml.schema>>(name: string, schema: T) => ({
      kind: "elem" as const,
      name: `${prefix}:${name}`,
      schema,
    }),

    // Helper to create multiple elements fields
    elems: <T extends ReturnType<typeof tsxml.schema>>(name: string, schema: T) => ({
      kind: "elems" as const,
      name: `${prefix}:${name}`,
      schema,
    }),

    // Type inference helper (never called at runtime, only for type extraction)
    inferType: <T extends ReturnType<typeof tsxml.schema>>(_schema: T): InferSchema<T> => {
      throw new Error("inferType is a compile-time helper and should never be called at runtime");
    },
  };
}

/**
 * Re-export ts-xml type utilities for external use
 */
export type { InferSchema, ElementSchema } from "ts-xml";
