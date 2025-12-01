/**
 * ts-xsd Builder
 *
 * Build XML string from typed JavaScript object using XSD schema
 */

import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom';
import type { XsdSchema, XsdElement, XsdField, InferXsd } from '../types';

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
}

/**
 * Merge all elements from schema and its includes
 */
function getAllElements(schema: XsdSchema): { readonly [key: string]: XsdElement } {
  if (!schema.include || schema.include.length === 0) {
    return schema.elements;
  }
  
  // Merge elements from all includes
  const merged: Record<string, XsdElement> = { ...schema.elements };
  for (const included of schema.include) {
    Object.assign(merged, getAllElements(included));
  }
  return merged;
}

/**
 * Build XML string from typed object
 */
export function build<T extends XsdSchema>(
  schema: T,
  data: InferXsd<T>,
  options: BuildOptions = {}
): string {
  const { xmlDecl = true, encoding = 'utf-8', pretty = false } = options;

  if (!schema.root) {
    throw new Error('Schema has no root element defined');
  }

  const impl = new DOMImplementation();
  const doc = impl.createDocument(schema.ns || null, '', null);

  const allElements = getAllElements(schema);
  const rootElement = allElements[schema.root];
  if (!rootElement) {
    throw new Error(`Schema missing root element: ${schema.root}`);
  }

  // Convert root element name to lowercase (XSD uses PascalCase types, XML uses lowercase elements)
  const rootName = schema.root.charAt(0).toLowerCase() + schema.root.slice(1);
  const rootTag = schema.prefix ? `${schema.prefix}:${rootName}` : rootName;
  const root = doc.createElement(rootTag);

  // Add namespace declaration
  if (schema.ns) {
    if (schema.prefix) {
      root.setAttribute(`xmlns:${schema.prefix}`, schema.ns);
    } else {
      root.setAttribute('xmlns', schema.ns);
    }
  }

  buildElement(doc, root, data as Record<string, unknown>, rootElement, schema, allElements);
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
 * Build element content
 */
function buildElement(
  doc: XmlDocument,
  node: XmlElement,
  data: Record<string, unknown>,
  elementDef: XsdElement,
  schema: XsdSchema,
  allElements: { readonly [key: string]: XsdElement }
): void {
  // Get merged definition including inherited fields
  const mergedDef = getMergedElementDef(elementDef, allElements);

  // Build attributes (including inherited)
  // Note: Standard XML doesn't prefix attributes, but SAP ADT requires it (prefixedAttributes option)
  if (mergedDef.attributes) {
    for (const attrDef of mergedDef.attributes) {
      const value = data[attrDef.name];
      if (value !== undefined && value !== null) {
        const attrName = schema.prefixedAttributes && schema.prefix 
          ? `${schema.prefix}:${attrDef.name}` 
          : attrDef.name;
        node.setAttribute(attrName, formatValue(value, attrDef.type));
      }
    }
  }

  // Build text content (including inherited)
  if (mergedDef.text && data.$text !== undefined) {
    node.appendChild(doc.createTextNode(String(data.$text)));
  }

  // Build sequence fields (including inherited)
  if (mergedDef.sequence) {
    for (const field of mergedDef.sequence) {
      buildField(doc, node, data[field.name], field, schema, allElements);
    }
  }

  // Build choice fields (including inherited)
  if (mergedDef.choice) {
    for (const field of mergedDef.choice) {
      if (data[field.name] !== undefined) {
        buildField(doc, node, data[field.name], field, schema, allElements);
      }
    }
  }
}

/**
 * Build a field (child element)
 */
function buildField(
  doc: XmlDocument,
  parent: XmlElement,
  value: unknown,
  field: XsdField,
  schema: XsdSchema,
  allElements: { readonly [key: string]: XsdElement }
): void {
  if (value === undefined || value === null) {
    return;
  }

  const nestedElement = allElements[field.type];
  const tagName = schema.prefix ? `${schema.prefix}:${field.name}` : field.name;

  if (Array.isArray(value)) {
    for (const item of value) {
      const child = doc.createElement(tagName);
      if (nestedElement) {
        buildElement(doc, child, item as Record<string, unknown>, nestedElement, schema, allElements);
      } else {
        child.appendChild(doc.createTextNode(formatValue(item, field.type)));
      }
      parent.appendChild(child);
    }
  } else {
    const child = doc.createElement(tagName);
    if (nestedElement) {
      buildElement(doc, child, value as Record<string, unknown>, nestedElement, schema, allElements);
    } else {
      child.appendChild(doc.createTextNode(formatValue(value, field.type)));
    }
    parent.appendChild(child);
  }
}

/**
 * Format value for XML output
 */
function formatValue(value: unknown, type: string): string {
  if (value instanceof Date) {
    return type === 'date'
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
      indent--;
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
        indent--;
      }
    }
  }

  return formatted.trim();
}
