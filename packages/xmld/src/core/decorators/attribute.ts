/**
 * @attribute decorator - Mark a property as an XML attribute instead of element
 */

import { METADATA_TYPES } from '../constants';
import { setPropertyMetadata } from '../metadata';

/**
 * @attribute - Mark a property as an XML attribute instead of element
 */
export function attribute(target: any, propertyKey: string): void {
  setPropertyMetadata(target, propertyKey, {
    type: METADATA_TYPES.ATTRIBUTE,
    name: propertyKey,
  });
}
