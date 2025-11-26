/**
 * xs:sequence and xs:choice handling
 * 
 * Generates sequence/choice definitions from XSD
 */

import type { XmlElement } from '../types';
import { findChild, findChildren } from '../utils';
import { generateFieldsObj, generateFields } from './element';
import { generateAttributeObj, generateAttributeDef } from './attribute';

/**
 * Generate complexType definition as JSON object (for --json output)
 */
export function generateElementObj(
  typeEl: XmlElement,
  complexTypes: Map<string, XmlElement>,
  simpleTypes: Map<string, XmlElement>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Find sequence/choice
  const sequence = findChild(typeEl, 'sequence');
  const choice = findChild(typeEl, 'choice');

  if (sequence) {
    const fields = generateFieldsObj(sequence, complexTypes, simpleTypes);
    if (fields.length > 0) {
      result.sequence = fields;
    }
  }

  if (choice) {
    const fields = generateFieldsObj(choice, complexTypes, simpleTypes);
    if (fields.length > 0) {
      result.choice = fields;
    }
  }

  // Find attributes
  const attributes = findChildren(typeEl, 'attribute');
  if (attributes.length > 0) {
    result.attributes = attributes.map(generateAttributeObj);
  }

  return result;
}

/**
 * Generate complexType definition as TypeScript code string
 */
export function generateElementDef(
  typeEl: XmlElement,
  complexTypes: Map<string, XmlElement>,
  simpleTypes: Map<string, XmlElement>,
  indent: string
): string {
  const parts: string[] = ['{'];

  // Find sequence/choice
  const sequence = findChild(typeEl, 'sequence');
  const choice = findChild(typeEl, 'choice');

  if (sequence) {
    const fields = generateFields(sequence, complexTypes, simpleTypes);
    if (fields.length > 0) {
      parts.push(`${indent}  sequence: [`);
      for (const field of fields) {
        parts.push(`${indent}    ${field},`);
      }
      parts.push(`${indent}  ],`);
    }
  }

  if (choice) {
    const fields = generateFields(choice, complexTypes, simpleTypes);
    if (fields.length > 0) {
      parts.push(`${indent}  choice: [`);
      for (const field of fields) {
        parts.push(`${indent}    ${field},`);
      }
      parts.push(`${indent}  ],`);
    }
  }

  // Find attributes
  const attributes = findChildren(typeEl, 'attribute');
  if (attributes.length > 0) {
    parts.push(`${indent}  attributes: [`);
    for (const attr of attributes) {
      const attrDef = generateAttributeDef(attr);
      parts.push(`${indent}    ${attrDef},`);
    }
    parts.push(`${indent}  ],`);
  }

  parts.push(`${indent}}`);
  return parts.join('\n');
}
