/**
 * ts-xsd Parser
 *
 * Parse XML string to typed JavaScript object using XSD schema
 */

import { DOMParser } from '@xmldom/xmldom';
import type { XsdSchema, XsdElement, XsdField, InferXsd } from '../types';

// Use 'any' for xmldom types since they don't match browser DOM types
type XmlElement = any;

/**
 * Merge all elements from schema and its includes
 * Also creates aliases for root elements (e.g., 'Link' -> 'linkType' if root is 'linkType')
 */
function getAllElements(schema: XsdSchema): { readonly [key: string]: XsdElement } {
  if (!schema.include || schema.include.length === 0) {
    return schema.elements;
  }
  
  // Merge elements from all includes
  const merged: Record<string, XsdElement> = { ...schema.elements };
  for (const included of schema.include) {
    const includedElements = getAllElements(included);
    Object.assign(merged, includedElements);
    
    // Create alias for root element with capitalized name
    // This handles cases like ref="atom:link" which generates type: 'Link'
    // but the actual type in atom.xsd is 'linkType'
    if (included.root && includedElements[included.root]) {
      // Create alias: 'Link' -> linkType element definition
      const capitalizedName = included.root.charAt(0).toUpperCase() + included.root.slice(1);
      if (!merged[capitalizedName] && capitalizedName !== included.root) {
        merged[capitalizedName] = includedElements[included.root];
      }
      // Also create alias without 'Type' suffix if root ends with 'Type'
      // e.g., 'linkType' -> also accessible as 'Link'
      if (included.root.endsWith('Type')) {
        const baseName = included.root.slice(0, -4); // Remove 'Type'
        const capitalizedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        if (!merged[capitalizedBase]) {
          merged[capitalizedBase] = includedElements[included.root];
        }
      }
    }
  }
  return merged;
}

/**
 * Parse XML string to typed object
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

  if (!schema.root) {
    throw new Error('Schema has no root element defined');
  }

  const allElements = getAllElements(schema);
  const rootElement = allElements[schema.root];
  if (!rootElement) {
    throw new Error(`Schema missing root element: ${schema.root}`);
  }

  return parseElement(root, rootElement, allElements) as InferXsd<T>;
}

/**
 * Get merged element definition including inherited fields from base type
 */
function getMergedElementDef(
  elementDef: XsdElement,
  elements: { readonly [key: string]: XsdElement }
): XsdElement {
  if (!elementDef.extends) {
    return elementDef;
  }

  const baseElement = elements[elementDef.extends];
  if (!baseElement) {
    return elementDef;
  }

  // Recursively get merged base (handles multi-level inheritance)
  const mergedBase = getMergedElementDef(baseElement, elements);

  // Merge: base fields first, then derived fields (derived can override)
  return {
    extends: elementDef.extends,
    sequence: [...(mergedBase.sequence || []), ...(elementDef.sequence || [])],
    choice: [...(mergedBase.choice || []), ...(elementDef.choice || [])],
    attributes: [...(mergedBase.attributes || []), ...(elementDef.attributes || [])],
    text: elementDef.text ?? mergedBase.text,
  };
}

/**
 * Parse a single element
 */
function parseElement(
  node: XmlElement,
  elementDef: XsdElement,
  elements: { readonly [key: string]: XsdElement }
): Record<string, unknown> {
  // Get merged definition including inherited fields
  const mergedDef = getMergedElementDef(elementDef, elements);
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
      const value = parseField(node, field, elements);
      if (value !== undefined) {
        result[field.name] = value;
      }
    }
  }

  // Parse choice fields (including inherited)
  if (mergedDef.choice) {
    for (const field of mergedDef.choice) {
      const value = parseField(node, field, elements);
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
  elements: { readonly [key: string]: XsdElement }
): unknown {
  const children = getChildElements(parent, field.name);
  const isArray = field.maxOccurs === 'unbounded' || (typeof field.maxOccurs === 'number' && field.maxOccurs > 1);
  const nestedElement = elements[field.type];

  if (isArray) {
    return children.map(child =>
      nestedElement
        ? parseElement(child, nestedElement, elements)
        : convertValue(getTextContent(child) || '', field.type)
    );
  }

  if (children.length === 0) {
    return undefined;
  }

  const child = children[0];
  return nestedElement
    ? parseElement(child, nestedElement, elements)
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
