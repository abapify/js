/**
 * Speci Adapter for XSD Schemas
 * 
 * Wraps ts-xsd schemas to be compatible with speci's Inferrable interface.
 * This enables automatic type inference in speci contracts.
 * 
 * Can be used as:
 * 1. Factory function for codegen: schema({ ns: '...', element: [...], complexType: {...} })
 * 2. Batch wrapper: speci({ schema1, schema2 })
 */

import { parse, build, type XsdSchema, type InferXsd } from 'ts-xsd';
import type { Serializable } from 'speci/rest';

/**
 * Wrapped schema type - XSD schema + speci's Serializable (which includes Inferrable)
 * Uses InferXsd which infers the first declared element (typical root element).
 */
export type SpeciSchema<T extends XsdSchema> = T & Serializable<InferXsd<T>>;

/**
 * Factory function for wrapping a single schema.
 * Used by ts-xsd factory generator.
 * 
 * @example
 * // In generated schema file:
 * import schema from '../../speci';
 * export default schema({ ns: '...', element: [...], complexType: {...} });
 */
export default function schema<T extends XsdSchema>(def: T): SpeciSchema<T> {
  return {
    ...def,
    _infer: undefined as unknown as InferXsd<T>,  // Inferrable marker
    parse: (xml: string) => parse(def, xml),      // Serializable.parse
    build: (data) => build(def, data),            // Serializable.build
  } as SpeciSchema<T>;
}
