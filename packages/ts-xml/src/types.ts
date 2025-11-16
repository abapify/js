/**
 * Primitive types supported in attributes and text content
 */
export type PrimitiveType = "string" | "number" | "boolean" | "date";

/**
 * Attribute field definition
 */
export interface AttrField<Name extends string = string> {
  kind: "attr";
  name: Name; // QName, e.g. "adtcore:name"
  type: PrimitiveType;
}

/**
 * Text content field definition
 */
export interface TextField {
  kind: "text";
  type: PrimitiveType;
}

/**
 * Single child element field definition
 */
export interface ElemField<Name extends string = string, Sub extends ElementSchema = any> {
  kind: "elem";
  name: Name; // QName, e.g. "pak:transport"
  schema: Sub;
}

/**
 * Repeated child elements field definition
 */
export interface ElemsField<Name extends string = string, Sub extends ElementSchema = any> {
  kind: "elems";
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
 * Infer TypeScript type from element schema
 */
export type InferSchema<S extends ElementSchema> = {
  [K in keyof S["fields"]]: S["fields"][K] extends AttrField<any>
    ? string | number | boolean | Date
    : S["fields"][K] extends TextField
    ? string | number | boolean | Date
    : S["fields"][K] extends ElemField<any, infer Sub>
    ? Sub extends ElementSchema
      ? InferSchema<Sub>
      : never
    : S["fields"][K] extends ElemsField<any, infer Sub>
    ? Sub extends ElementSchema
      ? InferSchema<Sub>[]
      : never
    : never;
};
