/**
 * Speci Adapter for XSD Schemas (ts-xsd-core version)
 * 
 * Provides typed parse/build functions for W3C-compliant schemas.
 */

import { parseXml, buildXml, type Schema, type SchemaLike, type InferSchema } from '@abapify/ts-xsd-core';
import type { Serializable } from 'speci/rest';

/**
 * Typed schema interface - schema literal + typed parse/build methods
 */
export interface TypedSchema<T> extends Serializable<T> {
  parse(xml: string): T;
  build(data: T): string;
}

/**
 * Create a typed schema from a raw schema literal.
 * 
 * @example
 * const classes = typed<AbapClass>(_classes);
 * const data = classes.parse(xml);  // data is AbapClass
 */
export function typed<T>(schema: SchemaLike): TypedSchema<T> {
  return {
    ...schema,
    _infer: undefined as unknown as T,
    parse: (xml: string) => parseXml(schema as Schema, xml) as T,
    build: (data: T) => buildXml(schema as Schema, data),
  } as TypedSchema<T>;
}

// Legacy exports for backward compatibility
export type SpeciSchema<T extends SchemaLike, D = InferSchema<T>> = T & Serializable<D>;
export type SchemaType<T extends SchemaLike> = InferSchema<T>;

/**
 * @deprecated Use `typed<T>(schema)` instead
 */
export default function schema<T extends SchemaLike, D = InferSchema<T>>(def: T): SpeciSchema<T, D> {
  return {
    ...def,
    _infer: undefined as unknown as D,
    parse: (xml: string) => parseXml(def as Schema, xml),
    build: (data: D) => buildXml(def as Schema, data),
  } as SpeciSchema<T, D>;
}

