/**
 * @root decorator - Define the root XML element for a class
 */

import { ERROR_MESSAGES } from '../constants';
import { setClassMetadata, type Constructor } from '../metadata';

/**
 * @root - Define the root XML element for a class
 * Must be combined with @xml for full functionality
 */
export function root(elementName: string) {
  return function <T extends Constructor>(target: T): T {
    if (!elementName) {
      throw new Error(ERROR_MESSAGES.INVALID_NAMESPACE);
    }

    setClassMetadata(target.prototype, {
      xmlRoot: elementName,
    });

    return target;
  };
}
