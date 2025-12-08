/**
 * XML Parser for W3C Schema
 * 
 * Parse XML string to typed JavaScript object using W3C-compliant Schema definition.
 * Uses the walker module for schema traversal.
 */

import { DOMParser } from '@xmldom/xmldom';
import type { InferSchema, SchemaLike, ComplexTypeLike, ElementLike } from '../infer/types';
import {
  findComplexType,
  findElement,
  walkElements,
  walkAttributes,
  stripNsPrefix,
} from '../walker';
import {
  getAttributeValue,
  getChildElements,
  getTextContent,
  getLocalName,
} from './dom-utils';

import type { Element } from '@xmldom/xmldom';

type XmlElement = Element;

/**
 * Parse XML string to typed object using schema definition
 */
export function parse<T extends SchemaLike>(
  schema: T,
  xml: string
): InferSchema<T> {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const root = doc.documentElement;

  if (!root) {
    throw new Error('Invalid XML: no root element');
  }

  // Get root element name from XML (strip namespace prefix)
  const rootLocalName = getLocalName(root);

  // Find the element declaration for this root
  const elementEntry = findElementByName(schema, rootLocalName);
  
  if (!elementEntry) {
    throw new Error(`Schema missing element declaration for: ${rootLocalName}`);
  }

  // Get the type name (strip namespace prefix if present)
  const typeName = stripNsPrefix(elementEntry.element.type || elementEntry.element.name || '');
  
  // Find the complexType definition (searches current schema and $imports)
  const typeEntry = findComplexType(typeName, schema);
  
  if (!typeEntry) {
    throw new Error(`Schema missing complexType for: ${typeName}`);
  }

  return parseElement(root, typeEntry.ct, typeEntry.schema) as InferSchema<T>;
}

/**
 * Find element declaration by name (case-insensitive fallback)
 */
function findElementByName(
  schema: SchemaLike,
  name: string
): { element: ElementLike; schema: SchemaLike } | undefined {
  // Try exact match first using walker
  const exact = findElement(name, schema);
  if (exact) return exact;
  
  // Try case-insensitive match in current schema
  const elements = schema.element;
  if (elements) {
    const lowerName = name.toLowerCase();
    const found = elements.find(el => el.name?.toLowerCase() === lowerName);
    if (found) return { element: found, schema };
  }
  
  return undefined;
}

/**
 * Parse a single element using its complexType definition
 * Uses walker to iterate elements and attributes (handles inheritance automatically)
 */
function parseElement(
  node: XmlElement,
  typeDef: ComplexTypeLike,
  schema: SchemaLike
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Handle simpleContent (text content with attributes)
  if (typeDef.simpleContent?.extension) {
    return parseSimpleContent(node, typeDef, schema);
  }

  // Parse attributes using walker (handles inheritance)
  for (const { attribute } of walkAttributes(typeDef, schema)) {
    if (!attribute.name) continue;
    const value = getAttributeValue(node, attribute.name);
    if (value !== null) {
      result[attribute.name] = convertValue(value, attribute.type || 'string');
    } else if (attribute.default !== undefined) {
      result[attribute.name] = convertValue(String(attribute.default), attribute.type || 'string');
    }
  }

  // Parse child elements using walker (handles inheritance, groups, refs)
  for (const { element, array } of walkElements(typeDef, schema)) {
    const resolved = resolveElementInfo(element, schema);
    if (!resolved) continue;
    
    const children = getChildElements(node, resolved.name);
    
    if (array || children.length > 1) {
      // Array element
      const values = children.map(child => 
        parseChildValue(child, resolved.typeName, schema)
      );
      if (values.length > 0) {
        result[resolved.name] = values;
      }
    } else if (children.length === 1) {
      // Single element
      result[resolved.name] = parseChildValue(children[0], resolved.typeName, schema);
    }
  }

  return result;
}

/**
 * Parse simpleContent (text content with attributes)
 */
function parseSimpleContent(
  node: XmlElement,
  typeDef: ComplexTypeLike,
  _schema: SchemaLike
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const simpleContent = typeDef.simpleContent;
  if (!simpleContent?.extension) {
    return result;
  }
  const ext = simpleContent.extension;
  
  // Get text content as $value
  const textContent = getTextContent(node);
  const baseType = ext.base ? stripNsPrefix(ext.base) : 'string';
  result.$value = convertValue(textContent, baseType);
  
  // Parse attributes from simpleContent extension
  if (ext.attribute) {
    for (const attrDef of ext.attribute) {
      if (!attrDef.name) continue;
      const value = getAttributeValue(node, attrDef.name);
      if (value !== null) {
        result[attrDef.name] = convertValue(value, attrDef.type || 'string');
      } else if (attrDef.default !== undefined) {
        result[attrDef.name] = convertValue(String(attrDef.default), attrDef.type || 'string');
      }
    }
  }
  
  return result;
}

/**
 * Resolve element info (name and type), handling ref
 */
function resolveElementInfo(
  element: ElementLike,
  schema: SchemaLike
): { name: string; typeName: string | undefined } | undefined {
  // Direct element with name
  if (element.name) {
    return {
      name: element.name,
      typeName: element.type ? stripNsPrefix(element.type) : undefined,
    };
  }
  
  // Handle element reference - get type from referenced element declaration
  if (element.ref) {
    const refName = stripNsPrefix(element.ref);
    const refElement = findElement(refName, schema);
    if (refElement) {
      const name = refElement.element.name ?? refName;
      return {
        name,
        typeName: refElement.element.type ? stripNsPrefix(refElement.element.type) : undefined,
      };
    }
    // Fallback: use ref name, no type
    return { name: refName, typeName: undefined };
  }
  
  return undefined;
}

/**
 * Parse a child element's value (either complex type or simple value)
 */
function parseChildValue(
  child: XmlElement,
  typeName: string | undefined,
  schema: SchemaLike
): unknown {
  // Find nested complexType if this field has a complex type
  const nestedType = typeName ? findComplexType(typeName, schema) : undefined;
  
  if (nestedType) {
    return parseElement(child, nestedType.ct, nestedType.schema);
  }
  
  return convertValue(getTextContent(child) || '', typeName || 'string');
}

/**
 * Convert string value to typed value based on XSD type
 */
function convertValue(value: string, type: string): unknown {
  const localType = stripNsPrefix(type);
  
  switch (localType) {
    case 'int':
    case 'integer':
    case 'decimal':
    case 'float':
    case 'double':
    case 'short':
    case 'long':
    case 'byte':
    case 'unsignedInt':
    case 'unsignedShort':
    case 'unsignedLong':
    case 'unsignedByte':
    case 'positiveInteger':
    case 'negativeInteger':
    case 'nonPositiveInteger':
    case 'nonNegativeInteger':
      return Number(value);

    case 'boolean':
      return value === 'true' || value === '1';

    case 'date':
    case 'dateTime':
      return value; // Keep as string, let consumer parse if needed

    default:
      return value;
  }
}
