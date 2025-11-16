import type { AdkObject } from './adk-object';
import { ObjectRegistry } from '../registry/object-registry';
import { GenericAbapObject } from '../objects/generic';
import { extractTypeFromXml, mapTypeToKind } from './type-detector';

/**
 * Global factory function to create any ADK object from XML
 *
 * Auto-detects object type and creates appropriate instance:
 * - If type is registered → creates specific object (Class, Interface, etc.)
 * - If type is not registered → creates GenericAbapObject
 *
 * @param xml - ADT XML string
 * @returns AdkObject instance (specific type or generic fallback)
 *
 * @example
 * ```typescript
 * const obj = fromAdtXml(classXml); // Returns Class instance
 * const obj = fromAdtXml(unknownXml); // Returns GenericAbapObject
 * ```
 */
export function fromAdtXml(xml: string): AdkObject {
  // 1. Extract object type from XML
  const type = extractTypeFromXml(xml);

  if (!type) {
    throw new Error('Cannot determine object type from XML: missing adtcore:type attribute');
  }

  // 2. Map type to kind
  const kind = mapTypeToKind(type);

  if (!kind) {
    // Unknown type → use generic fallback
    return GenericAbapObject.fromAdtXml(xml);
  }

  // 3. Get constructor from registry
  const constructor = ObjectRegistry.getConstructor(kind);

  if (!constructor) {
    // Kind not registered → use generic fallback
    return GenericAbapObject.fromAdtXml(xml);
  }

  // 4. Create specific object using registered constructor
  return constructor.fromAdtXml(xml);
}
