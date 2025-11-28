/**
 * xs:element handling
 * 
 * Generates element/field definitions from XSD element declarations
 */

import type { XmlElement, ImportedSchema } from '../types';
import { resolveType } from './types';

/**
 * Resolve element reference type from imported schemas
 * @param ref - Element reference like "atom:link" or "link"
 * @param nsMap - Namespace prefix to URI mapping from the XSD
 * @param importedSchemas - Pre-parsed imported schemas
 * @returns Resolved type name or undefined if not found
 */
function resolveRefType(
  ref: string,
  nsMap: Map<string, string>,
  importedSchemas?: ImportedSchema[]
): string | undefined {
  if (!importedSchemas || importedSchemas.length === 0) return undefined;
  
  // Parse ref: "prefix:elementName" or "elementName"
  const parts = ref.split(':');
  const prefix = parts.length > 1 ? parts[0] : '';
  const elementName = parts.length > 1 ? parts[1] : parts[0];
  
  // Get namespace URI from prefix
  const nsUri = prefix ? nsMap.get(prefix) : undefined;
  
  // Find matching imported schema
  for (const schema of importedSchemas) {
    // Match by namespace if we have one, otherwise try all schemas
    if (nsUri && schema.namespace !== nsUri) continue;
    
    const typeName = schema.elements.get(elementName);
    if (typeName) {
      return typeName;
    }
  }
  
  return undefined;
}

/**
 * Generate field definitions as JSON objects (for --json output)
 */
export function generateFieldsObj(
  container: XmlElement,
  complexTypes: Map<string, XmlElement>,
  simpleTypes: Map<string, XmlElement>,
  nsMap?: Map<string, string>,
  importedSchemas?: ImportedSchema[]
): Record<string, unknown>[] {
  const fields: Record<string, unknown>[] = [];
  const children = container.childNodes;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;

    const localName = child.localName || child.tagName?.split(':').pop();
    if (localName !== 'element') continue;

    let name = child.getAttribute('name');
    let type = child.getAttribute('type');
    const ref = child.getAttribute('ref');
    const minOccurs = child.getAttribute('minOccurs');
    const maxOccurs = child.getAttribute('maxOccurs');

    // Handle ref="namespace:element" - look up element type from imported schema
    let isRefType = false;
    if (ref && !name) {
      const refName = ref.includes(':') ? ref.split(':').pop()! : ref;
      name = refName;
      
      // Try to resolve the actual type from imported schemas
      const resolvedType = resolveRefType(ref, nsMap || new Map(), importedSchemas);
      if (resolvedType) {
        type = resolvedType;
      } else {
        // Fallback: capitalize first letter (element name -> Type name convention)
        type = refName.charAt(0).toUpperCase() + refName.slice(1);
      }
      isRefType = true; // Don't resolve further - it's from an included schema
    }

    if (!name) continue;

    const field: Record<string, unknown> = {
      name,
      // For ref types, use the type directly (it's from an included schema)
      type: isRefType ? type : (type ? resolveType(type, complexTypes, simpleTypes) : name),
    };

    if (minOccurs === '0') {
      field.minOccurs = 0;
    }

    if (maxOccurs === 'unbounded') {
      field.maxOccurs = 'unbounded';
    } else if (maxOccurs) {
      field.maxOccurs = parseInt(maxOccurs);  // Include explicit maxOccurs (including 1)
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Generate field definitions as TypeScript code strings
 */
export function generateFields(
  container: XmlElement,
  complexTypes: Map<string, XmlElement>,
  simpleTypes: Map<string, XmlElement>,
  nsMap?: Map<string, string>,
  importedSchemas?: ImportedSchema[]
): string[] {
  const fields: string[] = [];
  const children = container.childNodes;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;

    const localName = child.localName || child.tagName.split(':').pop();
    if (localName !== 'element') continue;

    let name = child.getAttribute('name');
    let type = child.getAttribute('type');
    const ref = child.getAttribute('ref');
    const minOccurs = child.getAttribute('minOccurs');
    const maxOccurs = child.getAttribute('maxOccurs');

    // Handle ref="namespace:element" - look up element type from imported schema
    let isRefType = false;
    if (ref && !name) {
      const refName = ref.includes(':') ? ref.split(':').pop()! : ref;
      name = refName;
      
      // Try to resolve the actual type from imported schemas
      const resolvedRefType = resolveRefType(ref, nsMap || new Map(), importedSchemas);
      if (resolvedRefType) {
        type = resolvedRefType;
      } else {
        // Fallback: capitalize first letter (element name -> Type name convention)
        type = refName.charAt(0).toUpperCase() + refName.slice(1);
      }
      isRefType = true; // Don't resolve further - it's from an included schema
    }

    if (!name) continue;

    const parts: string[] = [`{ name: '${name}'`];

    // Determine type - for ref types, use directly (from included schema)
    const resolvedType = isRefType ? type : (type ? resolveType(type, complexTypes, simpleTypes) : name);
    parts.push(`type: '${resolvedType}'`);

    // Optional?
    if (minOccurs === '0') {
      parts.push('minOccurs: 0');
    }

    // Cardinality - include explicit maxOccurs (including 1)
    if (maxOccurs === 'unbounded') {
      parts.push("maxOccurs: 'unbounded'");
    } else if (maxOccurs) {
      parts.push(`maxOccurs: ${maxOccurs}`);
    }

    fields.push(parts.join(', ') + ' }');
  }

  return fields;
}
