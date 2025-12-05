/**
 * XML Parser for W3C Schema
 * 
 * Parse XML string to typed JavaScript object using W3C-compliant Schema definition.
 */

import { DOMParser } from '@xmldom/xmldom';
import type { InferSchema, SchemaLike } from '../infer/types';

// Use 'any' for xmldom types since they don't match browser DOM types
type XmlElement = any;

// Internal types for working with SchemaLike
type FieldDef = {
  name?: string;
  type?: string;
  ref?: string;  // Element reference (e.g., "atom:link")
  minOccurs?: number | string;
  maxOccurs?: number | string | 'unbounded';
};

type ComplexTypeDef = {
  name?: string;
  sequence?: { element?: readonly FieldDef[] };
  choice?: { element?: readonly FieldDef[] };
  all?: { element?: readonly FieldDef[] };
  attribute?: readonly { name?: string; type?: string; use?: string; default?: string }[];
  complexContent?: { extension?: { base?: string; sequence?: ComplexTypeDef['sequence']; choice?: ComplexTypeDef['choice']; all?: ComplexTypeDef['all']; attribute?: ComplexTypeDef['attribute'] } };
  simpleContent?: { extension?: { base?: string; attribute?: ComplexTypeDef['attribute'] } };
};

type ElementDef = { name?: string; type?: string };

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
  const rootLocalName = root.localName || root.tagName.split(':').pop() || root.tagName;

  // Find the element declaration for this root
  const elements = schema.element as readonly ElementDef[] | undefined;
  const elementDecl = findElementByName(elements || [], rootLocalName);
  
  if (!elementDecl) {
    throw new Error(`Schema missing element declaration for: ${rootLocalName}`);
  }

  // Get the type name (strip namespace prefix if present)
  const typeName = stripNsPrefix(elementDecl.type || elementDecl.name || '');
  
  // Find the complexType definition (searches current schema and $imports)
  const found = findComplexTypeWithSchema(typeName, schema);
  
  if (!found) {
    throw new Error(`Schema missing complexType for: ${typeName}`);
  }

  return parseElement(root, found.type, found.schema) as InferSchema<T>;
}

/**
 * Convert complexType (array or object) to array format
 */
function getComplexTypesArray(
  complexType: SchemaLike['complexType']
): ComplexTypeDef[] {
  if (!complexType) return [];
  if (Array.isArray(complexType)) return complexType as ComplexTypeDef[];
  // Object format: { TypeName: { ... } }
  return Object.entries(complexType).map(([name, def]) => ({ ...def, name } as ComplexTypeDef));
}

/**
 * Strip namespace prefix from type name (e.g., "tns:PersonType" -> "PersonType")
 */
function stripNsPrefix(name: string): string {
  const colonIndex = name.indexOf(':');
  return colonIndex >= 0 ? name.slice(colonIndex + 1) : name;
}

/**
 * Find element declaration by name (case-insensitive)
 */
function findElementByName(
  elements: readonly { name?: string }[],
  name: string
): { name?: string; type?: string } | undefined {
  // Try exact match first
  let found = elements.find(el => el.name === name);
  if (found) return found as { name?: string; type?: string };
  
  // Try case-insensitive match
  const lowerName = name.toLowerCase();
  return elements.find(el => el.name?.toLowerCase() === lowerName) as { name?: string; type?: string } | undefined;
}

/**
 * Find complexType by name (searches current schema only)
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
  schema: SchemaLike
): { type: ComplexTypeDef; schema: SchemaLike } | undefined {
  // First try to find in current schema
  const localType = findComplexTypeByNameLocal(getComplexTypesArray(schema.complexType), name);
  if (localType) {
    return { type: localType, schema };
  }

  // Search in $imports
  const imports = schema.$imports as readonly SchemaLike[] | undefined;
  if (imports) {
    for (const importedSchema of imports) {
      const found = findComplexTypeWithSchema(name, importedSchema);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * Get merged complexType definition including inherited fields from base type
 * Searches $imports for base types to support cross-schema inheritance
 */
function getMergedComplexType(
  typeDef: ComplexTypeDef,
  schema: SchemaLike
): ComplexTypeDef {
  // Check for complexContent/extension (inheritance)
  const extension = typeDef.complexContent?.extension;
  if (!extension?.base) {
    return typeDef;
  }

  const baseName = stripNsPrefix(extension.base);
  // Search in current schema AND $imports for base type
  const found = findComplexTypeWithSchema(baseName, schema);
  
  if (!found) {
    return typeDef;
  }

  // Recursively get merged base (handles multi-level inheritance)
  // Use the schema where the base type was found for proper context
  const mergedBase = getMergedComplexType(found.type, found.schema);

  // Merge: base fields first, then derived fields
  return {
    name: typeDef.name,
    sequence: mergeGroups(mergedBase.sequence, typeDef.sequence || extension.sequence),
    choice: mergeGroups(mergedBase.choice, typeDef.choice || extension.choice),
    all: mergeGroups(mergedBase.all, typeDef.all || extension.all),
    attribute: [...(mergedBase.attribute || []), ...(typeDef.attribute || []), ...(extension.attribute || [])],
  } as ComplexTypeDef;
}

/**
 * Merge two ExplicitGroup structures
 */
function mergeGroups(
  base: ComplexTypeDef['sequence'],
  derived: ComplexTypeDef['sequence']
): ComplexTypeDef['sequence'] {
  if (!base && !derived) return undefined;
  if (!base) return derived;
  if (!derived) return base;
  
  return {
    element: [...(base.element || []), ...(derived.element || [])],
  };
}

/**
 * Parse a single element using its complexType definition
 */
function parseElement(
  node: XmlElement,
  typeDef: ComplexTypeDef,
  schema: SchemaLike
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Handle simpleContent (text content with attributes)
  if (typeDef.simpleContent?.extension) {
    const ext = typeDef.simpleContent.extension;
    
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
          result[attrDef.name] = convertValue(attrDef.default, attrDef.type || 'string');
        }
      }
    }
    
    return result;
  }

  const mergedDef = getMergedComplexType(typeDef, schema);

  // Parse attributes
  if (mergedDef.attribute) {
    for (const attrDef of mergedDef.attribute) {
      if (!attrDef.name) continue;
      const value = getAttributeValue(node, attrDef.name);
      if (value !== null) {
        result[attrDef.name] = convertValue(value, attrDef.type || 'string');
      } else if (attrDef.default !== undefined) {
        result[attrDef.name] = convertValue(attrDef.default, attrDef.type || 'string');
      }
    }
  }

  // Parse sequence elements
  if (mergedDef.sequence?.element) {
    for (const elemDef of mergedDef.sequence.element) {
      const parsed = parseField(node, elemDef, schema);
      if (parsed !== undefined) {
        result[parsed.name] = parsed.value;
      }
    }
  }

  // Parse all elements (xs:all - same as sequence at runtime)
  if (mergedDef.all?.element) {
    for (const elemDef of mergedDef.all.element) {
      const parsed = parseField(node, elemDef, schema);
      if (parsed !== undefined) {
        result[parsed.name] = parsed.value;
      }
    }
  }

  // Parse choice elements
  if (mergedDef.choice?.element) {
    for (const elemDef of mergedDef.choice.element) {
      const parsed = parseField(node, elemDef, schema);
      if (parsed !== undefined) {
        result[parsed.name] = parsed.value;
      }
    }
  }

  return result;
}

/**
 * Parse a field (child element)
 * Handles both named elements and element references (ref)
 */
function parseField(
  parent: XmlElement,
  field: FieldDef,
  schema: SchemaLike
): { name: string; value: unknown } | undefined {
  // Resolve element reference if present
  const resolved = resolveFieldRef(field, schema);
  if (!resolved) return undefined;
  
  const { elementName, typeName } = resolved;
  const children = getChildElements(parent, elementName);
  const isArray = field.maxOccurs === 'unbounded' || 
                  (typeof field.maxOccurs === 'number' && field.maxOccurs > 1) ||
                  (typeof field.maxOccurs === 'string' && parseInt(field.maxOccurs, 10) > 1);

  // Find nested complexType if this field has a complex type (searches $imports too)
  const nestedFound = typeName 
    ? findComplexTypeWithSchema(typeName, schema)
    : undefined;

  if (isArray) {
    const value = children.map(child =>
      nestedFound
        ? parseElement(child, nestedFound.type, nestedFound.schema)
        : convertValue(getTextContent(child) || '', typeName || 'string')
    );
    return { name: elementName, value };
  }

  if (children.length === 0) {
    return undefined;
  }

  const child = children[0];
  const value = nestedFound
    ? parseElement(child, nestedFound.type, nestedFound.schema)
    : convertValue(getTextContent(child) || '', typeName || 'string');
  return { name: elementName, value };
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
      const localName = child.localName || child.tagName.split(':').pop();
      if (localName === name) {
        result.push(child);
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
