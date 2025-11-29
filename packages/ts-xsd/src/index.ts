/**
 * ts-xsd - Type-safe XSD schemas for TypeScript
 *
 * Parse and build XML with full type inference from XSD-like schemas.
 */

import type { XsdSchema, XsdElement } from './types';

// Core functions
export { parse, build, type BuildOptions } from './xml';

// Config helpers
export { defineConfig, type CodegenConfig } from './config';

// Generator factory functions
export { raw, factory, type RawOptions, type FactoryOptions } from './generators';

// Types
export type {
  XsdSchema,
  XsdElement,
  XsdField,
  XsdAttribute,
  InferXsd,
} from './types';

export type { Generator, GeneratorContext, SchemaData, SchemaImport } from './codegen/generator';
export type { ImportResolver, ImportedSchema } from './codegen/types';

/**
 * JSON schema input type (loose typing for JSON imports)
 */
export interface JsonSchema {
  root: string;
  ns?: string;
  prefix?: string;
  elements: Record<string, JsonElement>;
}

interface JsonElement {
  sequence?: JsonField[];
  choice?: JsonField[];
  attributes?: JsonAttribute[];
  text?: boolean;
}

interface JsonField {
  name: string;
  type: string;
  minOccurs?: number;
  maxOccurs?: number | string;  // JSON imports widen "unbounded" to string
}

interface JsonAttribute {
  name: string;
  type: string;
  required?: boolean;
}

/**
 * Convert a JSON schema to a typed XsdSchema.
 * This function validates and coerces JSON imports to proper schema types.
 *
 * @example
 * ```ts
 * import orderJson from './schemas/order.json' with { type: 'json' };
 * import { fromJson, parse } from 'ts-xsd';
 *
 * const Order = fromJson(orderJson);
 * const data = parse(Order, xml);
 * ```
 */
export function fromJson<T extends JsonSchema>(json: T): XsdSchema {
  // Coerce maxOccurs "unbounded" string to literal at runtime
  const elements: Record<string, XsdElement> = {};
  
  for (const [name, el] of Object.entries(json.elements)) {
    elements[name] = {
      ...el,
      sequence: el.sequence?.map(f => ({
        name: f.name,
        type: f.type,
        minOccurs: f.minOccurs,
        maxOccurs: f.maxOccurs === 'unbounded' ? 'unbounded' as const : f.maxOccurs as number | undefined,
      })),
      choice: el.choice?.map(f => ({
        name: f.name,
        type: f.type,
        minOccurs: f.minOccurs,
        maxOccurs: f.maxOccurs === 'unbounded' ? 'unbounded' as const : f.maxOccurs as number | undefined,
      })),
      attributes: el.attributes?.map(a => ({
        name: a.name,
        type: a.type,
        required: a.required,
      })),
    };
  }

  return {
    root: json.root,
    ns: json.ns,
    prefix: json.prefix,
    elements,
  };
}
