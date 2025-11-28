/**
 * xs:attribute handling
 * 
 * Generates attribute definitions from XSD attribute declarations
 */

import type { XmlElement } from '../types';
import { mapXsdType } from './types';

/**
 * Generate attribute definition as JSON object
 */
export function generateAttributeObj(attr: XmlElement): Record<string, unknown> | null {
  const name = attr.getAttribute('name');
  const ref = attr.getAttribute('ref');
  const type = attr.getAttribute('type');
  const use = attr.getAttribute('use');

  // Handle ref attributes (e.g., ref="xml:base") - extract local name from ref
  const attrName = name || (ref ? ref.split(':').pop() : null);
  
  // Skip if we can't determine a name
  if (!attrName) {
    return null;
  }

  const result: Record<string, unknown> = {
    name: attrName,
    type: mapXsdType(type || 'xs:string'),
  };

  if (use === 'required') {
    result.required = true;
  }

  return result;
}

/**
 * Generate attribute definition as TypeScript code string
 */
export function generateAttributeDef(attr: XmlElement): string | null {
  const name = attr.getAttribute('name');
  const ref = attr.getAttribute('ref');
  const type = attr.getAttribute('type') || 'string';
  const use = attr.getAttribute('use');

  // Handle ref attributes (e.g., ref="xml:base") - extract local name from ref
  const attrName = name || (ref ? ref.split(':').pop() : null);
  
  // Skip if we can't determine a name
  if (!attrName) {
    return null;
  }

  const parts: string[] = [`{ name: '${attrName}'`];
  parts.push(`type: '${mapXsdType(type)}'`);

  if (use === 'required') {
    parts.push('required: true');
  }

  return parts.join(', ') + ' }';
}
