/**
 * ts-xsd Type Definitions
 *
 * Core types for XSD schema representation and TypeScript inference
 * 
 * This module provides a faithful representation of XSD structure:
 * - element[] for top-level xsd:element declarations
 * - complexType{} for xsd:complexType definitions
 * - simpleType{} for xsd:simpleType definitions (enums, restrictions)
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

/** XSD ComplexType definition */
export interface XsdComplexType {
  readonly sequence?: readonly XsdField[];
  readonly choice?: readonly XsdField[];
  readonly attributes?: readonly XsdAttribute[];
  readonly text?: boolean; // Has text content (simpleContent or mixed)
  readonly extends?: string; // Base type name (from complexContent/extension)
}

/** XSD SimpleType definition (enums, restrictions) */
export interface XsdSimpleType {
  readonly restriction: string; // Base type (e.g., 'string', 'int')
  readonly enum?: readonly string[]; // Enumeration values
  readonly pattern?: string; // Regex pattern
  readonly minLength?: number;
  readonly maxLength?: number;
}

/** XSD Element declaration (top-level xsd:element) */
export interface XsdElementDecl {
  readonly name: string;
  readonly type: string;
}

/** XSD Schema - faithful representation of XSD structure */
export interface XsdSchema {
  readonly ns?: string;
  readonly prefix?: string;
  
  /** Top-level xsd:element declarations */
  readonly element?: readonly XsdElementDecl[];
  /** xsd:complexType definitions */
  readonly complexType: { readonly [key: string]: XsdComplexType };
  /** xsd:simpleType definitions */
  readonly simpleType?: { readonly [key: string]: XsdSimpleType };
  
  /** Included schemas (from xsd:import/xsd:include) */
  readonly include?: readonly XsdSchema[];
  
  /** 
   * XSD attributeFormDefault - controls whether locally declared attributes
   * must be namespace-qualified. Default is 'unqualified'.
   * @see https://www.w3.org/TR/xmlschema-1/#declare-schema
   */
  readonly attributeFormDefault?: 'qualified' | 'unqualified';
  
  /**
   * XSD elementFormDefault - controls whether locally declared elements
   * must be namespace-qualified. Default is 'unqualified'.
   * @see https://www.w3.org/TR/xmlschema-1/#declare-schema
   */
  readonly elementFormDefault?: 'qualified' | 'unqualified';
}

// =============================================================================
// Type Inference Magic ✨
// =============================================================================

/** Helper: Convert union to intersection */
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/** Get complexTypes from included schemas (one level deep) */
type IncludedComplexTypes<T extends XsdSchema> = T['include'] extends readonly XsdSchema[]
  ? UnionToIntersection<T['include'][number]['complexType']>
  : {};

/** Get all complexTypes from schema including includes */
type AllComplexTypes<T extends XsdSchema> = T['complexType'] & IncludedComplexTypes<T>;

/** 
 * Infer TypeScript type for a specific element name
 * Looks up element declaration, gets its type, and infers from complexType
 */
export type InferElement<
  T extends XsdSchema,
  ElementName extends string
> = T['element'] extends readonly XsdElementDecl[]
  ? Extract<T['element'][number], { name: ElementName }> extends { type: infer TypeName }
    ? TypeName extends keyof AllComplexTypes<T>
      ? InferComplexType<AllComplexTypes<T>[TypeName], AllComplexTypes<T>>
      : {}
    : {}
  : {};

/**
 * Infer TypeScript type from XSD schema for the first declared element.
 * This is the primary inference type for schemas with a single root element.
 * 
 * For schemas with multiple elements, use:
 * - InferElement<Schema, 'elementName'> for a specific element
 * - InferAnyElement<Schema> for a union of all elements
 */
export type InferXsd<T extends XsdSchema> = T['element'] extends readonly [{ type: infer TypeName }, ...unknown[]]
  ? TypeName extends keyof AllComplexTypes<T>
    ? InferComplexType<AllComplexTypes<T>[TypeName], AllComplexTypes<T>>
    : {}
  : {};

/**
 * Infer a union type of all declared elements in the schema.
 * Each element is inferred as its own type in the union.
 * 
 * @example
 * // Schema with elements: [{ name: 'Person', type: 'Person' }, { name: 'Order', type: 'Order' }]
 * type AnyElement = InferAnyElement<typeof Schema>;
 * // Result: { FirstName: string; LastName: string } | { items: Item[] }
 */
export type InferAnyElement<T extends XsdSchema> = T['element'] extends readonly XsdElementDecl[]
  ? T['element'][number] extends { type: infer TypeName }
    ? TypeName extends keyof AllComplexTypes<T>
      ? InferComplexType<AllComplexTypes<T>[TypeName], AllComplexTypes<T>>
      : never
    : never
  : never;

/** Infer type for a complexType (including inherited fields from extends) */
export type InferComplexType<
  CT extends XsdComplexType,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = InferExtends<CT['extends'], ComplexTypes> &
  InferSequence<CT['sequence'], ComplexTypes> &
  InferChoice<CT['choice'], ComplexTypes> &
  InferAttributes<CT['attributes']> &
  InferText<CT['text']>;

/** Infer inherited fields from base type */
type InferExtends<
  Base,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = Base extends string
  ? Base extends keyof ComplexTypes
    ? InferComplexType<ComplexTypes[Base], ComplexTypes>
    : {}
  : {};

/** Infer sequence fields */
type InferSequence<
  S,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = S extends readonly XsdField[]
  ? {
      [F in S[number] as F['name']]: InferFieldType<F, ComplexTypes>;
    }
  : {};

/** Infer choice fields (all optional) */
type InferChoice<
  C,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = C extends readonly XsdField[]
  ? {
      [F in C[number] as F['name']]?: InferFieldType<F, ComplexTypes>;
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
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = F['maxOccurs'] extends 'unbounded'
  ? InferTypeRef<F['type'], ComplexTypes>[]  // unbounded = always array
  : F['maxOccurs'] extends number
    ? F['maxOccurs'] extends 0 | 1
      ? F['minOccurs'] extends 0
        ? InferTypeRef<F['type'], ComplexTypes> | undefined  // maxOccurs 0 or 1 = single/optional
        : InferTypeRef<F['type'], ComplexTypes>              // maxOccurs 1, minOccurs 1 = required single
      : InferTypeRef<F['type'], ComplexTypes>[]              // maxOccurs > 1 = array
    : F['minOccurs'] extends 0
      ? InferTypeRef<F['type'], ComplexTypes> | undefined    // no maxOccurs, optional
      : InferTypeRef<F['type'], ComplexTypes>;               // no maxOccurs, required

/** Resolve type reference - primitive or complex */
type InferTypeRef<
  T extends string,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = T extends keyof ComplexTypes
  ? InferComplexType<ComplexTypes[T], ComplexTypes>
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

