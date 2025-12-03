/**
 * Speci Adapter for XSD Schemas
 * 
 * Wraps ts-xsd schemas to be compatible with speci's Inferrable interface.
 * This enables automatic type inference in speci contracts.
 * 
 * Can be used as:
 * 1. Factory function for codegen: schema({ ns: '...', element: [...], complexType: {...} })
 * 2. Element selector: schemaElement(schema, 'elementName') for multi-root schemas
 */

import { parse, build, type XsdSchema, type InferElement, type InferFirstElement, type InferXsdMerged } from 'ts-xsd';
import type { Serializable } from 'speci/rest';

/**
 * Wrapped schema type - XSD schema + speci's Serializable (which includes Inferrable)
 * 
 * When D (Data type) is provided, uses the pre-computed type from .d.ts file.
 * This avoids TS7056 errors for complex schemas.
 * 
 * When D is not provided, falls back to InferFirstElement<T>.
 */
export type SpeciSchema<T extends XsdSchema, D = InferFirstElement<T>> = T & Serializable<D>;

/**
 * Helper type to get merged type from a schema.
 * All element fields become optional - useful for multi-root schemas.
 * 
 * @example
 * import { adtcore } from 'adt-schemas-xsd';
 * import type { MergedType } from 'adt-schemas-xsd/speci';
 * 
 * const data = adtcore.parse(xml) as MergedType<typeof adtcore>;
 * data.objectReference?.[0]?.uri;  // Type-safe!
 */
export type MergedType<T extends XsdSchema> = InferXsdMerged<T>;

/**
 * Wrapped schema type for a specific element.
 * Uses InferElement to infer a specific element from a multi-root schema.
 */
export type SpeciSchemaElement<T extends XsdSchema, E extends string> = T & Serializable<InferElement<T, E>>;

/**
 * Factory function for wrapping a single schema.
 * Used by ts-xsd factory generator.
 * 
 * @example
 * // Basic usage (infers type from schema):
 * import schema from '../../speci';
 * export default schema(_schema);
 * 
 * // With pre-computed type (avoids TS7056):
 * import schema from '../../speci';
 * import type { ClassesData } from './classes.d.ts';
 * export default schema<typeof _schema, ClassesData>(_schema);
 */
export default function schema<T extends XsdSchema, D = InferFirstElement<T>>(def: T): SpeciSchema<T, D> {
  return {
    ...def,
    _infer: undefined as unknown as D,
    parse: (xml: string) => parse(def, xml),
    build: (data) => build(def, data),
  } as SpeciSchema<T, D>;
}

/**
 * Create a schema variant that infers a specific element type.
 * Use this for schemas with multiple root elements when you need
 * to specify which element the contract returns.
 * 
 * @example
 * // adtcore has multiple elements: mainObject, objectReferences, objectReference, content
 * // For search endpoint that returns objectReferences:
 * import { adtcore } from 'adt-schemas-xsd';
 * import { schemaElement } from 'adt-schemas-xsd/speci';
 * 
 * const searchContract = {
 *   quickSearch: () => http.get('/search', {
 *     responses: { 200: schemaElement(adtcore, 'objectReferences') }
 *   })
 * };
 */
export function schemaElement<T extends XsdSchema, E extends string>(
  def: T,
  _elementName: E
): SpeciSchemaElement<T, E> {
  return {
    ...def,
    _infer: undefined as unknown as InferElement<T, E>,
    parse: (xml: string) => parse(def, xml),
    build: (data) => build(def, data),
  } as SpeciSchemaElement<T, E>;
}
