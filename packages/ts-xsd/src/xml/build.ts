/**
 * ts-xsd Builder
 *
 * Build XML string from typed JavaScript object using XSD schema
 */

import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom';
import type { XsdSchema, XsdComplexType, XsdField, XsdElementDecl } from '../types';

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
  /** Element name to build (if schema has multiple elements) */
  elementName?: string;
}

/**
 * Merge all complexTypes from schema and its includes
 */
function getAllComplexTypes(schema: XsdSchema): { readonly [key: string]: XsdComplexType } {
  if (!schema.include || schema.include.length === 0) {
    return schema.complexType;
  }
  
  // Merge complexTypes from all includes
  const merged: Record<string, XsdComplexType> = { ...schema.complexType };
  for (const included of schema.include) {
    Object.assign(merged, getAllComplexTypes(included));
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
 * Get all field names from a complexType, including inherited fields.
 */
function getTypeFields(
  typeDef: XsdComplexType,
  complexTypes: { readonly [key: string]: XsdComplexType }
): Set<string> {
  const fields = new Set<string>();
  
  // Get inherited fields first
  if (typeDef.extends) {
    const baseType = complexTypes[typeDef.extends];
    if (baseType) {
      const baseFields = getTypeFields(baseType, complexTypes);
      baseFields.forEach(field => fields.add(field));
    }
  }
  
  // Add own fields
  if (typeDef.sequence) {
    for (const field of typeDef.sequence) {
      fields.add(field.name);
    }
  }
  if (typeDef.choice) {
    for (const field of typeDef.choice) {
      fields.add(field.name);
    }
  }
  if (typeDef.attributes) {
    for (const attr of typeDef.attributes) {
      fields.add(attr.name);
    }
  }
  
  return fields;
}

/**
 * Find the element declaration that best matches the data structure.
 * Scores each element type by how many of its fields match the data keys.
 * Handles inheritance by including inherited fields in the scoring.
 */
function findMatchingElement(
  data: Record<string, unknown>,
  elements: XsdElementDecl[],
  complexTypes: { readonly [key: string]: XsdComplexType }
): XsdElementDecl | undefined {
  if (elements.length <= 1) {
    return elements[0];
  }

  const dataKeys = new Set(Object.keys(data));
  let bestMatch: XsdElementDecl | undefined;
  let bestScore = -1;

  for (const element of elements) {
    const typeDef = complexTypes[element.type];
    if (!typeDef) continue;

    // Get all field names including inherited
    const typeFields = getTypeFields(typeDef, complexTypes);

    // Score: count how many data keys match type fields
    let score = 0;
    dataKeys.forEach(key => {
      if (typeFields.has(key)) {
        score++;
      }
    });

    // Prefer types where all data keys are valid fields (no extra keys)
    // and all required fields are present
    if (score > bestScore) {
      bestScore = score;
      bestMatch = element;
    }
  }

  return bestMatch;
}

/**
 * Build XML string from typed object
 */
export function build<T extends XsdSchema>(
  schema: T,
  data: unknown,
  options: BuildOptions = {}
): string {
  const { xmlDecl = true, encoding = 'utf-8', pretty = false, elementName } = options;

  const impl = new DOMImplementation();
  const doc = impl.createDocument(schema.ns || null, '', null);

  const allComplexTypes = getAllComplexTypes(schema);
  const allElements = getAllElements(schema);
  
  // Determine which element to build
  let rootName: string;
  let rootType: XsdComplexType;
  
  if (elementName) {
    // Use specified element name
    const targetElement = allElements.find(el => el.name === elementName);
    if (targetElement) {
      rootName = targetElement.name;
      rootType = allComplexTypes[targetElement.type];
    } else if (allComplexTypes[elementName]) {
      // Fallback: use elementName as complexType name directly
      rootName = elementName;
      rootType = allComplexTypes[elementName];
    } else {
      throw new Error(`Schema missing element or type: ${elementName}`);
    }
  } else if (allElements.length > 0) {
    // Auto-detect element type based on data structure
    const matchedElement = findMatchingElement(data as Record<string, unknown>, allElements, allComplexTypes);
    if (matchedElement) {
      rootName = matchedElement.name;
      rootType = allComplexTypes[matchedElement.type];
    } else {
      // Fallback to first element if no match found
      const targetElement = allElements[0];
      rootName = targetElement.name;
      rootType = allComplexTypes[targetElement.type];
    }
  } else {
    // Fallback: use first complexType key as element name
    const firstTypeName = Object.keys(allComplexTypes)[0];
    if (!firstTypeName) {
      throw new Error('Schema has no element declarations or complexTypes');
    }
    rootName = firstTypeName;
    rootType = allComplexTypes[firstTypeName];
  }
  
  if (!rootType) {
    throw new Error(`Schema missing type for element: ${rootName}`);
  }

  // Use element name as-is from declaration
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

  buildElement(doc, root, data as Record<string, unknown>, rootType, schema, allComplexTypes, options);
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
    choice: [...(mergedBase.choice || []), ...(typeDef.choice || [])],
    attributes: [...(mergedBase.attributes || []), ...(typeDef.attributes || [])],
    text: typeDef.text ?? mergedBase.text,
  };
}

/**
 * Build element content using its complexType definition
 */
function buildElement(
  doc: XmlDocument,
  node: XmlElement,
  data: Record<string, unknown>,
  typeDef: XsdComplexType,
  schema: XsdSchema,
  complexTypes: { readonly [key: string]: XsdComplexType },
  options: BuildOptions
): void {
  // Get merged definition including inherited fields
  const mergedDef = getMergedComplexTypeDef(typeDef, complexTypes);

  // Build attributes (including inherited)
  // Per W3C XML Namespaces: unprefixed attributes have no namespace,
  // prefixed attributes are namespace-qualified.
  // XSD attributeFormDefault controls this.
  if (mergedDef.attributes) {
    const qualifyAttrs = schema.attributeFormDefault === 'qualified';
    for (const attrDef of mergedDef.attributes) {
      const value = data[attrDef.name];
      if (value !== undefined && value !== null) {
        const attrName = qualifyAttrs && schema.prefix 
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
      buildField(doc, node, data[field.name], field, schema, complexTypes, options);
    }
  }

  // Build choice fields (including inherited)
  if (mergedDef.choice) {
    for (const field of mergedDef.choice) {
      if (data[field.name] !== undefined) {
        buildField(doc, node, data[field.name], field, schema, complexTypes, options);
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
  complexTypes: { readonly [key: string]: XsdComplexType },
  options: BuildOptions
): void {
  if (value === undefined || value === null) {
    return;
  }

  const nestedType = complexTypes[field.type];
  const tagName = schema.prefix ? `${schema.prefix}:${field.name}` : field.name;

  if (Array.isArray(value)) {
    for (const item of value) {
      const child = doc.createElement(tagName);
      if (nestedType) {
        buildElement(doc, child, item as Record<string, unknown>, nestedType, schema, complexTypes, options);
      } else {
        child.appendChild(doc.createTextNode(formatValue(item, field.type)));
      }
      parent.appendChild(child);
    }
  } else {
    const child = doc.createElement(tagName);
    if (nestedType) {
      buildElement(doc, child, value as Record<string, unknown>, nestedType, schema, complexTypes, options);
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
