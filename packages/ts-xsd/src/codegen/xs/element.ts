/**
 * xs:element handling
 * 
 * Generates element/field definitions from XSD element declarations
 */

import type { XmlElement } from '../types';
import { resolveType } from './types';

/**
 * Generate field definitions as JSON objects (for --json output)
 */
export function generateFieldsObj(
  container: XmlElement,
  complexTypes: Map<string, XmlElement>,
  simpleTypes: Map<string, XmlElement>
): Record<string, unknown>[] {
  const fields: Record<string, unknown>[] = [];
  const children = container.childNodes;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;

    const localName = child.localName || child.tagName?.split(':').pop();
    if (localName !== 'element') continue;

    const name = child.getAttribute('name');
    const type = child.getAttribute('type');
    const minOccurs = child.getAttribute('minOccurs');
    const maxOccurs = child.getAttribute('maxOccurs');

    if (!name) continue;

    const field: Record<string, unknown> = {
      name,
      type: resolveType(type, complexTypes, simpleTypes),
    };

    if (minOccurs === '0') {
      field.minOccurs = 0;
    }

    if (maxOccurs === 'unbounded') {
      field.maxOccurs = 'unbounded';
    } else if (maxOccurs && parseInt(maxOccurs) > 1) {
      field.maxOccurs = parseInt(maxOccurs);
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
  simpleTypes: Map<string, XmlElement>
): string[] {
  const fields: string[] = [];
  const children = container.childNodes;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;

    const localName = child.localName || child.tagName.split(':').pop();
    if (localName !== 'element') continue;

    const name = child.getAttribute('name');
    const type = child.getAttribute('type');
    const minOccurs = child.getAttribute('minOccurs');
    const maxOccurs = child.getAttribute('maxOccurs');

    if (!name) continue;

    const parts: string[] = [`{ name: '${name}'`];

    // Determine type
    const resolvedType = resolveType(type, complexTypes, simpleTypes);
    parts.push(`type: '${resolvedType}'`);

    // Optional?
    if (minOccurs === '0') {
      parts.push('minOccurs: 0');
    }

    // Array?
    if (maxOccurs === 'unbounded') {
      parts.push("maxOccurs: 'unbounded'");
    } else if (maxOccurs && parseInt(maxOccurs) > 1) {
      parts.push(`maxOccurs: ${maxOccurs}`);
    }

    fields.push(parts.join(', ') + ' }');
  }

  return fields;
}
