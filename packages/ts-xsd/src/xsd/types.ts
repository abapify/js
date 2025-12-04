/**
 * XSD Document Types
 * 
 * TypeScript types for XSD documents parsed using the XSD schema.
 * These types represent the structure of XSD files.
 */

/** XSD import declaration */
export interface XsdImportDecl {
  namespace?: string;
  schemaLocation?: string;
}

/** XSD include declaration */
export interface XsdIncludeDecl {
  schemaLocation: string;
}

/** XSD redefine declaration */
export interface XsdRedefineDecl {
  schemaLocation: string;
  complexType?: XsdComplexTypeDecl[];
  simpleType?: XsdSimpleTypeDecl[];
}

/** XSD element declaration (top-level) */
export interface XsdTopLevelElementDecl {
  name: string;
  type?: string;
  abstract?: string;
  substitutionGroup?: string;
  complexType?: XsdLocalComplexTypeDecl;
  simpleType?: XsdLocalSimpleTypeDecl;
}

/** XSD element declaration (local/nested) */
export interface XsdLocalElementDecl {
  name?: string;
  type?: string;
  ref?: string;
  minOccurs?: string;
  maxOccurs?: string;
  complexType?: XsdLocalComplexTypeDecl;
  simpleType?: XsdLocalSimpleTypeDecl;
}

/** XSD complexType declaration (named) */
export interface XsdComplexTypeDecl {
  name: string;
  mixed?: string;
  sequence?: XsdSequenceDecl;
  all?: XsdAllDecl;
  choice?: XsdChoiceDecl;
  complexContent?: XsdComplexContentDecl;
  simpleContent?: XsdSimpleContentDecl;
  attribute?: XsdAttributeDecl[];
}

/** XSD complexType declaration (local/inline) */
export interface XsdLocalComplexTypeDecl {
  mixed?: string;
  sequence?: XsdSequenceDecl;
  all?: XsdAllDecl;
  choice?: XsdChoiceDecl;
  complexContent?: XsdComplexContentDecl;
  simpleContent?: XsdSimpleContentDecl;
  attribute?: XsdAttributeDecl[];
}

/** XSD sequence compositor */
export interface XsdSequenceDecl {
  minOccurs?: string;
  maxOccurs?: string;
  element?: XsdLocalElementDecl[];
  choice?: XsdChoiceDecl[];
  sequence?: XsdSequenceDecl[];
}

/** XSD all compositor */
export interface XsdAllDecl {
  minOccurs?: string;
  maxOccurs?: string;
  element?: XsdLocalElementDecl[];
}

/** XSD choice compositor */
export interface XsdChoiceDecl {
  minOccurs?: string;
  maxOccurs?: string;
  element?: XsdLocalElementDecl[];
  sequence?: XsdSequenceDecl[];
  choice?: XsdChoiceDecl[];
}

/** XSD complexContent */
export interface XsdComplexContentDecl {
  extension?: XsdExtensionDecl;
  restriction?: XsdComplexRestrictionDecl;
}

/** XSD simpleContent */
export interface XsdSimpleContentDecl {
  extension?: XsdSimpleExtensionDecl;
  restriction?: XsdSimpleRestrictionDecl;
}

/** XSD extension (for complexContent) */
export interface XsdExtensionDecl {
  base: string;
  sequence?: XsdSequenceDecl;
  all?: XsdAllDecl;
  choice?: XsdChoiceDecl;
  attribute?: XsdAttributeDecl[];
}

/** XSD extension (for simpleContent) */
export interface XsdSimpleExtensionDecl {
  base: string;
  attribute?: XsdAttributeDecl[];
}

/** XSD restriction (for complexContent) */
export interface XsdComplexRestrictionDecl {
  base: string;
  sequence?: XsdSequenceDecl;
  all?: XsdAllDecl;
  choice?: XsdChoiceDecl;
  attribute?: XsdAttributeDecl[];
}

/** XSD restriction (for simpleContent/simpleType) */
export interface XsdSimpleRestrictionDecl {
  base: string;
  enumeration?: XsdEnumerationDecl[];
  pattern?: XsdPatternDecl;
  minLength?: XsdFacetDecl;
  maxLength?: XsdFacetDecl;
  minInclusive?: XsdFacetDecl;
  maxInclusive?: XsdFacetDecl;
}

/** XSD attribute declaration */
export interface XsdAttributeDecl {
  name?: string;
  type?: string;
  ref?: string;
  use?: string;
  default?: string;
  fixed?: string;
  simpleType?: XsdLocalSimpleTypeDecl;
}

/** XSD simpleType declaration (named) */
export interface XsdSimpleTypeDecl {
  name: string;
  restriction?: XsdSimpleRestrictionDecl;
  list?: XsdListDecl;
  union?: XsdUnionDecl;
}

/** XSD simpleType declaration (local/inline) */
export interface XsdLocalSimpleTypeDecl {
  restriction?: XsdSimpleRestrictionDecl;
  list?: XsdListDecl;
  union?: XsdUnionDecl;
}

/** XSD enumeration facet */
export interface XsdEnumerationDecl {
  value: string;
}

/** XSD pattern facet */
export interface XsdPatternDecl {
  value: string;
}

/** XSD generic facet (minLength, maxLength, etc.) */
export interface XsdFacetDecl {
  value: string;
}

/** XSD list type */
export interface XsdListDecl {
  itemType?: string;
}

/** XSD union type */
export interface XsdUnionDecl {
  memberTypes?: string;
}

/**
 * XSD Document - the root structure of an XSD file
 */
export interface XsdDocument {
  /** Target namespace URI */
  targetNamespace?: string;
  /** Element form default */
  elementFormDefault?: string;
  /** Attribute form default */
  attributeFormDefault?: string;
  /** Import declarations */
  import?: XsdImportDecl[];
  /** Include declarations */
  include?: XsdIncludeDecl[];
  /** Redefine declarations */
  redefine?: XsdRedefineDecl[];
  /** Top-level element declarations */
  element?: XsdTopLevelElementDecl[];
  /** Named complexType declarations */
  complexType?: XsdComplexTypeDecl[];
  /** Named simpleType declarations */
  simpleType?: XsdSimpleTypeDecl[];
}
