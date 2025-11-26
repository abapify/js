/**
 * ts-xsd Type Definitions
 *
 * Core types for XSD schema representation and TypeScript inference
 */

// =============================================================================
// Schema Definition Types
// =============================================================================

/** XSD Field (element in sequence/choice) */
export interface XsdField {
  readonly name: string;
  readonly type: string;
  readonly minOccurs?: number;
  readonly maxOccurs?: number | 'unbounded';
}

/** XSD Attribute */
export interface XsdAttribute {
  readonly name: string;
  readonly type: string;
  readonly required?: boolean;
  readonly default?: string;
}

/** XSD Element definition */
export interface XsdElement {
  readonly sequence?: readonly XsdField[];
  readonly choice?: readonly XsdField[];
  readonly attributes?: readonly XsdAttribute[];
  readonly text?: boolean; // Has text content
  readonly extends?: string; // Base type name
}

/** XSD Schema - the main schema type */
export interface XsdSchema {
  readonly ns?: string;
  readonly prefix?: string;
  readonly root?: string;
  readonly include?: readonly XsdSchema[];
  readonly elements: { readonly [key: string]: XsdElement };
}

// =============================================================================
// Type Inference Magic ✨
// =============================================================================

/** Helper: Convert union to intersection */
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/** Get elements from included schemas (one level deep) */
type IncludedElements<T extends XsdSchema> = T['include'] extends readonly XsdSchema[]
  ? UnionToIntersection<T['include'][number]['elements']>
  : {};

/** Get all elements from schema including includes */
type AllElements<T extends XsdSchema> = T['elements'] & IncludedElements<T>;

/** Infer TypeScript type from XSD schema */
export type InferXsd<T extends XsdSchema> = T['root'] extends string
  ? InferElement<AllElements<T>[T['root']], AllElements<T>>
  : {};

/** Infer type for a specific element */
export type InferElement<
  E extends XsdElement,
  Elements extends { readonly [key: string]: XsdElement }
> = InferSequence<E['sequence'], Elements> &
  InferChoice<E['choice'], Elements> &
  InferAttributes<E['attributes']> &
  InferText<E['text']>;

/** Infer sequence fields */
type InferSequence<
  S,
  Elements extends { readonly [key: string]: XsdElement }
> = S extends readonly XsdField[]
  ? {
      [F in S[number] as F['name']]: InferFieldType<F, Elements>;
    }
  : {};

/** Infer choice fields (all optional) */
type InferChoice<
  C,
  Elements extends { readonly [key: string]: XsdElement }
> = C extends readonly XsdField[]
  ? {
      [F in C[number] as F['name']]?: InferFieldType<F, Elements>;
    }
  : {};

/** Infer attributes */
type InferAttributes<A> = A extends readonly XsdAttribute[]
  ? {
      [Attr in A[number] as Attr['name']]: Attr['required'] extends true
        ? InferPrimitive<Attr['type']>
        : InferPrimitive<Attr['type']> | undefined;
    }
  : {};

/** Infer text content */
type InferText<T> = T extends true ? { $text?: string } : {};

/** Infer field type (handles arrays and optionals) */
type InferFieldType<
  F extends XsdField,
  Elements extends { readonly [key: string]: XsdElement }
> = F['maxOccurs'] extends 'unbounded' | number
  ? InferTypeRef<F['type'], Elements>[]
  : F['minOccurs'] extends 0
    ? InferTypeRef<F['type'], Elements> | undefined
    : InferTypeRef<F['type'], Elements>;

/** Resolve type reference - primitive or complex */
type InferTypeRef<
  T extends string,
  Elements extends { readonly [key: string]: XsdElement }
> = T extends keyof Elements
  ? InferElement<Elements[T], Elements>
  : InferPrimitive<T>;

/** Map XSD primitive types to TypeScript */
type InferPrimitive<T extends string> = T extends 'string'
  ? string
  : T extends 'int' | 'integer' | 'decimal' | 'float' | 'double' | 'number'
    ? number
    : T extends 'boolean'
      ? boolean
      : T extends 'date' | 'dateTime'
        ? Date
        : string; // Default to string for unknown types
