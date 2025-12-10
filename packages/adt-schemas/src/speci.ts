/**
 * Speci Adapter for XSD Schemas (ts-xsd version)
 * 
 * Provides typed parse/build functions for W3C-compliant schemas.
 * 
 * Usage:
 *   import classes from './schemas/sap/classes';
 *   import type { AbapClass } from './types/sap/classes.types';
 *   export const classesSchema = typed<AbapClass>(classes);
 */

import { parseXml, buildXml, type SchemaLike } from 'ts-xsd';

/**
 * Typed schema interface - schema literal + typed parse/build methods
 */
export interface TypedSchema<T> {
  parse(xml: string): T;
  build(data: T): string;
}

/**
 * Create a typed schema from a raw schema literal.
 * Pass the generated root type as the type parameter.
 * 
 * @example
 * import classes from './schemas/sap/classes';
 * import type { AbapClass } from './types/sap/classes.types';
 * export const classesSchema = typed<AbapClass>(classes);
 */
export function typed<T>(schema: SchemaLike): TypedSchema<T> {
  return {
    parse: (xml: string) => parseXml(schema, xml) as T,
    build: (data: T) => buildXml(schema, data as Record<string, unknown>),
  };
}
