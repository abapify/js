/**
 * Shared utilities for XML builders
 */

import { DOMImplementation } from '@xmldom/xmldom';
import type { SchemaLike, ComplexTypeLike, ElementLike } from '../infer/types';
import { findComplexType, stripNsPrefix } from '../walker';

// Use 'any' for xmldom types since they don't match browser DOM types
export type XmlDocument = any;
export type XmlElement = any;

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
 * Get namespace prefix from schema $xmlns declarations
 */
export function getSchemaPrefix(schema: SchemaLike): string | undefined {
  if (!schema.$xmlns || !schema.targetNamespace) return undefined;
  
  for (const [prefix, uri] of Object.entries(schema.$xmlns)) {
    if (uri === schema.targetNamespace && prefix) {
      return prefix;
    }
  }
  return undefined;
}

/**
 * Create XML document with namespace
 */
export function createXmlDocument(schema: SchemaLike): XmlDocument {
  const impl = new DOMImplementation();
  const ns = schema.targetNamespace || null;
  return impl.createDocument(ns, '', null);
}

/**
 * Create root element with namespace declarations
 */
export function createRootElement(
  doc: XmlDocument,
  elementName: string,
  schema: SchemaLike,
  prefix: string | undefined
): XmlElement {
  const ns = schema.targetNamespace || null;
  const rootTag = prefix ? `${prefix}:${elementName}` : elementName;
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

  return root;
}

/**
 * Find element declaration by name or auto-detect from data
 */
export function findElementDeclaration(
  schema: SchemaLike,
  rootElement?: string,
  data?: Record<string, unknown>
): ElementLike {
  if (rootElement) {
    const elementDecl = schema.element?.find(e => e.name === rootElement);
    if (!elementDecl) {
      throw new Error(`Element '${rootElement}' not found in schema`);
    }
    return elementDecl;
  }

  // Auto-detect from data
  const elements = schema.element;
  if (!elements || elements.length === 0) {
    throw new Error('Schema has no element declarations');
  }

  if (elements.length === 1) {
    return elements[0];
  }

  // Multiple elements - find best match (caller should provide findMatchingElement)
  return elements[0];
}

/**
 * Get complexType for an element declaration
 */
export function getElementComplexType(
  elementDecl: ElementLike,
  schema: SchemaLike
): { type: ComplexTypeLike; schema: SchemaLike } {
  if (elementDecl.complexType) {
    return { type: elementDecl.complexType as ComplexTypeLike, schema };
  }
  
  if (elementDecl.type) {
    const typeName = stripNsPrefix(elementDecl.type);
    const typeEntry = findComplexType(typeName, schema);
    if (!typeEntry) {
      throw new Error(`Schema missing complexType for: ${typeName}`);
    }
    return { type: typeEntry.ct, schema: typeEntry.schema };
  }
  
  throw new Error(`Element ${elementDecl.name} has no type or inline complexType`);
}

/**
 * Format value for XML output
 */
export function formatValue(value: unknown, type: string): string {
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
export function formatXml(xml: string): string {
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

/**
 * Add XML declaration to string
 */
export function addXmlDeclaration(xml: string, encoding: string): string {
  return `<?xml version="1.0" encoding="${encoding}"?>\n${xml}`;
}
