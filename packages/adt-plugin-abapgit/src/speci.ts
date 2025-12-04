/**
 * Speci Adapter for abapGit XSD Schemas
 * 
 * Wraps ts-xsd schemas to be compatible with speci's Inferrable interface.
 * This enables automatic type inference in speci contracts.
 */

import { parse, build, type XsdSchema, type InferFirstElement } from 'ts-xsd';
import type { Serializable } from 'speci/rest';

/**
 * Wrapped schema type - XSD schema + speci's Serializable (which includes Inferrable)
 * 
 * When D (Data type) is provided, uses the pre-computed type from .d.ts file.
 * This avoids TS7056 errors for complex schemas.
 */
export type SpeciSchema<T extends XsdSchema, D = InferFirstElement<T>> = T & Serializable<D>;

/**
 * Factory function for wrapping a single schema.
 * Used by ts-xsd factory generator.
 */
export default function schema<T extends XsdSchema, D = InferFirstElement<T>>(def: T): SpeciSchema<T, D> {
  return {
    ...def,
    _infer: undefined as unknown as D,
    parse: (xml: string) => parse(def, xml),
    build: (data) => build(def, data),
  } as SpeciSchema<T, D>;
}
