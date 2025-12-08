/**
 * XML Builder for W3C Schema (Walker-based implementation)
 * 
 * Build XML string from typed JavaScript object using W3C-compliant Schema definition.
 * Uses the walker module for schema traversal.
 */

import { XMLSerializer } from '@xmldom/xmldom';
import type { SchemaLike, ComplexTypeLike, ElementLike } from '../infer/types';
import {
  findComplexType,
  findElement,
  walkElements,
  walkAttributes,
  stripNsPrefix,
} from '../walker';
import {
  type XmlDocument,
  type XmlElement,
  getSchemaPrefix,
  createXmlDocument,
  createRootElement,
  formatValue,
  formatXml,
} from './build-utils';

export type { BuildOptions } from './build-utils';
export { type XmlDocument, type XmlElement } from './build-utils';

import type { BuildOptions } from './build-utils';

/**
 * Build XML string from typed object using schema definition
 */
export function build<T extends SchemaLike>(
  schema: T,
  data: unknown,
  options: BuildOptions = {}
): string {
  const { xmlDecl = true, encoding = 'utf-8', pretty = false } = options;
  const prefix = options.prefix ?? getSchemaPrefix(schema);

  const doc = createXmlDocument(schema);

  // Find the element declaration - either by name or by matching data
  let elementDecl: ElementLike | undefined;
  
  if (options.rootElement) {
    elementDecl = schema.element?.find(e => e.name === options.rootElement);
    if (!elementDecl) {
      throw new Error(`Element '${options.rootElement}' not found in schema`);
    }
  } else {
    elementDecl = findMatchingElement(data as Record<string, unknown>, schema);
    if (!elementDecl) {
      throw new Error('Schema has no element declarations');
    }
  }

  // Get the complexType - either inline or by reference
  let rootType: ComplexTypeLike;
  let rootSchema: SchemaLike = schema;
  
  if (elementDecl.complexType) {
    rootType = elementDecl.complexType as ComplexTypeLike;
  } else if (elementDecl.type) {
    const typeName = stripNsPrefix(elementDecl.type);
    const rootTypeEntry = findComplexType(typeName, schema);
    if (!rootTypeEntry) {
      throw new Error(`Schema missing complexType for: ${typeName}`);
    }
    rootType = rootTypeEntry.ct;
    rootSchema = rootTypeEntry.schema;
  } else {
    throw new Error(`Element ${elementDecl.name} has no type or inline complexType`);
  }

  // Create root element with namespace declarations
  const elementName = elementDecl.name ?? elementDecl.ref;
  if (!elementName) {
    throw new Error('Element declaration has no name or ref');
  }
  const root = createRootElement(doc, elementName, schema, prefix);

  buildElement(doc, root, data as Record<string, unknown>, rootType, rootSchema, prefix);
  doc.appendChild(root);

  let xml = new XMLSerializer().serializeToString(doc);

  if (xmlDecl) {
    xml = `<?xml version="1.0" encoding="${encoding}"?>\n${xml}`;
  }

  if (pretty) {
    xml = formatXml(xml);
  }

  return xml;
}

/**
 * Find the element declaration that best matches the data structure
 */
function findMatchingElement(
  data: Record<string, unknown>,
  schema: SchemaLike
): ElementLike | undefined {
  const elements = schema.element;
  if (!elements || elements.length === 0) {
    return undefined;
  }
  
  if (elements.length === 1) {
    return elements[0];
  }

  const dataKeys = new Set(Object.keys(data));
  let bestMatch: ElementLike | undefined;
  let bestScore = -1;

  for (const element of elements) {
    if (!element.type) continue;
    const typeName = stripNsPrefix(element.type);
    const typeEntry = findComplexType(typeName, schema);
    if (!typeEntry) continue;

    // Get all field names from this type using walker
    const typeFields = new Set<string>();
    for (const { element: el } of walkElements(typeEntry.ct, typeEntry.schema)) {
      if (el.name) typeFields.add(el.name);
    }
    for (const { attribute } of walkAttributes(typeEntry.ct, typeEntry.schema)) {
      if (attribute.name) typeFields.add(attribute.name);
    }

    let score = 0;
    dataKeys.forEach(key => {
      if (typeFields.has(key)) score++;
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = element;
    }
  }

  return bestMatch || elements[0];
}

/**
 * Build element content using its complexType definition
 * Uses walker to iterate elements and attributes (handles inheritance automatically)
 */
function buildElement(
  doc: XmlDocument,
  node: XmlElement,
  data: Record<string, unknown>,
  typeDef: ComplexTypeLike,
  schema: SchemaLike,
  prefix: string | undefined
): void {
  // Build attributes using walker (handles inheritance)
  for (const { attribute } of walkAttributes(typeDef, schema)) {
    if (!attribute.name) continue;
    const value = data[attribute.name];
    if (value !== undefined && value !== null) {
      node.setAttribute(attribute.name, formatValue(value, attribute.type || 'string'));
    }
  }

  // Build child elements using walker (handles inheritance, groups, refs)
  for (const { element } of walkElements(typeDef, schema)) {
    const resolved = resolveElementInfo(element, schema);
    if (!resolved) continue;
    
    const value = data[resolved.name];
    if (value !== undefined) {
      buildField(doc, node, value, resolved.name, resolved.typeName, schema, prefix);
    }
  }
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
 * Build a field (child element)
 */
function buildField(
  doc: XmlDocument,
  parent: XmlElement,
  value: unknown,
  elementName: string,
  typeName: string | undefined,
  schema: SchemaLike,
  prefix: string | undefined
): void {
  if (value === undefined || value === null) return;

  // Search for nested complexType
  const nestedType = typeName ? findComplexType(typeName, schema) : undefined;
  const tagName = prefix ? `${prefix}:${elementName}` : elementName;

  if (Array.isArray(value)) {
    for (const item of value) {
      const child = doc.createElement(tagName);
      if (nestedType) {
        buildElement(doc, child, item as Record<string, unknown>, nestedType.ct, nestedType.schema, prefix);
      } else {
        child.appendChild(doc.createTextNode(formatValue(item, typeName || 'string')));
      }
      parent.appendChild(child);
    }
  } else {
    const child = doc.createElement(tagName);
    if (nestedType) {
      buildElement(doc, child, value as Record<string, unknown>, nestedType.ct, nestedType.schema, prefix);
    } else {
      child.appendChild(doc.createTextNode(formatValue(value, typeName || 'string')));
    }
    parent.appendChild(child);
  }
}

