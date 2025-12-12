/**
 * ADT XML Schemas - Using ts-xsd (W3C format)
 *
 * This package exports typed XSD schemas with parse/build methods.
 *
 * @example
 * import { atom, adtcore } from '@abapify/adt-schemas';
 *
 * // Parse XML using schema
 * const data = atom.parse(xmlString);
 *
 * // Build XML from data
 * const xml = atom.build(data);
 *
 * // Type extraction
 * import type { InferTypedSchema } from '@abapify/adt-schemas';
 * type AtomData = InferTypedSchema<typeof atom>;
 */

// Re-export all schemas
export * from './schemas';

// Re-export ts-xsd types for consumers (single point of entry)
export { typedSchema, parseXml, buildXml } from 'ts-xsd';
export type {
  TypedSchema,
  InferTypedSchema,
  SchemaLike,
  InferSchema,
} from 'ts-xsd';
