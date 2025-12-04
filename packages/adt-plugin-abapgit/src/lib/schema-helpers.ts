/**
 * Helper utilities for creating ts-xml schemas
 */

import { tsxml } from 'ts-xml';
import type { ElementSchema } from 'ts-xml';

/**
 * Create a simple text element schema
 *
 * This helper reduces boilerplate for simple text-only elements.
 *
 * @example
 * ```typescript
 * // Instead of:
 * CTEXT: {
 *   kind: 'elem',
 *   name: 'CTEXT',
 *   schema: tsxml.schema({
 *     tag: 'CTEXT',
 *     fields: { text: { kind: 'text', type: 'string' } }
 *   })
 * }
 *
 * // Use:
 * CTEXT: textElem('CTEXT')
 * ```
 */
export function textElem(tagName: string): {
  kind: 'elem';
  name: string;
  schema: ElementSchema;
} {
  return {
    kind: 'elem',
    name: tagName,
    schema: tsxml.schema({
      tag: tagName,
      fields: {
        text: { kind: 'text', type: 'string' },
      },
    }),
  };
}
