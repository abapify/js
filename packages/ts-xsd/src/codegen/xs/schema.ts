/**
 * xs:schema handling
 * 
 * Parses the root schema element and collects types
 */

import { DOMParser } from '@xmldom/xmldom';
import type { XmlElement, CodegenOptions, ParsedSchema, XsdImport, XsdRedefine, XsdElementDecl } from '../types';
import { findChild, extractPrefix } from '../utils';

/**
 * Parse XSD string and extract schema information
 */
export function parseSchema(xsd: string, options: CodegenOptions = {}): ParsedSchema {
  const doc = new DOMParser().parseFromString(xsd, 'text/xml');
  const schemaEl = doc.documentElement;

  if (!schemaEl || !schemaEl.tagName.endsWith('schema')) {
    throw new Error('Invalid XSD: no schema element');
  }

  const targetNs = schemaEl.getAttribute('targetNamespace') || undefined;
  const prefix = options.prefix || extractPrefix(targetNs);
  const attributeFormDefault = schemaEl.getAttribute('attributeFormDefault') as 'qualified' | 'unqualified' | null;

  // Extract namespace prefix mappings from xmlns:* attributes
  const nsMap = new Map<string, string>();
  const attrs = schemaEl.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name.startsWith('xmlns:')) {
      const nsPrefix = attr.name.slice(6); // Remove 'xmlns:'
      nsMap.set(nsPrefix, attr.value);
    }
  }

  // Collect all types, elements, imports, and redefines
  const complexTypes = new Map<string, XmlElement>();
  const simpleTypes = new Map<string, XmlElement>();
  const imports: XsdImport[] = [];
  const redefines: XsdRedefine[] = [];
  const elements: XsdElementDecl[] = [];
  let rootElement: { name: string; type?: string } | null = null;

  const children = schemaEl.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as XmlElement;
    if (child.nodeType !== 1) continue;

    const localName = child.localName || child.tagName?.split(':').pop();
    const name = child.getAttribute?.('name');

    if (localName === 'import') {
      // xsd:import - collect namespace and schemaLocation
      const ns = child.getAttribute('namespace');
      const schemaLocation = child.getAttribute('schemaLocation');
      if (ns && schemaLocation) {
        imports.push({ namespace: ns, schemaLocation });
      }
    } else if (localName === 'include') {
      // xsd:include - same namespace include (no namespace attr needed)
      const schemaLocation = child.getAttribute('schemaLocation');
      if (schemaLocation) {
        // Use target namespace for includes (same namespace)
        imports.push({ namespace: targetNs || '', schemaLocation });
      }
    } else if (localName === 'redefine') {
      // xsd:redefine - collect schemaLocation and redefined types
      const schemaLocation = child.getAttribute('schemaLocation');
      if (schemaLocation) {
        const redefineComplexTypes = new Map<string, XmlElement>();
        const redefineSimpleTypes = new Map<string, XmlElement>();
        
        // Parse children of redefine element
        const redefineChildren = child.childNodes;
        for (let j = 0; j < redefineChildren.length; j++) {
          const redefChild = redefineChildren[j] as XmlElement;
          if (redefChild.nodeType !== 1) continue;
          
          const redefLocalName = redefChild.localName || redefChild.tagName?.split(':').pop();
          const redefName = redefChild.getAttribute?.('name');
          
          if (redefLocalName === 'complexType' && redefName) {
            redefineComplexTypes.set(redefName, redefChild);
          } else if (redefLocalName === 'simpleType' && redefName) {
            redefineSimpleTypes.set(redefName, redefChild);
          }
        }
        
        redefines.push({
          schemaLocation,
          complexTypes: redefineComplexTypes,
          simpleTypes: redefineSimpleTypes,
        });
      }
    } else if (localName === 'complexType' && name) {
      complexTypes.set(name, child);
    } else if (localName === 'simpleType' && name) {
      simpleTypes.set(name, child);
    } else if (localName === 'element' && name) {
      // Collect ALL top-level element declarations
      let typeName = child.getAttribute('type') || undefined;
      
      // Check for inline complexType
      const inlineType = findChild(child, 'complexType');
      if (inlineType) {
        // Use element name as type name for inline types
        complexTypes.set(name, inlineType);
        typeName = name;
      }
      
      // Strip namespace prefix from type (e.g., "pak:Package" -> "Package")
      if (typeName && typeName.includes(':')) {
        typeName = typeName.split(':')[1];
      }
      
      // Add to elements array
      if (typeName) {
        elements.push({ name, type: typeName });
      }
      
      // Keep rootElement for backward compatibility (first element)
      if (!rootElement) {
        rootElement = { name, type: typeName };
      }
    }
  }

  return {
    targetNs,
    prefix,
    complexTypes,
    simpleTypes,
    elements,
    rootElement,
    imports,
    redefines,
    nsMap,
    attributeFormDefault: attributeFormDefault || undefined,
  };
}
