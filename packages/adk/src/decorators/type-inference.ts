/**
 * Generic XML Type Inference System
 *
 * This module provides a truly generic system for encoding XML metadata at the type level
 * and extracting it to generate parsed XML type structures automatically.
 *
 * The system is completely domain-agnostic - it knows nothing about specific XML schemas.
 */

/**
 * Type-Level Registry Approach
 * Instead of embedding metadata in types, we use a registry that maps
 * property names to their XML representation
 */

/**
 * Nested schema for complex structures
 * Uses the same format as XMLPropertySchema for consistency
 */
export type NestedXMLSchema = {
  [propertyName: string]: XMLPropertyMeta;
};

/**
 * Base interface for XML property metadata
 */
export interface XMLPropertyMeta {
  readonly kind: 'attr' | 'elem';
  readonly namespace: string;
  readonly elementName?: string;
  readonly structure?: NestedXMLSchema; // Recursive schema structure
}

/**
 * Classes can declare their XML mapping by augmenting this interface
 */
export interface XMLPropertySchema {
  // This will be augmented by each class
}

/**
 * Utility types for creating schema entries more concisely
 */
export type AttrSchema<Namespace extends string> = {
  kind: 'attr';
  namespace: Namespace;
};

export type ElemSchema<
  Namespace extends string,
  ElementName extends string = string
> = {
  kind: 'elem';
  namespace: Namespace;
  elementName: ElementName;
};

export type ElemWithStructure<
  Namespace extends string,
  ElementName extends string,
  Structure extends NestedXMLSchema
> = {
  kind: 'elem';
  namespace: Namespace;
  elementName: ElementName;
  structure: Structure;
};

/**
 * Reusable schema for ABAP syntax configuration
 * Can be used across different XML classes that need syntax configuration
 */
export type SyntaxConfigurationSchema = ElemWithStructure<
  'abapsource',
  'syntaxConfiguration',
  {
    language: ElemWithStructure<
      'abapsource',
      'language',
      {
        version: ElemSchema<'abapsource', 'version'>;
        description: ElemSchema<'abapsource', 'description'>;
        link: ElemWithStructure<
          'atom',
          'link',
          {
            href: AttrSchema<'atom'>;
            rel: AttrSchema<'atom'>;
            type: AttrSchema<'atom'>;
            title: AttrSchema<'atom'>;
            etag: AttrSchema<'atom'>;
          }
        >;
      }
    >;
  }
>;

/**
 * Simplified type aliases for cleaner class definitions
 */
export type Attr<Namespace extends string, T> = T;
export type Elem<Namespace extends string, ElementName extends string, T> = T;

/**
 * Transform object properties to XML attribute format
 * @example AdtCoreType -> { '@_adtcore:name': string, '@_adtcore:type': string, ... }
 */
type ToXMLAttributes<T, Namespace extends string> = {
  [K in keyof T as `@_${Namespace}:${string & K}`]: string; // fast-xml-parser gives strings
};

/**
 * Transform object properties to XML element format with attributes
 * @example PackageRefType -> { '@_adtcore:uri': string, '@_adtcore:type': string, ... }
 */
type ToXMLElementWithAttributes<T, Namespace extends string> = {
  [K in keyof T as `@_${Namespace}:${string & K}`]: string;
};

/**
 * Transform array type to XML element array format
 * Special case: atom links don't use namespace prefixes in attributes (SAP ADT format)
 */
type ToXMLElementArray<T, Namespace extends string> = T extends Array<infer U>
  ? Namespace extends 'atom'
    ? Array<
        {
          [K in keyof U as `@_${string & K}`]: string; // No namespace prefix for atom attributes
        } & { '@_xmlns:atom'?: string }
      >
    : Array<ToXMLElementWithAttributes<U, Namespace>>
  : never;

/**
 * Extract nested XML structure from a schema
 * Uses proper recursive type transformation
 */
type ExtractNestedStructure<Schema extends NestedXMLSchema> = {
  [K in keyof Schema as Schema[K] extends { kind: 'attr'; namespace: infer NS }
    ? NS extends 'atom'
      ? `@_${string & K}` // Atom attributes without namespace
      : `@_${Schema[K] extends { namespace: infer NS } ? NS : never}:${string &
          K}` // Other attributes with namespace
    : Schema[K] extends {
        kind: 'elem';
        namespace: infer NS;
        elementName: infer EN;
      }
    ? `${NS extends string ? NS : never}:${EN extends string ? EN : never}`
    : never]: Schema[K] extends { kind: 'attr' }
    ? string | undefined
    : Schema[K] extends { structure: infer NestedSchema }
    ? NestedSchema extends NestedXMLSchema
      ? ExtractNestedStructure<NestedSchema>
      : never
    : string | undefined;
};

/**
 * TRULY GENERIC XML type extraction using schema
 * This has ZERO knowledge of specific property names or namespaces!
 * Now supports recursive nested structures via schema pattern
 */
export type ExtractXMLTypeWithSchema<
  T,
  Schema = XMLPropertySchema
> = UnionToIntersection<
  {
    [K in keyof T & keyof Schema]: Schema[K] extends {
      kind: 'attr';
      namespace: infer NS;
    }
      ? NS extends string
        ? ToXMLAttributes<T[K], NS>
        : {}
      : Schema[K] extends {
          kind: 'elem';
          namespace: infer NS;
          elementName: infer EN;
          structure: infer NestedSchema;
        }
      ? NS extends string
        ? EN extends string
          ? NestedSchema extends NestedXMLSchema
            ? { [E in `${NS}:${EN}`]?: ExtractNestedStructure<NestedSchema> }
            : {}
          : {}
        : {}
      : Schema[K] extends {
          kind: 'elem';
          namespace: infer NS;
          elementName: infer EN;
        }
      ? NS extends string
        ? EN extends string
          ? T[K] extends Array<any>
            ? { [E in `${NS}:${EN}`]?: ToXMLElementArray<T[K], NS> }
            : { [E in `${NS}:${EN}`]?: ToXMLElementWithAttributes<T[K], NS> }
          : {}
        : {}
      : {};
  }[keyof T & keyof Schema]
>;

/**
 * Configuration interface for property-to-XML mapping
 * This enables the generic system to work with any domain (not just SAP ADT)
 */
export interface PropertyXMLConfig {
  /** Properties that should be treated as XML attributes */
  attributeProperties: string[];
  /** Map property names to XML namespaces */
  namespaceMap: Record<string, string>;
  /** Map property names to XML element names */
  elementNameMap: Record<string, string>;
  /** Complex structure definitions for special cases */
  complexStructures: Record<string, any>;
}

/**
 * Configurable Generic Property Transformation
 * This works with any domain via configuration, making the system truly generic
 */
type InferPropertyTransformGeneric<K, V, Config extends PropertyXMLConfig> =
  // Check if this is an attribute property
  K extends Config['attributeProperties'][number]
    ? K extends keyof Config['namespaceMap']
      ? Config['namespaceMap'][K] extends string
        ? ToXMLAttributes<V, Config['namespaceMap'][K]>
        : never
      : never
    : // Check if this is an element property
    K extends keyof Config['namespaceMap']
    ? Config['namespaceMap'][K] extends string
      ? V extends Array<any>
        ? // Array element
          K extends keyof Config['elementNameMap']
          ? Config['elementNameMap'][K] extends string
            ? {
                [E in `${Config['namespaceMap'][K]}:${Config['elementNameMap'][K]}`]?: ToXMLElementArray<
                  V,
                  Config['namespaceMap'][K]
                >;
              }
            : never
          : never
        : // Single element
        K extends keyof Config['elementNameMap']
        ? Config['elementNameMap'][K] extends string
          ? K extends keyof Config['complexStructures']
            ? Config['complexStructures'][K]
            : {
                [E in `${Config['namespaceMap'][K]}:${Config['elementNameMap'][K]}`]?: ToXMLElementWithAttributes<
                  V,
                  Config['namespaceMap'][K]
                >;
              }
          : never
        : never
      : never
    : never;

/**
 * Legacy: Configuration-Based Generic Type Inference
 * Kept for backward compatibility - prefer metadata-carrying types instead
 */
export type InferXMLParsedTypeGeneric<
  T,
  Config extends PropertyXMLConfig
> = UnionToIntersection<
  {
    [K in keyof T]: InferPropertyTransformGeneric<K, T[K], Config>;
  }[keyof T]
>;

/**
 * Helper type to convert union to intersection
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * ✅ Clean Configurable Generic System
 *
 * Usage:
 * ```typescript
 * const config: PropertyXMLConfig = {
 *   attributeProperties: ['metadata', 'headers'],
 *   namespaceMap: { metadata: 'meta', data: 'response' },
 *   elementNameMap: { items: 'item', users: 'user' },
 *   complexStructures: {}
 * };
 * type ParsedType = InferXMLParsedTypeGeneric<MyClass, typeof config>;
 * ```
 */

/**
 * Type-safe accessor helpers
 */
export namespace XMLParsedHelpers {
  export function parseBoolean(value: string | undefined): boolean {
    return value === 'true';
  }

  export function parseNumber(value: string | undefined): number | undefined {
    return value ? parseInt(value, 10) : undefined;
  }

  export function parseDate(value: string | undefined): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  export function parseVersion(
    value: string | undefined
  ): 'active' | 'inactive' | undefined {
    return value as 'active' | 'inactive' | undefined;
  }
}
