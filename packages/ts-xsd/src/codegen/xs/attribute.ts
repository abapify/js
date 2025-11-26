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
export function generateAttributeObj(attr: XmlElement): Record<string, unknown> {
  const name = attr.getAttribute('name');
  const type = attr.getAttribute('type');
  const use = attr.getAttribute('use');

  const result: Record<string, unknown> = {
    name,
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
export function generateAttributeDef(attr: XmlElement): string {
  const name = attr.getAttribute('name');
  const type = attr.getAttribute('type') || 'string';
  const use = attr.getAttribute('use');

  const parts: string[] = [`{ name: '${name}'`];
  parts.push(`type: '${mapXsdType(type)}'`);

  if (use === 'required') {
    parts.push('required: true');
  }

  return parts.join(', ') + ' }';
}
