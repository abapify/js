/**
 * @namespace decorator - Add namespace to class or property
 */

import { ERROR_MESSAGES } from '../constants';
import {
  setClassMetadata,
  setPropertyMetadata,
  type NamespaceInfo,
} from '../metadata';

/**
 * @namespace - Add namespace to class or property
 * Can be used as class decorator or property decorator
 */
export function namespace(prefix: string, uri: string) {
  return function (target: any, propertyKey?: string): any {
    if (!prefix || !uri) {
      throw new Error(ERROR_MESSAGES.INVALID_NAMESPACE);
    }

    const namespaceInfo: NamespaceInfo = { prefix, uri };

    if (propertyKey) {
      // Property decorator
      setPropertyMetadata(target, propertyKey, {
        namespace: namespaceInfo,
      });
    } else {
      // Class decorator
      setClassMetadata(target.prototype, {
        namespace: namespaceInfo,
      });
      return target;
    }
  };
}
