/**
 * Base Schema Module
 *
 * Centralized exports for ts-xml schema functionality.
 * All external ts-xml imports should go through this module.
 */

import {
  parse as tsxmlParse,
  build as tsxmlBuild,
  tsxml,
  FieldKind,
  PrimitiveType,
} from 'ts-xml';
import type { ElementSchema, InferSchema } from 'ts-xml';
import type { Inferrable } from 'speci/rest';

// Re-export types and enums
export type { ElementSchema, InferSchema };
export { FieldKind, PrimitiveType };

// Re-export functions
export const parse = tsxmlParse;
export const build = tsxmlBuild;

/**
 * Helper type to infer schema type
 */
export type InferSchemaType<T extends ElementSchema> = InferSchema<T>;

/**
 * Type alias for schema fields - cleaner than ElementSchema['fields']
 */
export type SchemaFields = ElementSchema['fields'];

/**
 * Create a typed XML schema with Speci Inferrable support
 *
 * Automatically adds _infer property for automatic type inference in Speci.
 *
 * @example
 * const MySchema = createSchema({
 *   tag: 'myElement',
 *   fields: { id: { kind: 'attr', name: 'id', type: 'string' } }
 * });
 *
 * // Use in Speci - type inferred automatically!
 * responses: { 200: MySchema }
 */
export function createSchema<T extends ElementSchema>(
  schema: T
): T & Inferrable<InferSchemaType<T>> {
  const tsxmlSchema = tsxml.schema(schema);
  return {
    ...tsxmlSchema,
    _infer: undefined as unknown as InferSchemaType<T>,
  } as T & Inferrable<InferSchemaType<T>>;
}
