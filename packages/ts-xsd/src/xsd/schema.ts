/**
 * XSD Schema Definition
 * 
 * A ts-xsd schema that describes XSD itself (limited to supported features).
 * This enables parsing and building XSD files using ts-xsd.
 * 
 * Based on: https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd
 * Limited to features supported by ts-xsd.
 */

import type { XsdSchema } from '../types';

/**
 * XSD Schema - defines the structure of XSD files
 * 
 * Supports:
 * - xs:schema (root)
 * - xs:import, xs:include, xs:redefine
 * - xs:element (top-level and nested)
 * - xs:complexType (named and inline)
 * - xs:simpleType
 * - xs:sequence, xs:all, xs:choice
 * - xs:attribute
 * - xs:complexContent > xs:extension
 * - xs:restriction > xs:enumeration
 */
export const XsdSchemaDefinition = {
  ns: 'http://www.w3.org/2001/XMLSchema',
  prefix: 'xs',
  element: [
    { name: 'schema', type: 'schemaType' },
  ],
  complexType: {
    // Root schema element
    schemaType: {
      sequence: [
        { name: 'import', type: 'importType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'include', type: 'includeType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'redefine', type: 'redefineType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'element', type: 'topLevelElementType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'complexType', type: 'namedComplexTypeType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'simpleType', type: 'namedSimpleTypeType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'targetNamespace', type: 'string' },
        { name: 'elementFormDefault', type: 'string' },
        { name: 'attributeFormDefault', type: 'string' },
      ],
    },

    // xs:import
    importType: {
      attributes: [
        { name: 'namespace', type: 'string' },
        { name: 'schemaLocation', type: 'string' },
      ],
    },

    // xs:include
    includeType: {
      attributes: [
        { name: 'schemaLocation', type: 'string', required: true },
      ],
    },

    // xs:redefine
    redefineType: {
      sequence: [
        { name: 'complexType', type: 'namedComplexTypeType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'simpleType', type: 'namedSimpleTypeType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'schemaLocation', type: 'string', required: true },
      ],
    },

    // xs:element (top-level)
    topLevelElementType: {
      sequence: [
        { name: 'complexType', type: 'localComplexTypeType', minOccurs: 0 },
        { name: 'simpleType', type: 'localSimpleTypeType', minOccurs: 0 },
      ],
      attributes: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'string' },
        { name: 'abstract', type: 'string' },
        { name: 'substitutionGroup', type: 'string' },
      ],
    },

    // xs:element (local/nested)
    localElementType: {
      sequence: [
        { name: 'complexType', type: 'localComplexTypeType', minOccurs: 0 },
        { name: 'simpleType', type: 'localSimpleTypeType', minOccurs: 0 },
      ],
      attributes: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'ref', type: 'string' },
        { name: 'minOccurs', type: 'string' },
        { name: 'maxOccurs', type: 'string' },
      ],
    },

    // xs:complexType (named, top-level)
    namedComplexTypeType: {
      sequence: [
        { name: 'sequence', type: 'sequenceType', minOccurs: 0 },
        { name: 'all', type: 'allType', minOccurs: 0 },
        { name: 'choice', type: 'choiceType', minOccurs: 0 },
        { name: 'complexContent', type: 'complexContentType', minOccurs: 0 },
        { name: 'simpleContent', type: 'simpleContentType', minOccurs: 0 },
        { name: 'attribute', type: 'attributeType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'name', type: 'string', required: true },
        { name: 'mixed', type: 'string' },
      ],
    },

    // xs:complexType (local/inline)
    localComplexTypeType: {
      sequence: [
        { name: 'sequence', type: 'sequenceType', minOccurs: 0 },
        { name: 'all', type: 'allType', minOccurs: 0 },
        { name: 'choice', type: 'choiceType', minOccurs: 0 },
        { name: 'complexContent', type: 'complexContentType', minOccurs: 0 },
        { name: 'simpleContent', type: 'simpleContentType', minOccurs: 0 },
        { name: 'attribute', type: 'attributeType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'mixed', type: 'string' },
      ],
    },

    // xs:sequence
    sequenceType: {
      sequence: [
        { name: 'element', type: 'localElementType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'choice', type: 'choiceType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'sequence', type: 'sequenceType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'minOccurs', type: 'string' },
        { name: 'maxOccurs', type: 'string' },
      ],
    },

    // xs:all
    allType: {
      sequence: [
        { name: 'element', type: 'localElementType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'minOccurs', type: 'string' },
        { name: 'maxOccurs', type: 'string' },
      ],
    },

    // xs:choice
    choiceType: {
      sequence: [
        { name: 'element', type: 'localElementType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'sequence', type: 'sequenceType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'choice', type: 'choiceType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'minOccurs', type: 'string' },
        { name: 'maxOccurs', type: 'string' },
      ],
    },

    // xs:complexContent
    complexContentType: {
      sequence: [
        { name: 'extension', type: 'extensionType', minOccurs: 0 },
        { name: 'restriction', type: 'complexRestrictionType', minOccurs: 0 },
      ],
    },

    // xs:simpleContent
    simpleContentType: {
      sequence: [
        { name: 'extension', type: 'simpleExtensionType', minOccurs: 0 },
        { name: 'restriction', type: 'simpleRestrictionType', minOccurs: 0 },
      ],
    },

    // xs:extension (for complexContent)
    extensionType: {
      sequence: [
        { name: 'sequence', type: 'sequenceType', minOccurs: 0 },
        { name: 'all', type: 'allType', minOccurs: 0 },
        { name: 'choice', type: 'choiceType', minOccurs: 0 },
        { name: 'attribute', type: 'attributeType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'base', type: 'string', required: true },
      ],
    },

    // xs:extension (for simpleContent)
    simpleExtensionType: {
      sequence: [
        { name: 'attribute', type: 'attributeType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'base', type: 'string', required: true },
      ],
    },

    // xs:restriction (for complexContent)
    complexRestrictionType: {
      sequence: [
        { name: 'sequence', type: 'sequenceType', minOccurs: 0 },
        { name: 'all', type: 'allType', minOccurs: 0 },
        { name: 'choice', type: 'choiceType', minOccurs: 0 },
        { name: 'attribute', type: 'attributeType', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
      attributes: [
        { name: 'base', type: 'string', required: true },
      ],
    },

    // xs:restriction (for simpleContent/simpleType)
    simpleRestrictionType: {
      sequence: [
        { name: 'enumeration', type: 'enumerationType', minOccurs: 0, maxOccurs: 'unbounded' },
        { name: 'pattern', type: 'patternType', minOccurs: 0 },
        { name: 'minLength', type: 'facetType', minOccurs: 0 },
        { name: 'maxLength', type: 'facetType', minOccurs: 0 },
        { name: 'minInclusive', type: 'facetType', minOccurs: 0 },
        { name: 'maxInclusive', type: 'facetType', minOccurs: 0 },
      ],
      attributes: [
        { name: 'base', type: 'string', required: true },
      ],
    },

    // xs:attribute
    attributeType: {
      sequence: [
        { name: 'simpleType', type: 'localSimpleTypeType', minOccurs: 0 },
      ],
      attributes: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'ref', type: 'string' },
        { name: 'use', type: 'string' },
        { name: 'default', type: 'string' },
        { name: 'fixed', type: 'string' },
      ],
    },

    // xs:simpleType (named, top-level)
    namedSimpleTypeType: {
      sequence: [
        { name: 'restriction', type: 'simpleRestrictionType', minOccurs: 0 },
        { name: 'list', type: 'listType', minOccurs: 0 },
        { name: 'union', type: 'unionType', minOccurs: 0 },
      ],
      attributes: [
        { name: 'name', type: 'string', required: true },
      ],
    },

    // xs:simpleType (local/inline)
    localSimpleTypeType: {
      sequence: [
        { name: 'restriction', type: 'simpleRestrictionType', minOccurs: 0 },
        { name: 'list', type: 'listType', minOccurs: 0 },
        { name: 'union', type: 'unionType', minOccurs: 0 },
      ],
    },

    // xs:enumeration
    enumerationType: {
      attributes: [
        { name: 'value', type: 'string', required: true },
      ],
    },

    // xs:pattern
    patternType: {
      attributes: [
        { name: 'value', type: 'string', required: true },
      ],
    },

    // Generic facet (minLength, maxLength, etc.)
    facetType: {
      attributes: [
        { name: 'value', type: 'string', required: true },
      ],
    },

    // xs:list
    listType: {
      attributes: [
        { name: 'itemType', type: 'string' },
      ],
    },

    // xs:union
    unionType: {
      attributes: [
        { name: 'memberTypes', type: 'string' },
      ],
    },
  },
} as const satisfies XsdSchema;

export default XsdSchemaDefinition;
