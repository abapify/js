/**
 * XSD Schema Definitions using ts-xml
 *
 * This module defines ts-xml schemas for parsing XSD files.
 * Dogfooding: we use ts-xml to parse XSD, which defines XML schemas!
 */

import { tsxml, type InferSchema } from 'ts-xml';
import { XSD_NS } from './namespace';

// =============================================================================
// Primitive Schemas (leaf nodes)
// =============================================================================

/**
 * XSD Documentation element
 * <xsd:documentation xml:lang="en">...</xsd:documentation>
 */
export const XsdDocumentationSchema = tsxml.schema({
  tag: 'xsd:documentation',
  ns: { xsd: XSD_NS },
  fields: {
    lang: { kind: 'attr', name: 'xml:lang', type: 'string', optional: true },
    content: { kind: 'text', type: 'string' },
  },
} as const);

/**
 * XSD Annotation element
 * <xsd:annotation><xsd:documentation>...</xsd:documentation></xsd:annotation>
 */
export const XsdAnnotationSchema = tsxml.schema({
  tag: 'xsd:annotation',
  ns: { xsd: XSD_NS },
  fields: {
    documentation: {
      kind: 'elem',
      name: 'xsd:documentation',
      schema: XsdDocumentationSchema,
      optional: true,
    },
  },
} as const);

// =============================================================================
// Attribute Schema
// =============================================================================

/**
 * XSD Attribute element
 * <xsd:attribute name="id" type="xsd:string" use="required"/>
 */
export const XsdAttributeSchema = tsxml.schema({
  tag: 'xsd:attribute',
  ns: { xsd: XSD_NS },
  fields: {
    name: { kind: 'attr', name: 'name', type: 'string', optional: true },
    type: { kind: 'attr', name: 'type', type: 'string', optional: true },
    ref: { kind: 'attr', name: 'ref', type: 'string', optional: true },
    use: { kind: 'attr', name: 'use', type: 'string', optional: true },
    default: { kind: 'attr', name: 'default', type: 'string', optional: true },
    fixed: { kind: 'attr', name: 'fixed', type: 'string', optional: true },
  },
} as const);

// =============================================================================
// Element Schema (forward declaration pattern)
// =============================================================================

/**
 * XSD Element - basic definition
 * <xsd:element name="item" type="xsd:string" minOccurs="0" maxOccurs="unbounded"/>
 */
export const XsdElementSchema = tsxml.schema({
  tag: 'xsd:element',
  ns: { xsd: XSD_NS },
  fields: {
    name: { kind: 'attr', name: 'name', type: 'string', optional: true },
    type: { kind: 'attr', name: 'type', type: 'string', optional: true },
    ref: { kind: 'attr', name: 'ref', type: 'string', optional: true },
    minOccurs: { kind: 'attr', name: 'minOccurs', type: 'string', optional: true },
    maxOccurs: { kind: 'attr', name: 'maxOccurs', type: 'string', optional: true },
    default: { kind: 'attr', name: 'default', type: 'string', optional: true },
    fixed: { kind: 'attr', name: 'fixed', type: 'string', optional: true },
    nillable: { kind: 'attr', name: 'nillable', type: 'string', optional: true },
  },
} as const);

// =============================================================================
// Sequence / Choice / All (compositor elements)
// =============================================================================

/**
 * XSD Sequence element
 * <xsd:sequence><xsd:element .../><xsd:element .../></xsd:sequence>
 */
export const XsdSequenceSchema = tsxml.schema({
  tag: 'xsd:sequence',
  ns: { xsd: XSD_NS },
  fields: {
    minOccurs: { kind: 'attr', name: 'minOccurs', type: 'string', optional: true },
    maxOccurs: { kind: 'attr', name: 'maxOccurs', type: 'string', optional: true },
    elements: { kind: 'elems', name: 'xsd:element', schema: XsdElementSchema },
  },
} as const);

/**
 * XSD Choice element
 * <xsd:choice><xsd:element .../><xsd:element .../></xsd:choice>
 */
export const XsdChoiceSchema = tsxml.schema({
  tag: 'xsd:choice',
  ns: { xsd: XSD_NS },
  fields: {
    minOccurs: { kind: 'attr', name: 'minOccurs', type: 'string', optional: true },
    maxOccurs: { kind: 'attr', name: 'maxOccurs', type: 'string', optional: true },
    elements: { kind: 'elems', name: 'xsd:element', schema: XsdElementSchema },
  },
} as const);

/**
 * XSD All element
 * <xsd:all><xsd:element .../></xsd:all>
 */
export const XsdAllSchema = tsxml.schema({
  tag: 'xsd:all',
  ns: { xsd: XSD_NS },
  fields: {
    minOccurs: { kind: 'attr', name: 'minOccurs', type: 'string', optional: true },
    maxOccurs: { kind: 'attr', name: 'maxOccurs', type: 'string', optional: true },
    elements: { kind: 'elems', name: 'xsd:element', schema: XsdElementSchema },
  },
} as const);

// =============================================================================
// Restriction / Extension (type derivation)
// =============================================================================

/**
 * XSD Enumeration facet
 * <xsd:enumeration value="option1"/>
 */
export const XsdEnumerationSchema = tsxml.schema({
  tag: 'xsd:enumeration',
  ns: { xsd: XSD_NS },
  fields: {
    value: { kind: 'attr', name: 'value', type: 'string' },
  },
} as const);

/**
 * XSD Restriction element (for simpleType)
 * <xsd:restriction base="xsd:string"><xsd:enumeration value="..."/></xsd:restriction>
 */
export const XsdRestrictionSchema = tsxml.schema({
  tag: 'xsd:restriction',
  ns: { xsd: XSD_NS },
  fields: {
    base: { kind: 'attr', name: 'base', type: 'string' },
    enumerations: { kind: 'elems', name: 'xsd:enumeration', schema: XsdEnumerationSchema },
  },
} as const);

/**
 * XSD Extension element (for complexContent)
 * <xsd:extension base="BaseType"><xsd:sequence>...</xsd:sequence></xsd:extension>
 */
export const XsdExtensionSchema = tsxml.schema({
  tag: 'xsd:extension',
  ns: { xsd: XSD_NS },
  fields: {
    base: { kind: 'attr', name: 'base', type: 'string' },
    sequence: { kind: 'elem', name: 'xsd:sequence', schema: XsdSequenceSchema, optional: true },
    choice: { kind: 'elem', name: 'xsd:choice', schema: XsdChoiceSchema, optional: true },
    attributes: { kind: 'elems', name: 'xsd:attribute', schema: XsdAttributeSchema },
  },
} as const);

// =============================================================================
// Simple Content / Complex Content
// =============================================================================

/**
 * XSD SimpleContent element
 * <xsd:simpleContent><xsd:extension base="..."/></xsd:simpleContent>
 */
export const XsdSimpleContentSchema = tsxml.schema({
  tag: 'xsd:simpleContent',
  ns: { xsd: XSD_NS },
  fields: {
    extension: { kind: 'elem', name: 'xsd:extension', schema: XsdExtensionSchema, optional: true },
    restriction: { kind: 'elem', name: 'xsd:restriction', schema: XsdRestrictionSchema, optional: true },
  },
} as const);

/**
 * XSD ComplexContent element
 * <xsd:complexContent><xsd:extension base="...">...</xsd:extension></xsd:complexContent>
 */
export const XsdComplexContentSchema = tsxml.schema({
  tag: 'xsd:complexContent',
  ns: { xsd: XSD_NS },
  fields: {
    extension: { kind: 'elem', name: 'xsd:extension', schema: XsdExtensionSchema, optional: true },
    restriction: { kind: 'elem', name: 'xsd:restriction', schema: XsdRestrictionSchema, optional: true },
  },
} as const);

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * XSD SimpleType element
 * <xsd:simpleType name="MyEnum"><xsd:restriction base="xsd:string">...</xsd:restriction></xsd:simpleType>
 */
export const XsdSimpleTypeSchema = tsxml.schema({
  tag: 'xsd:simpleType',
  ns: { xsd: XSD_NS },
  fields: {
    name: { kind: 'attr', name: 'name', type: 'string', optional: true },
    restriction: { kind: 'elem', name: 'xsd:restriction', schema: XsdRestrictionSchema, optional: true },
  },
} as const);

/**
 * XSD ComplexType element
 * <xsd:complexType name="MyType"><xsd:sequence>...</xsd:sequence></xsd:complexType>
 */
export const XsdComplexTypeSchema = tsxml.schema({
  tag: 'xsd:complexType',
  ns: { xsd: XSD_NS },
  fields: {
    name: { kind: 'attr', name: 'name', type: 'string', optional: true },
    mixed: { kind: 'attr', name: 'mixed', type: 'string', optional: true },
    abstract: { kind: 'attr', name: 'abstract', type: 'string', optional: true },
    // Direct content model
    sequence: { kind: 'elem', name: 'xsd:sequence', schema: XsdSequenceSchema, optional: true },
    choice: { kind: 'elem', name: 'xsd:choice', schema: XsdChoiceSchema, optional: true },
    all: { kind: 'elem', name: 'xsd:all', schema: XsdAllSchema, optional: true },
    // Derived content
    simpleContent: { kind: 'elem', name: 'xsd:simpleContent', schema: XsdSimpleContentSchema, optional: true },
    complexContent: { kind: 'elem', name: 'xsd:complexContent', schema: XsdComplexContentSchema, optional: true },
    // Attributes
    attributes: { kind: 'elems', name: 'xsd:attribute', schema: XsdAttributeSchema },
    // Annotation
    annotation: { kind: 'elem', name: 'xsd:annotation', schema: XsdAnnotationSchema, optional: true },
  },
} as const);

// =============================================================================
// Import / Include
// =============================================================================

/**
 * XSD Import element
 * <xsd:import namespace="http://..." schemaLocation="..."/>
 */
export const XsdImportSchema = tsxml.schema({
  tag: 'xsd:import',
  ns: { xsd: XSD_NS },
  fields: {
    namespace: { kind: 'attr', name: 'namespace', type: 'string', optional: true },
    schemaLocation: { kind: 'attr', name: 'schemaLocation', type: 'string', optional: true },
  },
} as const);

/**
 * XSD Include element
 * <xsd:include schemaLocation="..."/>
 */
export const XsdIncludeSchema = tsxml.schema({
  tag: 'xsd:include',
  ns: { xsd: XSD_NS },
  fields: {
    schemaLocation: { kind: 'attr', name: 'schemaLocation', type: 'string' },
  },
} as const);

// =============================================================================
// Root Schema Element
// =============================================================================

/**
 * XSD Schema root element
 * <xsd:schema targetNamespace="..." xmlns:xsd="...">...</xsd:schema>
 */
export const XsdSchemaSchema = tsxml.schema({
  tag: 'xsd:schema',
  ns: { xsd: XSD_NS },
  fields: {
    // Schema attributes
    targetNamespace: { kind: 'attr', name: 'targetNamespace', type: 'string', optional: true },
    elementFormDefault: { kind: 'attr', name: 'elementFormDefault', type: 'string', optional: true },
    attributeFormDefault: { kind: 'attr', name: 'attributeFormDefault', type: 'string', optional: true },
    // Imports and includes
    imports: { kind: 'elems', name: 'xsd:import', schema: XsdImportSchema },
    includes: { kind: 'elems', name: 'xsd:include', schema: XsdIncludeSchema },
    // Type definitions
    simpleTypes: { kind: 'elems', name: 'xsd:simpleType', schema: XsdSimpleTypeSchema },
    complexTypes: { kind: 'elems', name: 'xsd:complexType', schema: XsdComplexTypeSchema },
    // Root elements
    elements: { kind: 'elems', name: 'xsd:element', schema: XsdElementSchema },
    // Annotation
    annotation: { kind: 'elem', name: 'xsd:annotation', schema: XsdAnnotationSchema, optional: true },
  },
} as const);

// =============================================================================
// Type Exports
// =============================================================================

export type XsdDocumentation = InferSchema<typeof XsdDocumentationSchema>;
export type XsdAnnotation = InferSchema<typeof XsdAnnotationSchema>;
export type XsdAttribute = InferSchema<typeof XsdAttributeSchema>;
export type XsdElement = InferSchema<typeof XsdElementSchema>;
export type XsdSequence = InferSchema<typeof XsdSequenceSchema>;
export type XsdChoice = InferSchema<typeof XsdChoiceSchema>;
export type XsdAll = InferSchema<typeof XsdAllSchema>;
export type XsdEnumeration = InferSchema<typeof XsdEnumerationSchema>;
export type XsdRestriction = InferSchema<typeof XsdRestrictionSchema>;
export type XsdExtension = InferSchema<typeof XsdExtensionSchema>;
export type XsdSimpleContent = InferSchema<typeof XsdSimpleContentSchema>;
export type XsdComplexContent = InferSchema<typeof XsdComplexContentSchema>;
export type XsdSimpleType = InferSchema<typeof XsdSimpleTypeSchema>;
export type XsdComplexType = InferSchema<typeof XsdComplexTypeSchema>;
export type XsdImport = InferSchema<typeof XsdImportSchema>;
export type XsdInclude = InferSchema<typeof XsdIncludeSchema>;
export type XsdSchema = InferSchema<typeof XsdSchemaSchema>;
