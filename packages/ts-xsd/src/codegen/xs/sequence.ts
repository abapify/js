/**
 * xs:sequence and xs:choice handling
 * 
 * Generates sequence/choice definitions from XSD
 */

import type { XmlElement, ImportedSchema } from '../types';
import { findChild, findChildren } from '../utils';
import { generateFieldsObj, generateFields } from './element';
import { generateAttributeObj, generateAttributeDef } from './attribute';

/**
 * Generate complexType definition as JSON object (for --json output)
 */
export function generateElementObj(
  typeEl: XmlElement,
  complexTypes: Map<string, XmlElement>,
  simpleTypes: Map<string, XmlElement>,
  nsMap?: Map<string, string>,
  importedSchemas?: ImportedSchema[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Find sequence/choice
  const sequence = findChild(typeEl, 'sequence');
  const choice = findChild(typeEl, 'choice');
  const simpleContent = findChild(typeEl, 'simpleContent');

  if (sequence) {
    const fields = generateFieldsObj(sequence, complexTypes, simpleTypes, nsMap, importedSchemas);
    if (fields.length > 0) {
      result.sequence = fields;
    }
  }

  if (choice) {
    const fields = generateFieldsObj(choice, complexTypes, simpleTypes, nsMap, importedSchemas);
    if (fields.length > 0) {
      result.choice = fields;
    }
  }

  // Handle simpleContent with extension (text content + attributes)
  if (simpleContent) {
    const extension = findChild(simpleContent, 'extension');
    if (extension) {
      // Mark as having text content
      result.text = true;
      // Get attributes from extension (filter out nulls from ref attrs without names)
      const extAttrs = findChildren(extension, 'attribute');
      if (extAttrs.length > 0) {
        const attrs = extAttrs.map(generateAttributeObj).filter((a): a is Record<string, unknown> => a !== null);
        if (attrs.length > 0) {
          result.attributes = attrs;
        }
      }
      return result;
    }
  }

  // Find attributes (direct children, filter out nulls from ref attrs without names)
  const attributes = findChildren(typeEl, 'attribute');
  if (attributes.length > 0) {
    const attrs = attributes.map(generateAttributeObj).filter((a): a is Record<string, unknown> => a !== null);
    if (attrs.length > 0) {
      result.attributes = attrs;
    }
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
  indent: string,
  nsMap?: Map<string, string>,
  importedSchemas?: ImportedSchema[]
): string {
  const parts: string[] = ['{'];

  // Find sequence/choice/simpleContent
  const sequence = findChild(typeEl, 'sequence');
  const choice = findChild(typeEl, 'choice');
  const simpleContent = findChild(typeEl, 'simpleContent');

  if (sequence) {
    const fields = generateFields(sequence, complexTypes, simpleTypes, nsMap, importedSchemas);
    if (fields.length > 0) {
      parts.push(`${indent}  sequence: [`);
      for (const field of fields) {
        parts.push(`${indent}    ${field},`);
      }
      parts.push(`${indent}  ],`);
    }
  }

  if (choice) {
    const fields = generateFields(choice, complexTypes, simpleTypes, nsMap, importedSchemas);
    if (fields.length > 0) {
      parts.push(`${indent}  choice: [`);
      for (const field of fields) {
        parts.push(`${indent}    ${field},`);
      }
      parts.push(`${indent}  ],`);
    }
  }

  // Handle simpleContent with extension (text content + attributes)
  if (simpleContent) {
    const extension = findChild(simpleContent, 'extension');
    if (extension) {
      // Mark as having text content
      parts.push(`${indent}  text: true,`);
      // Get attributes from extension (filter out nulls from ref attrs)
      const extAttrs = findChildren(extension, 'attribute');
      const attrDefs = extAttrs.map(generateAttributeDef).filter((a): a is string => a !== null);
      if (attrDefs.length > 0) {
        parts.push(`${indent}  attributes: [`);
        for (const attrDef of attrDefs) {
          parts.push(`${indent}    ${attrDef},`);
        }
        parts.push(`${indent}  ],`);
      }
      parts.push(`${indent}}`);
      return parts.join('\n');
    }
  }

  // Find attributes (direct children, filter out nulls from ref attrs)
  const attributes = findChildren(typeEl, 'attribute');
  const attrDefs = attributes.map(generateAttributeDef).filter((a): a is string => a !== null);
  if (attrDefs.length > 0) {
    parts.push(`${indent}  attributes: [`);
    for (const attrDef of attrDefs) {
      parts.push(`${indent}    ${attrDef},`);
    }
    parts.push(`${indent}  ],`);
  }

  parts.push(`${indent}}`);
  return parts.join('\n');
}
