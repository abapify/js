/**
 * Field kind enum - internal use for type safety
 * Exported for internal package use, but users should use string literals
 */
export enum FieldKind {
  Attr = 'attr',
  Text = 'text',
  Elem = 'elem',
  Elems = 'elems',
}

/**
 * Primitive type enum - internal use for type safety
 * Exported for internal package use, but users should use string literals
 */
export enum PrimitiveType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
}

/**
 * Field kind string literals - public API
 * Dynamically derived from FieldKind enum values
 */
export type FieldKindString = `${FieldKind}`;

/**
 * Primitive type string literals - public API
 * Dynamically derived from PrimitiveType enum values
 */
export type PrimitiveTypeString = `${PrimitiveType}`;

/**
 * Attribute field definition
 */
export interface AttrField<Name extends string = string> {
  kind: 'attr';
  name: Name; // QName, e.g. "adtcore:name"
  type: PrimitiveTypeString;
}

/**
 * Text content field definition
 */
export interface TextField {
  kind: 'text';
  type: PrimitiveTypeString;
}

/**
 * Single child element field definition
 *
 * Supports two modes:
 * 1. Complex element with schema: { kind: 'elem', name: 'child', schema: ChildSchema }
 * 2. Simple text element: { kind: 'elem', name: 'title', type: PrimitiveType.String }
 */
export type ElemField<
  Name extends string = string,
  Sub extends ElementSchema = any
> =
  | {
      kind: 'elem';
      name: Name; // QName, e.g. "pak:transport"
      schema: Sub;
    }
  | {
      kind: 'elem';
      name: Name; // QName, e.g. "atom:title"
      type: PrimitiveTypeString;
    };

/**
 * Repeated child elements field definition
 */
export interface ElemsField<
  Name extends string = string,
  Sub extends ElementSchema = any
> {
  kind: 'elems';
  name: Name; // QName, e.g. "atom:link"
  schema: Sub;
}

/**
 * Union of all field types
 */
export type Field =
  | AttrField<any>
  | TextField
  | ElemField<any, any>
  | ElemsField<any, any>;

/**
 * Element schema definition
 */
export interface ElementSchema {
  /** Element tag name (QName), e.g. "pak:package" */
  tag: string;
  /** Namespace declarations for this element, e.g. { pak: "http://..." } */
  ns?: Record<string, string>;
  /** Field definitions mapping JSON keys to XML nodes */
  fields: Record<string, Field>;
  /** If true, preserve unmapped nodes in $any property */
  allowUnknown?: boolean;
}

/**
 * Map PrimitiveTypeString to actual TypeScript type
 */
type MapPrimitiveType<T extends PrimitiveTypeString> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : T extends 'date'
  ? Date
  : never;

/**
 * Infer TypeScript type from element schema
 */
export type InferSchema<S extends ElementSchema> = {
  [K in keyof S['fields']]: S['fields'][K] extends AttrField<any>
    ? S['fields'][K]['type'] extends PrimitiveTypeString
      ? MapPrimitiveType<S['fields'][K]['type']>
      : string | number | boolean | Date
    : S['fields'][K] extends TextField
    ? S['fields'][K]['type'] extends PrimitiveTypeString
      ? MapPrimitiveType<S['fields'][K]['type']>
      : string | number | boolean | Date
    : S['fields'][K] extends ElemField<any, infer Sub>
    ? S['fields'][K] extends { type: infer T }
      ? T extends PrimitiveTypeString
        ? MapPrimitiveType<T>
        : never
      : Sub extends ElementSchema
      ? InferSchema<Sub>
      : never
    : S['fields'][K] extends ElemsField<any, infer Sub>
    ? Sub extends ElementSchema
      ? InferSchema<Sub>[]
      : never
    : never;
};
