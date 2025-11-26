/**
 * xs:schema handling
 * 
 * Parses the root schema element and collects types
 */

import { DOMParser } from '@xmldom/xmldom';
import type { XmlElement, CodegenOptions, ParsedSchema, XsdImport } from '../types';
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

  // Collect all types, elements, and imports
  const complexTypes = new Map<string, XmlElement>();
  const simpleTypes = new Map<string, XmlElement>();
  const imports: XsdImport[] = [];
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
    } else if (localName === 'complexType' && name) {
      complexTypes.set(name, child);
    } else if (localName === 'simpleType' && name) {
      simpleTypes.set(name, child);
    } else if (localName === 'element' && name) {
      // Root element
      rootElement = {
        name,
        type: child.getAttribute('type') || undefined,
      };
      // Check for inline complexType
      const inlineType = findChild(child, 'complexType');
      if (inlineType) {
        complexTypes.set(name, inlineType);
        rootElement.type = name;
      }
    }
  }

  return {
    targetNs,
    prefix,
    complexTypes,
    simpleTypes,
    rootElement,
    imports,
  };
}
