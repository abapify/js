/**
 * Type Inference for W3C XSD Schema
 * 
 * These types enable inferring TypeScript types directly from W3C-compliant
 * Schema objects defined with `as const`.
 */

// =============================================================================
// Main Entry Points
// =============================================================================

/**
 * Infer TypeScript type from a W3C Schema for the first declared element.
 * 
 * @example
 * ```typescript
 * const schema = {
 *   element: [{ name: 'Person', type: 'PersonType' }],
 *   complexType: [{ name: 'PersonType', sequence: { element: [...] } }]
 * } as const;
 * 
 * type Person = InferSchema<typeof schema>;
 * ```
 */
export type InferSchema<T extends SchemaLike> = 
  T['element'] extends readonly { name: infer N; type?: infer TypeName }[]
    ? TypeName extends string
      ? InferTypeName<TypeName, T>
      : N extends string
        ? InferTypeName<N, T>
        : never
    : never;

/**
 * Infer TypeScript type for a specific element by name.
 * 
 * @example
 * ```typescript
 * type Person = InferElement<typeof schema, 'Person'>;
 * ```
 */
export type InferElement<T extends SchemaLike, ElementName extends string> =
  FindInArray<T['element'], { name: ElementName }> extends { type?: infer TypeName }
    ? TypeName extends string
      ? InferTypeName<TypeName, T>
      : InferTypeName<ElementName, T>
    : never;

/**
 * Infer all elements as a union type.
 * 
 * @example
 * ```typescript
 * type AnyElement = InferAllElements<typeof schema>;
 * // Person | Address | ...
 * ```
 */
export type InferAllElements<T extends SchemaLike> =
  T['element'] extends readonly { name: string; type?: string }[]
    ? T['element'][number] extends { type?: infer TypeName }
      ? TypeName extends string
        ? InferTypeName<TypeName, T>
        : never
      : never
    : never;

// =============================================================================
// Schema-like type (works with both parsed and literal schemas)
// =============================================================================

/** Minimal schema shape for inference - allows additional W3C Schema properties */
export type SchemaLike = {
  readonly targetNamespace?: string;
  readonly elementFormDefault?: string;
  readonly attributeFormDefault?: string;
  readonly version?: string;
  readonly id?: string;
  readonly blockDefault?: string;
  readonly finalDefault?: string;
  readonly 'xml:lang'?: string;
  /** Namespace prefix declarations (xmlns:prefix -> namespace URI) */
  readonly xmlns?: { readonly [prefix: string]: string };
  readonly element?: readonly ElementLike[];
  readonly complexType?: readonly ComplexTypeLike[] | { readonly [name: string]: ComplexTypeLike };
  readonly simpleType?: readonly SimpleTypeLike[] | { readonly [name: string]: SimpleTypeLike };
  readonly group?: readonly unknown[];
  readonly attributeGroup?: readonly unknown[];
  readonly notation?: readonly unknown[];
  readonly annotation?: readonly unknown[];
  readonly include?: readonly unknown[];
  readonly import?: readonly unknown[];
  readonly redefine?: readonly unknown[];
  readonly override?: readonly unknown[];
  readonly defaultOpenContent?: unknown;
};

type AnnotationLike = {
  readonly documentation?: readonly unknown[];
  readonly appinfo?: readonly unknown[];
};

type ElementLike = {
  readonly name?: string;
  readonly ref?: string;
  readonly type?: string;
  readonly minOccurs?: number | string;
  readonly maxOccurs?: number | string | 'unbounded';
  readonly default?: string;
  readonly fixed?: string;
  readonly id?: string;
  readonly abstract?: boolean;
  readonly nillable?: boolean;
  readonly substitutionGroup?: string;
  readonly complexType?: ComplexTypeLike;
  readonly simpleType?: SimpleTypeLike;
  readonly annotation?: AnnotationLike;
  // Identity constraints
  readonly key?: readonly unknown[];
  readonly keyref?: readonly unknown[];
  readonly unique?: readonly unknown[];
};

type ComplexTypeLike = {
  readonly name?: string;
  readonly id?: string;
  readonly abstract?: boolean;
  readonly mixed?: boolean;
  readonly sequence?: GroupLike;
  readonly choice?: GroupLike;
  readonly all?: GroupLike;
  readonly group?: GroupRefLike;
  readonly attribute?: readonly AttributeLike[];
  readonly attributeGroup?: readonly unknown[];
  readonly anyAttribute?: AnyAttributeLike;
  readonly complexContent?: {
    readonly extension?: ExtensionLike;
    readonly restriction?: ExtensionLike;
  };
  readonly simpleContent?: {
    readonly extension?: SimpleExtensionLike;
    readonly restriction?: unknown;
  };
  readonly annotation?: AnnotationLike;
};

type GroupLike = {
  readonly minOccurs?: number | string;
  readonly maxOccurs?: number | string | 'unbounded';
  readonly element?: readonly ElementLike[];
  readonly choice?: readonly GroupLike[];
  readonly sequence?: readonly GroupLike[];
  readonly group?: readonly GroupRefLike[];
  readonly any?: readonly unknown[];
  readonly annotation?: AnnotationLike;
};

type GroupRefLike = {
  readonly ref?: string;
  readonly minOccurs?: number | string;
  readonly maxOccurs?: number | string | 'unbounded';
};

type AttributeLike = {
  readonly name?: string;
  readonly ref?: string;
  readonly type?: string;
  readonly use?: 'prohibited' | 'optional' | 'required';
  readonly default?: string;
  readonly fixed?: string;
  readonly id?: string;
  readonly simpleType?: SimpleTypeLike;
  readonly annotation?: AnnotationLike;
};

type AnyAttributeLike = {
  readonly namespace?: string;
  readonly processContents?: 'strict' | 'lax' | 'skip';
};

type ExtensionLike = {
  readonly base?: string;
  readonly sequence?: GroupLike;
  readonly choice?: GroupLike;
  readonly all?: GroupLike;
  readonly group?: GroupRefLike;
  readonly attribute?: readonly AttributeLike[];
  readonly attributeGroup?: readonly unknown[];
  readonly anyAttribute?: AnyAttributeLike;
  readonly annotation?: AnnotationLike;
};

type SimpleExtensionLike = {
  readonly base?: string;
  readonly attribute?: readonly AttributeLike[];
  readonly attributeGroup?: readonly unknown[];
  readonly anyAttribute?: AnyAttributeLike;
};

type SimpleTypeLike = {
  readonly name?: string;
  readonly id?: string;
  readonly annotation?: AnnotationLike;
  readonly restriction?: {
    readonly base?: string;
    readonly enumeration?: readonly { value: string }[];
    readonly pattern?: readonly unknown[];
    readonly minLength?: readonly unknown[];
    readonly maxLength?: readonly unknown[];
    readonly minInclusive?: readonly unknown[];
    readonly maxInclusive?: readonly unknown[];
    readonly minExclusive?: readonly unknown[];
    readonly maxExclusive?: readonly unknown[];
    readonly whiteSpace?: readonly unknown[];
    readonly simpleType?: SimpleTypeLike;
  };
  readonly list?: {
    readonly itemType?: string;
    readonly simpleType?: SimpleTypeLike;
  };
  readonly union?: {
    readonly memberTypes?: string;
    readonly simpleType?: readonly SimpleTypeLike[];
  };
};

// =============================================================================
// Type Resolution
// =============================================================================

/** Strip any namespace prefix from a type name (e.g., "tns:PersonType" -> "PersonType") */
type StripNsPrefix<T extends string> =
  T extends `${string}:${infer LocalName}` ? LocalName : T;

/** Resolve a type name to its TypeScript type */
type InferTypeName<TypeName extends string, T extends SchemaLike> =
  // Check for XSD built-in types first (xs:string, xsd:int, etc.)
  TypeName extends `xs:${infer BuiltIn}` | `xsd:${infer BuiltIn}`
    ? InferBuiltInType<BuiltIn>
    : TypeName extends keyof XsdBuiltInTypes
      ? XsdBuiltInTypes[TypeName]
      // Strip namespace prefix and look up in schema types
      : FindComplexType<StripNsPrefix<TypeName>, T> extends infer CT
        // Use [CT] extends [never] to properly check for never (avoids distribution)
        ? [CT] extends [never]
          // Not found in complexType, look up in simpleType
          ? FindSimpleType<StripNsPrefix<TypeName>, T> extends infer ST
            ? [ST] extends [never]
              ? unknown
              : ST extends SimpleTypeLike
                ? InferSimpleType<ST>
                : unknown
            : unknown
          : CT extends ComplexTypeLike
            ? InferComplexType<CT, T>
            : unknown
        : unknown;

/** Find a complexType by name */
type FindComplexType<Name extends string, T extends SchemaLike> =
  T['complexType'] extends readonly ComplexTypeLike[]
    ? FindInArray<T['complexType'], { name: Name }>
    : T['complexType'] extends { readonly [key: string]: ComplexTypeLike }
      ? Name extends keyof T['complexType']
        ? T['complexType'][Name]
        : never
      : never;

/** Find a simpleType by name */
type FindSimpleType<Name extends string, T extends SchemaLike> =
  T['simpleType'] extends readonly SimpleTypeLike[]
    ? FindInArray<T['simpleType'], { name: Name }>
    : T['simpleType'] extends { readonly [key: string]: SimpleTypeLike }
      ? Name extends keyof T['simpleType']
        ? T['simpleType'][Name]
        : never
      : never;

// =============================================================================
// ComplexType Inference
// =============================================================================

/** Infer type from a complexType definition */
type InferComplexType<CT extends ComplexTypeLike, T extends SchemaLike> =
  // Handle complexContent extension (inheritance)
  CT['complexContent'] extends { extension: infer Ext }
    ? Ext extends ExtensionLike
      ? InferExtension<Ext, T> & InferComplexTypeContent<CT, T>
      : InferComplexTypeContent<CT, T>
    // Handle simpleContent extension (text content with attributes)
    : CT['simpleContent'] extends { extension: infer Ext }
      ? Ext extends SimpleExtensionLike
        ? InferSimpleContentExtension<Ext, T>
        : InferComplexTypeContent<CT, T>
      : InferComplexTypeContent<CT, T>;

/** Infer content from complexType (sequence, choice, all, attributes) */
type InferComplexTypeContent<CT extends ComplexTypeLike, T extends SchemaLike> =
  InferGroup<CT['sequence'], T> &
  InferGroup<CT['all'], T> &
  InferChoice<CT['choice'], T> &
  InferAttributes<CT['attribute']>;

/** Infer from complexContent/extension */
type InferExtension<Ext extends ExtensionLike, T extends SchemaLike> =
  // Inherit from base type
  (Ext['base'] extends string ? InferTypeName<Ext['base'], T> : {}) &
  // Add own content
  InferGroup<Ext['sequence'], T> &
  InferGroup<Ext['all'], T> &
  InferChoice<Ext['choice'], T> &
  InferAttributes<Ext['attribute']>;

/** Infer from simpleContent/extension (text content + attributes) */
type InferSimpleContentExtension<Ext extends SimpleExtensionLike, T extends SchemaLike> =
  (Ext['base'] extends string ? { _text: InferBuiltInType<StripPrefix<Ext['base']>> } : {}) &
  InferAttributes<Ext['attribute']>;

// =============================================================================
// Group Inference (sequence, all, choice)
// =============================================================================

/** Infer from a group (sequence or all) */
type InferGroup<G, T extends SchemaLike> =
  G extends GroupLike
    ? InferElements<G['element'], T> &
      InferNestedSequences<G['sequence'], T> &
      InferNestedChoices<G['choice'], T>
    : {};

/** Infer from choice (union of possibilities) */
type InferChoice<G, T extends SchemaLike> =
  G extends GroupLike
    ? Partial<InferElements<G['element'], T>>
    : {};

/** Infer nested sequences */
type InferNestedSequences<S, T extends SchemaLike> =
  S extends readonly GroupLike[]
    ? UnionToIntersection<InferGroup<S[number], T>>
    : {};

/** Infer nested choices */
type InferNestedChoices<C, T extends SchemaLike> =
  C extends readonly GroupLike[]
    ? Partial<UnionToIntersection<InferGroup<C[number], T>>>
    : {};

// =============================================================================
// Element Inference
// =============================================================================

/** Infer from element array */
type InferElements<E, T extends SchemaLike> =
  E extends readonly ElementLike[]
    ? InferRequiredElements<E, T> & InferOptionalElements<E, T>
    : {};

/** Infer required elements (minOccurs != 0) */
type InferRequiredElements<E extends readonly ElementLike[], T extends SchemaLike> = {
  [K in ExtractRequiredElementNames<E>]: InferElementType<
    Extract<E[number], { name: K }>,
    T
  >;
};

/** Infer optional elements (minOccurs = 0) */
type InferOptionalElements<E extends readonly ElementLike[], T extends SchemaLike> = {
  [K in ExtractOptionalElementNames<E>]?: InferElementType<
    Extract<E[number], { name: K }>,
    T
  >;
};

/** Extract names of required elements */
type ExtractRequiredElementNames<E extends readonly ElementLike[]> =
  E[number] extends infer El
    ? El extends { name: infer N; minOccurs?: infer Min }
      ? Min extends 0 | '0'
        ? never
        : N extends string
          ? N
          : never
      : never
    : never;

/** Extract names of optional elements */
type ExtractOptionalElementNames<E extends readonly ElementLike[]> =
  E[number] extends infer El
    ? El extends { name: infer N; minOccurs: 0 | '0' }
      ? N extends string
        ? N
        : never
      : never
    : never;

/** Infer type for a single element */
type InferElementType<El extends ElementLike, T extends SchemaLike> =
  // Check for inline complexType
  El extends { complexType: infer CT }
    ? CT extends ComplexTypeLike
      ? WrapArray<InferComplexType<CT, T>, El>
      : WrapArray<unknown, El>
    // Check for inline simpleType
    : El extends { simpleType: infer ST }
      ? ST extends SimpleTypeLike
        ? WrapArray<InferSimpleType<ST>, El>
        : WrapArray<unknown, El>
      // Reference to named type
      : El extends { type: infer TypeName }
        ? TypeName extends string
          ? WrapArray<InferTypeName<TypeName, T>, El>
          : WrapArray<unknown, El>
        : WrapArray<unknown, El>;

/** Wrap in array if maxOccurs > 1 or unbounded */
type WrapArray<T, El extends ElementLike> =
  El extends { maxOccurs: 'unbounded' | infer Max }
    ? Max extends 'unbounded'
      ? T[]
      : Max extends number
        ? Max extends 0 | 1
          ? T
          : T[]
        : Max extends `${number}`
          ? T[]  // String number > 1 assumed
          : T
    : T;

// =============================================================================
// Attribute Inference
// =============================================================================

/** Infer from attribute array */
type InferAttributes<A> =
  A extends readonly AttributeLike[]
    ? InferRequiredAttributes<A> & InferOptionalAttributes<A>
    : {};

/** Infer required attributes (use="required") */
type InferRequiredAttributes<A extends readonly AttributeLike[]> = {
  [K in ExtractRequiredAttributeNames<A>]: InferAttributeType<
    Extract<A[number], { name: K }>
  >;
};

/** Infer optional attributes (use != "required") */
type InferOptionalAttributes<A extends readonly AttributeLike[]> = {
  [K in ExtractOptionalAttributeNames<A>]?: InferAttributeType<
    Extract<A[number], { name: K }>
  >;
};

/** Extract names of required attributes */
type ExtractRequiredAttributeNames<A extends readonly AttributeLike[]> =
  A[number] extends infer Attr
    ? Attr extends { name: infer N; use: 'required' }
      ? N extends string
        ? N
        : never
      : never
    : never;

/** Extract names of optional attributes */
type ExtractOptionalAttributeNames<A extends readonly AttributeLike[]> =
  A[number] extends infer Attr
    ? Attr extends { name: infer N; use?: infer Use }
      ? Use extends 'required'
        ? never
        : N extends string
          ? N
          : never
      : never
    : never;

/** Infer type for a single attribute */
type InferAttributeType<Attr extends AttributeLike> =
  Attr extends { type: infer TypeName }
    ? TypeName extends string
      ? InferBuiltInType<StripPrefix<TypeName>>
      : string
    : string;

// =============================================================================
// SimpleType Inference
// =============================================================================

/** Infer from simpleType (enums, restrictions) */
type InferSimpleType<ST extends SimpleTypeLike> =
  ST extends { restriction: { enumeration: readonly { value: infer V }[] } }
    ? V extends string
      ? V
      : string
    : ST extends { restriction: { base: infer Base } }
      ? Base extends string
        ? InferBuiltInType<StripPrefix<Base>>
        : string
      : string;

// =============================================================================
// Built-in XSD Types
// =============================================================================

/** Map XSD built-in types to TypeScript */
type XsdBuiltInTypes = {
  string: string;
  normalizedString: string;
  token: string;
  language: string;
  Name: string;
  NCName: string;
  ID: string;
  IDREF: string;
  IDREFS: string[];
  ENTITY: string;
  ENTITIES: string[];
  NMTOKEN: string;
  NMTOKENS: string[];
  boolean: boolean;
  base64Binary: string;
  hexBinary: string;
  float: number;
  double: number;
  decimal: number;
  integer: number;
  nonPositiveInteger: number;
  negativeInteger: number;
  long: number;
  int: number;
  short: number;
  byte: number;
  nonNegativeInteger: number;
  unsignedLong: number;
  unsignedInt: number;
  unsignedShort: number;
  unsignedByte: number;
  positiveInteger: number;
  date: string;
  time: string;
  dateTime: string;
  duration: string;
  gYear: string;
  gYearMonth: string;
  gMonth: string;
  gMonthDay: string;
  gDay: string;
  anyURI: string;
  QName: string;
  NOTATION: string;
  anyType: unknown;
  anySimpleType: string | number | boolean;
};

/** Infer built-in type by name */
type InferBuiltInType<Name extends string> =
  Name extends keyof XsdBuiltInTypes
    ? XsdBuiltInTypes[Name]
    : unknown;

// =============================================================================
// Utility Types
// =============================================================================

/** Strip xs: or xsd: prefix */
type StripPrefix<T extends string> =
  T extends `xs:${infer Rest}` ? Rest :
  T extends `xsd:${infer Rest}` ? Rest :
  T;

/** Find item in array by partial match */
type FindInArray<Arr, Match> =
  Arr extends readonly [infer First, ...infer Rest]
    ? First extends Match
      ? First
      : FindInArray<Rest, Match>
    : Arr extends readonly (infer Item)[]
      ? Item extends Match
        ? Extract<Item, Match>
        : never
      : never;

/** Convert union to intersection */
type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;
