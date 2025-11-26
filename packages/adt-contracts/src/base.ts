/**
 * Base contract utilities
 * 
 * Re-exports speci utilities for contract definitions
 */

export { http, createHttp, type RestContract } from 'speci/rest';

import { parse, build } from 'ts-xsd';
import type { XsdSchema, InferXsd } from 'ts-xsd';

/**
 * Serializable schema interface for speci adapter
 * Schemas with parse/build methods are auto-detected by the adapter
 */
export interface Serializable<T> {
  parse(raw: string): T;
  build(data: T): string;
}

/**
 * Schema with parse/build methods for speci type inference
 * 
 * Speci's InferSchema type automatically infers from parse() return type,
 * so no _infer property is needed!
 */
export type SerializableSchema<TSchema, TInferred> = TSchema & Serializable<TInferred>;

/**
 * Wrap a ts-xsd schema with parse/build methods for speci adapter
 * 
 * Speci automatically infers the response type from the parse() method's return type.
 * No _infer property needed!
 * 
 * @example
 * ```ts
 * import { transportmanagment } from 'adt-schemas-xsd';
 * import { schema } from '../base';
 * 
 * export const contract = {
 *   get: () => http.get('/endpoint', {
 *     responses: { 200: schema(transportmanagment) },
 *   }),
 * };
 * // Response type is automatically inferred as InferXsd<typeof transportmanagment>
 * ```
 */
export function schema<T extends XsdSchema>(xsd: T): SerializableSchema<T, InferXsd<T>> {
  return {
    ...xsd,
    parse: (xml: string) => parse(xsd, xml) as InferXsd<T>,
    build: (data: InferXsd<T>) => build(xsd, data),
  } as SerializableSchema<T, InferXsd<T>>;
}

/**
 * Check if a value looks like an XSD schema (has 'ns' and 'root' properties)
 */
function isXsdSchema(value: unknown): value is XsdSchema {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ns' in value &&
    'root' in value
  );
}

/**
 * Wrap XSD schemas in responses with parse/build methods
 */
function wrapResponses(responses: Record<number, unknown>): Record<number, unknown> {
  const wrapped: Record<number, unknown> = {};
  for (const [code, value] of Object.entries(responses)) {
    wrapped[Number(code)] = isXsdSchema(value) ? schema(value) : value;
  }
  return wrapped;
}

/**
 * Process a contract definition and wrap all XSD schemas with parse/build
 * This is done at runtime when the contract function is called
 */
function processEndpoint(fn: (...args: any[]) => any): (...args: any[]) => any {
  return (...args: any[]) => {
    const descriptor = fn(...args);
    if (descriptor.responses) {
      return {
        ...descriptor,
        responses: wrapResponses(descriptor.responses),
      };
    }
    return descriptor;
  };
}

/**
 * Process a contract object recursively
 */
function processContractObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'function') {
      result[key] = processEndpoint(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = processContractObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Transform response types: wrap XSD schemas with Serializable
 * This tells TypeScript that XSD schemas will have parse() method at runtime
 */
type TransformResponse<T> = T extends XsdSchema 
  ? SerializableSchema<T, InferXsd<T>> 
  : T;

/**
 * Transform all responses in a response map
 */
type TransformResponses<T> = {
  [K in keyof T]: TransformResponse<T[K]>;
};

/**
 * Transform endpoint descriptor to have wrapped response types
 */
type TransformEndpoint<T> = T extends { responses: infer R }
  ? Omit<T, 'responses'> & { responses: TransformResponses<R> }
  : T;

/**
 * Transform endpoint function return type
 */
type TransformEndpointFn<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => TransformEndpoint<R>
  : T;

/**
 * Recursively transform a contract definition
 */
type TransformContract<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? TransformEndpointFn<T[K]>
    : T[K] extends Record<string, any>
    ? TransformContract<T[K]>
    : T[K];
};

/**
 * Wrap a contract definition to automatically add parse/build to XSD schemas
 * 
 * This allows using XSD schemas directly without the schema() wrapper:
 * 
 * @example
 * ```ts
 * import { transportmanagment } from 'adt-schemas-xsd';
 * import { contract, http } from '../base';
 * 
 * export const myContract = contract({
 *   get: () => http.get('/endpoint', {
 *     responses: { 200: transportmanagment },  // No schema() needed!
 *   }),
 * });
 * ```
 */
export function contract<T extends Record<string, any>>(definition: T): TransformContract<T> {
  return processContractObject(definition) as TransformContract<T>;
}
