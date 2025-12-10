/**
 * ADT XML Schemas v2 - Using ts-xsd (W3C format)
 * 
 * This package exports XSD schemas in W3C-compliant format.
 * 
 * @example
 * import { atom, adtcore } from '@abapify/adt-schemas';
 * import { parseXml, type InferSchema } from 'ts-xsd';
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
export { typed, type TypedSchema } from './speci';