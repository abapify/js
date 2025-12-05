/**
 * XML Builder for W3C Schema
 * 
 * Build XML string from typed JavaScript object using W3C-compliant Schema definition.
 */

import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom';
import type { SchemaLike } from '../infer/types';

// Use 'any' for xmldom types since they don't match browser DOM types
type XmlDocument = any;
type XmlElement = any;

// Internal types for working with SchemaLike
type ComplexTypeDef = {
  name?: string;
  sequence?: { element?: readonly FieldDef[] };
  choice?: { element?: readonly FieldDef[] };
  all?: { element?: readonly FieldDef[] };
  attribute?: readonly { name?: string; type?: string; use?: string; default?: string }[];
  complexContent?: { extension?: { base?: string; sequence?: ComplexTypeDef['sequence']; choice?: ComplexTypeDef['choice']; all?: ComplexTypeDef['all']; attribute?: ComplexTypeDef['attribute'] } };
};

type FieldDef = { name?: string; type?: string; ref?: string; minOccurs?: number | string; maxOccurs?: number | string | 'unbounded' };
type ElementDef = { name?: string; type?: string };

export interface BuildOptions {
  /** Include XML declaration (default: true) */
  xmlDecl?: boolean;
  /** XML encoding (default: utf-8) */
  encoding?: string;
  /** Pretty print with indentation (default: false) */
  pretty?: boolean;
  /** Namespace prefix to use (default: from schema or none) */
  prefix?: string;
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

  const complexTypes = getComplexTypesArray(schema.complexType);
  const elements = schema.element as readonly ElementDef[] | undefined;

  // Find the element declaration that matches the data
  const elementDecl = findMatchingElement(data as Record<string, unknown>, elements || [], complexTypes);
  
  if (!elementDecl) {
    throw new Error('Schema has no element declarations');
  }

  const typeName = stripNsPrefix(elementDecl.type || elementDecl.name || '');
  const rootTypeFound = findComplexTypeWithSchema(typeName, schema, complexTypes);

  if (!rootTypeFound) {
    throw new Error(`Schema missing complexType for: ${typeName}`);
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

  buildElement(doc, root, data as Record<string, unknown>, rootTypeFound.type, rootTypeFound.schema, rootTypeFound.complexTypes, prefix);
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
 * Convert complexType (array or object) to array format
 */
function getComplexTypesArray(
  complexType: SchemaLike['complexType']
): ComplexTypeDef[] {
  if (!complexType) return [];
  if (Array.isArray(complexType)) return complexType as ComplexTypeDef[];
  return Object.entries(complexType).map(([name, def]) => ({ ...def, name } as ComplexTypeDef));
}

/**
 * Strip namespace prefix from type name
 */
function stripNsPrefix(name: string): string {
  const colonIndex = name.indexOf(':');
  return colonIndex >= 0 ? name.slice(colonIndex + 1) : name;
}

/**
 * Find complexType by name (local search only)
 */
function findComplexTypeByNameLocal(
  complexTypes: readonly ComplexTypeDef[],
  name: string
): ComplexTypeDef | undefined {
  return complexTypes.find(ct => ct.name === name);
}

/**
 * Find complexType by name (searches current schema and $imports)
 * Returns both the type and the schema it was found in
 */
function findComplexTypeWithSchema(
  name: string,
  schema: SchemaLike,
  complexTypes: readonly ComplexTypeDef[]
): { type: ComplexTypeDef; schema: SchemaLike; complexTypes: readonly ComplexTypeDef[] } | undefined {
  // First try to find in current schema
  const localType = findComplexTypeByNameLocal(complexTypes, name);
  if (localType) {
    return { type: localType, schema, complexTypes };
  }

  // Search in $imports
  const imports = schema.$imports as readonly SchemaLike[] | undefined;
  if (imports) {
    for (const importedSchema of imports) {
      const importedComplexTypes = getComplexTypesArray(importedSchema.complexType);
      const found = findComplexTypeWithSchema(name, importedSchema, importedComplexTypes);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * Find the element declaration that best matches the data structure
 */
function findMatchingElement(
  data: Record<string, unknown>,
  elements: readonly ElementDef[],
  complexTypes: readonly ComplexTypeDef[]
): ElementDef | undefined {
  if (elements.length <= 1) {
    return elements[0];
  }

  const dataKeys = new Set(Object.keys(data));
  let bestMatch: ElementDef | undefined;
  let bestScore = -1;

  for (const element of elements) {
    if (!element.type) continue;
    const typeDef = findComplexTypeByNameLocal(complexTypes, stripNsPrefix(element.type));
    if (!typeDef) continue;

    const typeFields = getTypeFieldsLocal(typeDef, complexTypes);
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
 * Get all field names from a complexType, including inherited fields (local search only)
 * Used for element matching heuristics - doesn't need cross-schema search
 */
function getTypeFieldsLocal(
  typeDef: ComplexTypeDef,
  complexTypes: readonly ComplexTypeDef[]
): Set<string> {
  const fields = new Set<string>();

  // Get inherited fields
  const extension = typeDef.complexContent?.extension;
  if (extension?.base) {
    const baseType = findComplexTypeByNameLocal(complexTypes, stripNsPrefix(extension.base));
    if (baseType) {
      const baseFields = getTypeFieldsLocal(baseType, complexTypes);
      baseFields.forEach(f => fields.add(f));
    }
  }

  // Add own fields
  const addFields = (group: ComplexTypeDef['sequence']) => {
    if (group?.element) {
      for (const field of group.element) {
        if (field.name) fields.add(field.name);
      }
    }
  };

  addFields(typeDef.sequence);
  addFields(typeDef.all);
  addFields(typeDef.choice);
  addFields(extension?.sequence);
  addFields(extension?.all);
  addFields(extension?.choice);

  if (typeDef.attribute) {
    for (const attr of typeDef.attribute) {
      if (attr.name) fields.add(attr.name);
    }
  }

  return fields;
}

/**
 * Get merged complexType definition including inherited fields
 * Searches $imports for base types to support cross-schema inheritance
 */
function getMergedComplexType(
  typeDef: ComplexTypeDef,
  schema: SchemaLike,
  complexTypes: readonly ComplexTypeDef[]
): ComplexTypeDef {
  const extension = typeDef.complexContent?.extension;
  if (!extension?.base) {
    return typeDef;
  }

  const baseName = stripNsPrefix(extension.base);
  // Search in current schema AND $imports for base type
  const found = findComplexTypeWithSchema(baseName, schema, complexTypes);
  if (!found) {
    return typeDef;
  }

  // Recursively get merged base (handles multi-level inheritance)
  // Use the schema where the base type was found for proper context
  const mergedBase = getMergedComplexType(found.type, found.schema, found.complexTypes);

  return {
    name: typeDef.name,
    sequence: mergeGroups(mergedBase.sequence, typeDef.sequence || extension.sequence),
    choice: mergeGroups(mergedBase.choice, typeDef.choice || extension.choice),
    all: mergeGroups(mergedBase.all, typeDef.all || extension.all),
    attribute: [...(mergedBase.attribute || []), ...(typeDef.attribute || []), ...(extension.attribute || [])],
  };
}

/**
 * Merge two group structures
 */
function mergeGroups(
  base: ComplexTypeDef['sequence'],
  derived: ComplexTypeDef['sequence']
): ComplexTypeDef['sequence'] {
  if (!base && !derived) return undefined;
  if (!base) return derived;
  if (!derived) return base;
  return { element: [...(base.element || []), ...(derived.element || [])] };
}

/**
 * Build element content using its complexType definition
 */
function buildElement(
  doc: XmlDocument,
  node: XmlElement,
  data: Record<string, unknown>,
  typeDef: ComplexTypeDef,
  schema: SchemaLike,
  complexTypes: readonly ComplexTypeDef[],
  prefix: string | undefined
): void {
  const mergedDef = getMergedComplexType(typeDef, schema, complexTypes);

  // Build attributes
  if (mergedDef.attribute) {
    for (const attrDef of mergedDef.attribute) {
      if (!attrDef.name) continue;
      const value = data[attrDef.name];
      if (value !== undefined && value !== null) {
        node.setAttribute(attrDef.name, formatValue(value, attrDef.type || 'string'));
      }
    }
  }

  // Build sequence elements
  if (mergedDef.sequence?.element) {
    for (const field of mergedDef.sequence.element) {
      const resolved = resolveFieldRef(field, schema);
      if (!resolved) continue;
      const value = data[resolved.elementName];
      if (value !== undefined) {
        buildField(doc, node, value, resolved, schema, complexTypes, prefix);
      }
    }
  }

  // Build all elements
  if (mergedDef.all?.element) {
    for (const field of mergedDef.all.element) {
      const resolved = resolveFieldRef(field, schema);
      if (!resolved) continue;
      const value = data[resolved.elementName];
      if (value !== undefined) {
        buildField(doc, node, value, resolved, schema, complexTypes, prefix);
      }
    }
  }

  // Build choice elements
  if (mergedDef.choice?.element) {
    for (const field of mergedDef.choice.element) {
      const resolved = resolveFieldRef(field, schema);
      if (!resolved) continue;
      const value = data[resolved.elementName];
      if (value !== undefined) {
        buildField(doc, node, value, resolved, schema, complexTypes, prefix);
      }
    }
  }
}

/**
 * Resolve a field definition to element name and type
 * Handles both direct name/type and ref references
 */
function resolveFieldRef(
  field: FieldDef,
  schema: SchemaLike
): { elementName: string; typeName?: string } | undefined {
  // Direct element with name
  if (field.name) {
    return { elementName: field.name, typeName: field.type ? stripNsPrefix(field.type) : undefined };
  }
  
  // Element reference (e.g., ref: "atom:link")
  if (field.ref) {
    const refName = stripNsPrefix(field.ref);
    // Search for the element declaration in $imports
    const elementDecl = findElementWithSchema(refName, schema);
    if (elementDecl) {
      return {
        elementName: elementDecl.element.name!,
        typeName: elementDecl.element.type ? stripNsPrefix(elementDecl.element.type) : undefined,
      };
    }
    // Fallback: use the ref name as element name
    return { elementName: refName };
  }
  
  return undefined;
}

/**
 * Find element declaration by name (searches current schema and $imports)
 */
function findElementWithSchema(
  name: string,
  schema: SchemaLike
): { element: ElementDef; schema: SchemaLike } | undefined {
  // Search in current schema
  const elements = schema.element as readonly ElementDef[] | undefined;
  if (elements) {
    const found = elements.find(el => el.name === name);
    if (found) {
      return { element: found, schema };
    }
  }

  // Search in $imports
  const imports = schema.$imports as readonly SchemaLike[] | undefined;
  if (imports) {
    for (const importedSchema of imports) {
      const found = findElementWithSchema(name, importedSchema);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

type ResolvedField = { elementName: string; typeName?: string };

/**
 * Build a field (child element)
 */
function buildField(
  doc: XmlDocument,
  parent: XmlElement,
  value: unknown,
  resolved: ResolvedField,
  schema: SchemaLike,
  complexTypes: readonly ComplexTypeDef[],
  prefix: string | undefined
): void {
  if (value === undefined || value === null) return;

  const { elementName, typeName } = resolved;
  // Search in current schema AND $imports for nested type
  const nestedFound = typeName ? findComplexTypeWithSchema(typeName, schema, complexTypes) : undefined;
  const tagName = prefix ? `${prefix}:${elementName}` : elementName;

  if (Array.isArray(value)) {
    for (const item of value) {
      const child = doc.createElement(tagName);
      if (nestedFound) {
        buildElement(doc, child, item as Record<string, unknown>, nestedFound.type, nestedFound.schema, nestedFound.complexTypes, prefix);
      } else {
        child.appendChild(doc.createTextNode(formatValue(item, typeName || 'string')));
      }
      parent.appendChild(child);
    }
  } else {
    const child = doc.createElement(tagName);
    if (nestedFound) {
      buildElement(doc, child, value as Record<string, unknown>, nestedFound.type, nestedFound.schema, nestedFound.complexTypes, prefix);
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
