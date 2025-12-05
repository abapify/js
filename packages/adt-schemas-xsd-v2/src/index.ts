/**
 * ADT XML Schemas v2 - Using ts-xsd-core (W3C format)
 * 
 * This package exports XSD schemas in W3C-compliant format.
 * 
 * @example
 * import { atom, adtcore } from '@abapify/adt-schemas-xsd-v2';
 * import { parseXml, type InferSchema } from '@abapify/ts-xsd-core';
 * 
 * // Parse XML using schema
 * const data = parseXml(atom, xmlString);
 * 
 * // Type inference
 * type AtomData = InferSchema<typeof atom>;
 */

// Re-export all schemas
export * from './schemas';

// Export speci adapter
export { default as schema, type SpeciSchema, type SchemaType } from './speci';