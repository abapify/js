/**
 * ts-xsd Parser
 *
 * Parse XML string to typed JavaScript object using XSD schema
 */

import { DOMParser } from '@xmldom/xmldom';
import type { XsdSchema, XsdComplexType, XsdField, XsdElementDecl, InferXsd } from '../types';

// Use 'any' for xmldom types since they don't match browser DOM types
type XmlElement = any;

/**
 * Merge all complexTypes from schema and its includes
 * Also creates aliases for element types (e.g., 'Link' -> 'linkType')
 */
function getAllComplexTypes(schema: XsdSchema): { readonly [key: string]: XsdComplexType } {
  if (!schema.include || schema.include.length === 0) {
    return schema.complexType;
  }
  
  // Merge complexTypes from all includes
  const merged: Record<string, XsdComplexType> = { ...schema.complexType };
  for (const included of schema.include) {
    const includedTypes = getAllComplexTypes(included);
    Object.assign(merged, includedTypes);
    
    // Create aliases for element types
    // This handles cases like ref="atom:link" which generates type: 'Link'
    // but the actual type in atom.xsd is 'linkType'
    if (included.element) {
      for (const el of included.element) {
        if (includedTypes[el.type]) {
          // Create alias: element name -> type definition
          const capitalizedName = el.name.charAt(0).toUpperCase() + el.name.slice(1);
          if (!merged[capitalizedName] && capitalizedName !== el.type) {
            merged[capitalizedName] = includedTypes[el.type];
          }
          // Also create alias without 'Type' suffix if type ends with 'Type'
          if (el.type.endsWith('Type')) {
            const baseName = el.type.slice(0, -4);
            const capitalizedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1);
            if (!merged[capitalizedBase]) {
              merged[capitalizedBase] = includedTypes[el.type];
            }
          }
        }
      }
    }
  }
  return merged;
}

/**
 * Get all element declarations from schema and includes
 */
function getAllElements(schema: XsdSchema): XsdElementDecl[] {
  const elements: XsdElementDecl[] = [...(schema.element || [])];
  if (schema.include) {
    for (const included of schema.include) {
      elements.push(...getAllElements(included));
    }
  }
  return elements;
}

/**
 * Find element declaration by name (case-insensitive for XML element matching)
 */
function findElementByName(elements: XsdElementDecl[], name: string): XsdElementDecl | undefined {
  // Try exact match first
  let found = elements.find(el => el.name === name);
  if (found) return found;
  
  // Try case-insensitive match
  const lowerName = name.toLowerCase();
  return elements.find(el => el.name.toLowerCase() === lowerName);
}

/**
 * Parse XML string to typed object
 * Auto-detects root element from XML and looks up type in schema
 */
export function parse<T extends XsdSchema>(
  schema: T,
  xml: string
): InferXsd<T> {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const root = doc.documentElement;

  if (!root) {
    throw new Error('Invalid XML: no root element');
  }

  const allComplexTypes = getAllComplexTypes(schema);
  const allElements = getAllElements(schema);
  
  // Get root element name from XML (strip namespace prefix)
  const rootLocalName = root.localName || root.tagName.split(':').pop() || root.tagName;
  
  // Find element declaration for this root
  const elementDecl = findElementByName(allElements, rootLocalName);
  
  let rootType: XsdComplexType | undefined;
  
  if (elementDecl) {
    // Found element declaration, get its type
    rootType = allComplexTypes[elementDecl.type];
  } else {
    // No element declaration, try to find complexType directly by name
    // (handles legacy schemas or inline types)
    rootType = allComplexTypes[rootLocalName] || 
               allComplexTypes[rootLocalName.charAt(0).toUpperCase() + rootLocalName.slice(1)];
  }
  
  if (!rootType) {
    throw new Error(`Schema missing type for root element: ${rootLocalName}`);
  }

  return parseElement(root, rootType, allComplexTypes) as InferXsd<T>;
}

/**
 * Get merged complexType definition including inherited fields from base type
 */
function getMergedComplexTypeDef(
  typeDef: XsdComplexType,
  complexTypes: { readonly [key: string]: XsdComplexType }
): XsdComplexType {
  if (!typeDef.extends) {
    return typeDef;
  }

  const baseType = complexTypes[typeDef.extends];
  if (!baseType) {
    return typeDef;
  }

  // Recursively get merged base (handles multi-level inheritance)
  const mergedBase = getMergedComplexTypeDef(baseType, complexTypes);

  // Merge: base fields first, then derived fields (derived can override)
  return {
    extends: typeDef.extends,
    sequence: [...(mergedBase.sequence || []), ...(typeDef.sequence || [])],
    all: [...(mergedBase.all || []), ...(typeDef.all || [])],
    choice: [...(mergedBase.choice || []), ...(typeDef.choice || [])],
    attributes: [...(mergedBase.attributes || []), ...(typeDef.attributes || [])],
    text: typeDef.text ?? mergedBase.text,
  };
}

/**
 * Parse a single element using its complexType definition
 */
function parseElement(
  node: XmlElement,
  typeDef: XsdComplexType,
  complexTypes: { readonly [key: string]: XsdComplexType }
): Record<string, unknown> {
  // Get merged definition including inherited fields
  const mergedDef = getMergedComplexTypeDef(typeDef, complexTypes);
  const result: Record<string, unknown> = {};

  // Parse attributes (including inherited)
  if (mergedDef.attributes) {
    for (const attrDef of mergedDef.attributes) {
      const value = getAttributeValue(node, attrDef.name);
      if (value !== null) {
        result[attrDef.name] = convertValue(value, attrDef.type);
      } else if (attrDef.default !== undefined) {
        result[attrDef.name] = convertValue(attrDef.default, attrDef.type);
      }
    }
  }

  // Parse text content (including inherited)
  if (mergedDef.text) {
    const text = getTextContent(node);
    if (text) {
      result.$text = text;
    }
  }

  // Parse sequence fields (including inherited)
  if (mergedDef.sequence) {
    for (const field of mergedDef.sequence) {
      const value = parseField(node, field, complexTypes);
      if (value !== undefined) {
        result[field.name] = value;
      }
    }
  }

  // Parse all fields (xs:all - same as sequence at runtime)
  if (mergedDef.all) {
    for (const field of mergedDef.all) {
      const value = parseField(node, field, complexTypes);
      if (value !== undefined) {
        result[field.name] = value;
      }
    }
  }

  // Parse choice fields (including inherited)
  if (mergedDef.choice) {
    for (const field of mergedDef.choice) {
      const value = parseField(node, field, complexTypes);
      if (value !== undefined) {
        result[field.name] = value;
      }
    }
  }

  return result;
}

/**
 * Parse a field (element child)
 */
function parseField(
  parent: Element,
  field: XsdField,
  complexTypes: { readonly [key: string]: XsdComplexType }
): unknown {
  const children = getChildElements(parent, field.name);
  const isArray = field.maxOccurs === 'unbounded' || (typeof field.maxOccurs === 'number' && field.maxOccurs > 1);
  const nestedType = complexTypes[field.type];

  if (isArray) {
    return children.map(child =>
      nestedType
        ? parseElement(child, nestedType, complexTypes)
        : convertValue(getTextContent(child) || '', field.type)
    );
  }

  if (children.length === 0) {
    return undefined;
  }

  const child = children[0];
  return nestedType
    ? parseElement(child, nestedType, complexTypes)
    : convertValue(getTextContent(child) || '', field.type);
}

/**
 * Get attribute value, handling namespaced attributes
 */
function getAttributeValue(node: XmlElement, name: string): string | null {
  // Try direct attribute
  if (node.hasAttribute(name)) {
    return node.getAttribute(name);
  }

  // Try with any namespace prefix
  const attrs = node.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    const localName = attr.localName || attr.name.split(':').pop();
    if (localName === name) {
      return attr.value;
    }
  }

  return null;
}

/**
 * Get child elements by local name
 */
function getChildElements(parent: XmlElement, name: string): XmlElement[] {
  const result: XmlElement[] = [];
  const children = parent.childNodes;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 1) { // ELEMENT_NODE
      const element = child as Element;
      const localName = element.localName || element.tagName.split(':').pop();
      if (localName === name) {
        result.push(element);
      }
    }
  }

  return result;
}

/**
 * Get text content of an element
 */
function getTextContent(node: XmlElement): string {
  let text = '';
  const children = node.childNodes;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 3) { // TEXT_NODE
      text += child.nodeValue || '';
    }
  }

  return text.trim();
}

/**
 * Convert string value to typed value
 */
function convertValue(value: string, type: string): unknown {
  switch (type) {
    case 'int':
    case 'integer':
    case 'decimal':
    case 'float':
    case 'double':
    case 'number':
      return Number(value);

    case 'boolean':
      return value === 'true' || value === '1';

    case 'date':
    case 'dateTime':
      return new Date(value);

    default:
      return value;
  }
}
