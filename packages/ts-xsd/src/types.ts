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

/** Get complexTypes from included schemas (recursive - follows include chains) */
type IncludedComplexTypes<T extends XsdSchema> = T['include'] extends readonly XsdSchema[]
  ? UnionToIntersection<
      T['include'][number]['complexType'] | IncludedComplexTypes<T['include'][number]>
    >
  : {};

/** Get all complexTypes from schema including includes (recursive) */
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
 * Infer TypeScript type for the first declared element in the schema.
 * This is useful for schemas where the first element is the "main" root element.
 * 
 * For multi-element schemas, use InferElement<Schema, 'elementName'> to get a specific element.
 * 
 * @example
 * // classes.xsd has elements: [abapClass, abapClassInclude]
 * type ClassData = InferFirstElement<typeof ClassesSchema>;  // AbapClass type only
 */
export type InferFirstElement<T extends XsdSchema> = T['element'] extends readonly [infer First, ...any[]]
  ? First extends { type: infer TypeName }
    ? TypeName extends keyof AllComplexTypes<T>
      ? InferComplexType<AllComplexTypes<T>[TypeName], AllComplexTypes<T>>
      : {}
    : {}
  : T['element'] extends readonly XsdElementDecl[]
    ? T['element'][0] extends { type: infer TypeName }
      ? TypeName extends keyof AllComplexTypes<T>
        ? InferComplexType<AllComplexTypes<T>[TypeName], AllComplexTypes<T>>
        : {}
      : {}
    : {};

/**
 * Infer TypeScript type from XSD schema.
 * 
 * - For single-element schemas: returns that element's type
 * - For multi-element schemas: returns a union of all element types
 * 
 * Use InferElement<Schema, 'elementName'> when you need a specific element's type.
 * 
 * @example
 * // Single element schema
 * type Person = InferXsd<typeof PersonSchema>;  // { name: string; age: number }
 * 
 * // Multi-element schema (like adtcore.xsd)
 * type AdtCore = InferXsd<typeof AdtCoreSchema>;  // MainObject | ObjectReferences | ...
 */
export type InferXsd<T extends XsdSchema> = T['element'] extends readonly XsdElementDecl[]
  ? T['element'][number] extends { type: infer TypeName }
    ? TypeName extends keyof AllComplexTypes<T>
      ? InferComplexType<AllComplexTypes<T>[TypeName], AllComplexTypes<T>>
      : never
    : never
  : never;

/**
 * Infer TypeScript type from XSD schema with all element types merged.
 * 
 * For multi-element schemas, instead of a union (A | B | C), this creates
 * a single object type with all fields from all elements as optional.
 * 
 * This is useful when parsing XML where you know only one root element
 * will be present, but you want type-safe access to its fields.
 * 
 * @example
 * // Multi-element schema (like adtcore.xsd)
 * type AdtCore = InferXsdMerged<typeof adtcore>;
 * // Result: { name?: string; objectReference?: Array<...>; ... }
 * 
 * const data = adtcore.parse(xml) as AdtCore;
 * data.objectReference?.[0]?.uri;  // Type-safe!
 */
export type InferXsdMerged<T extends XsdSchema> = T['element'] extends readonly XsdElementDecl[]
  ? UnionToIntersection<
      T['element'][number] extends { type: infer TypeName }
        ? TypeName extends keyof AllComplexTypes<T>
          ? Partial<InferComplexType<AllComplexTypes<T>[TypeName], AllComplexTypes<T>>>
          : never
        : never
    >
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

/** Helper: Check if a field is optional (minOccurs: 0) */
type IsOptionalField<F extends XsdField> = 
  F['minOccurs'] extends 0
    ? true   // minOccurs 0 = optional (regardless of maxOccurs)
    : false; // minOccurs not 0 (or undefined) = required

/** Infer sequence fields - uses Partial for optional fields */
type InferSequence<
  S,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = S extends readonly XsdField[]
  ? InferRequiredSequenceFields<S, ComplexTypes> & InferOptionalSequenceFields<S, ComplexTypes>
  : {};

/** Helper: Infer required sequence fields only */
type InferRequiredSequenceFields<
  S extends readonly XsdField[],
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = {
  [F in S[number] as IsOptionalField<F> extends false ? F['name'] : never]: InferFieldTypeValue<F, ComplexTypes>;
};

/** Helper: Infer optional sequence fields only */
type InferOptionalSequenceFields<
  S extends readonly XsdField[],
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = {
  [F in S[number] as IsOptionalField<F> extends true ? F['name'] : never]?: InferFieldTypeValue<F, ComplexTypes>;
};

/** Infer choice fields (all optional) */
type InferChoice<
  C,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = C extends readonly XsdField[]
  ? {
      [F in C[number] as F['name']]?: InferFieldTypeValue<F, ComplexTypes>;
    }
  : {};

/** Infer attributes - splits into required and optional */
type InferAttributes<A> = A extends readonly XsdAttribute[]
  ? {
      // Required attributes (required: true)
      [Attr in A[number] as Attr['required'] extends true ? Attr['name'] : never]: InferPrimitive<Attr['type']>;
    } & {
      // Optional attributes (required not true)
      [Attr in A[number] as Attr['required'] extends true ? never : Attr['name']]?: InferPrimitive<Attr['type']>;
    }
  : {};

/** Infer text content */
type InferText<T> = T extends true ? { $text?: string } : {};

/** Infer field type VALUE only (no | undefined - used with optional property syntax) */
type InferFieldTypeValue<
  F extends XsdField,
  ComplexTypes extends { readonly [key: string]: XsdComplexType }
> = F['maxOccurs'] extends 'unbounded'
  ? InferTypeRef<F['type'], ComplexTypes>[]  // unbounded = array
  : F['maxOccurs'] extends number
    ? F['maxOccurs'] extends 0 | 1
      ? InferTypeRef<F['type'], ComplexTypes>  // maxOccurs 0 or 1 = single value
      : InferTypeRef<F['type'], ComplexTypes>[]  // maxOccurs > 1 = array
    : InferTypeRef<F['type'], ComplexTypes>;  // no maxOccurs = single value

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

