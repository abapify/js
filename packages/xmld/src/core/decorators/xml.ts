/**
 * @xmld decorator - Mark class as XML-enabled for auto-instantiation detection
 * This is the signature decorator of the xmld library!
 */

import {
  setClassMetadata,
  registerXMLClass,
  type Constructor,
} from '../metadata';

/**
 * @xmld - Mark class as XML-enabled for auto-instantiation detection
 * This decorator registers the class in the global registry for type detection
 *
 * This is xmld's signature decorator - our visit card! 🎯
 */
export function xmld<T extends Constructor>(target: T): T {
  // Mark class as XML-enabled
  setClassMetadata(target.prototype, {
    isXMLClass: true,
  });

  // Register in global registry for auto-instantiation detection
  registerXMLClass(target.name, target);

  return target;
}

// Keep the old name for backward compatibility
export { xmld as xml };
