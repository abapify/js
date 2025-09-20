/**
 * @unwrap decorator - Flatten object properties into parent (no wrapper element)
 */

import { setPropertyMetadata } from '../metadata';

/**
 * @unwrap - Flatten object properties into parent (no wrapper element)
 * Can be combined with @element or @attribute
 */
export function unwrap(target: any, propertyKey: string): void {
  setPropertyMetadata(target, propertyKey, {
    unwrap: true,
  });
}
