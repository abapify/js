/**
 * @attributes decorator - Shortcut for @unwrap @attribute
 *
 * This is a convenience decorator that combines @unwrap and @attribute
 * for flattening attribute objects onto the parent element.
 */

import { attribute } from './attribute';
import { unwrap } from './unwrap';

/**
 * @attributes - Convenience decorator that combines @unwrap @attribute
 *
 * This decorator is a shortcut for the common pattern of:
 * @unwrap
 * @attribute
 *
 * Use this when you want to flatten an object's properties as attributes
 * on the parent XML element.
 *
 * @example
 * ```typescript
 * @xmld
 * @root('example:root')
 * class ExampleXML {
 *   @attributes
 *   @namespace('core')
 *   core!: CoreAttrs; // Properties of CoreAttrs become attributes on example:root
 * }
 * ```
 */
export function attributes(target: any, propertyKey: string | symbol): void {
  // Apply unwrap decorator first
  unwrap(target, propertyKey);

  // Then apply attribute decorator
  attribute(target, propertyKey);
}
