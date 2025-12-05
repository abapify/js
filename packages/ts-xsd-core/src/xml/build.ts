/**
 * XML Builder for W3C Schema
 * 
 * Build XML string from typed JavaScript object using W3C-compliant Schema definition.
 * Uses the walker module for schema traversal.
 */

import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom';
import type { SchemaLike, ComplexTypeLike, ElementLike } from '../infer/types';
import {
  findComplexType,
  findElement,
  walkElements,
  walkAttributes,
  stripNsPrefix,
} from '../walker';

// Use 'any' for xmldom types since they don't match browser DOM types
type XmlDocument = any;
type XmlElement = any;

export interface BuildOptions {
  /** Include XML declaration (default: true) */
  xmlDecl?: boolean;
  /** XML encoding (default: utf-8) */
  encoding?: string;
  /** Pretty print with indentation (default: false) */
  pretty?: boolean;
  /** Namespace prefix to use (default: from schema or none) */
  prefix?: string;
  /** Root element name to use (default: auto-detect from data) */
  rootElement?: string;
}

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

  const impl = new DOMImplementation();
  const ns = schema.targetNamespace || null;
  const doc = impl.createDocument(ns, '', null);

  // Find the element declaration - either by name or by matching data
  let elementDecl: ElementLike | undefined;
  
  if (options.rootElement) {
    // Explicit root element name provided
    elementDecl = schema.element?.find(e => e.name === options.rootElement);
    if (!elementDecl) {
      throw new Error(`Element '${options.rootElement}' not found in schema`);
    }
  } else {
    // Auto-detect from data
    elementDecl = findMatchingElement(data as Record<string, unknown>, schema);
    if (!elementDecl) {
      throw new Error('Schema has no element declarations');
    }
  }

  // Get the complexType - either inline or by reference
  let rootType: ComplexTypeLike;
  let rootSchema: SchemaLike = schema;
  
  if (elementDecl.complexType) {
    // Inline complexType
    rootType = elementDecl.complexType as ComplexTypeLike;
  } else if (elementDecl.type) {
    // Referenced complexType
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

  // Create root element
  const rootTag = prefix ? `${prefix}:${elementDecl.name}` : elementDecl.name!;
  const root = doc.createElement(rootTag);

  // Add namespace declaration
  if (ns) {
    if (prefix) {
      root.setAttribute(`xmlns:${prefix}`, ns);
    } else {
      root.setAttribute('xmlns', ns);
    }
  }

  // Add xmlns declarations from schema
  if (schema.$xmlns) {
    for (const [pfx, uri] of Object.entries(schema.$xmlns)) {
      if (pfx && pfx !== prefix) {
        root.setAttribute(`xmlns:${pfx}`, uri as string);
      } else if (!pfx) {
        root.setAttribute('xmlns', uri as string);
      }
    }
  }

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
 * Get namespace prefix from schema $xmlns declarations
 */
function getSchemaPrefix(schema: SchemaLike): string | undefined {
  if (!schema.$xmlns || !schema.targetNamespace) return undefined;
  
  for (const [prefix, uri] of Object.entries(schema.$xmlns)) {
    if (uri === schema.targetNamespace && prefix) {
      return prefix;
    }
  }
  return undefined;
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
      return {
        name: refElement.element.name!,
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

/**
 * Format value for XML output
 */
function formatValue(value: unknown, type: string): string {
  if (value instanceof Date) {
    const localType = stripNsPrefix(type);
    return localType === 'date'
      ? value.toISOString().split('T')[0]
      : value.toISOString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

/**
 * Simple XML formatter (basic indentation)
 */
function formatXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const parts = xml.split(/(<[^>]+>)/g).filter(Boolean);

  for (const part of parts) {
    if (part.startsWith('<?')) {
      formatted += part + '\n';
    } else if (part.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += '  '.repeat(indent) + part + '\n';
    } else if (part.startsWith('<') && part.endsWith('/>')) {
      formatted += '  '.repeat(indent) + part + '\n';
    } else if (part.startsWith('<')) {
      formatted += '  '.repeat(indent) + part;
      if (!part.includes('</')) {
        indent++;
      }
      formatted += '\n';
    } else {
      const trimmed = part.trim();
      if (trimmed) {
        formatted = formatted.trimEnd() + trimmed + '\n';
      }
    }
  }

  return formatted.trim();
}
