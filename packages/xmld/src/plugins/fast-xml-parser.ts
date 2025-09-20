/**
 * Fast-XML-Parser transformation utilities for xmld
 * Zero dependencies - pure data transformation
 */

import type { SerializationData } from '../serialization/serializer';
import { toSerializationData } from '../serialization/serializer';

/**
 * Transform xmld SerializationData to fast-xml-parser compatible object
 * This is a pure function with zero dependencies
 */
export function toFastXMLObject(data: SerializationData): any {
  const { rootElement, namespaces, attributes, elements } = data;

  const result: any = {};

  // Build root element
  const rootObj: any = {};

  // Add namespace declarations as attributes
  for (const [prefix, uri] of namespaces) {
    rootObj[`@_xmlns:${prefix}`] = uri;
  }

  // Add attributes
  for (const [key, value] of Object.entries(attributes)) {
    rootObj[`@_${key}`] = value;
  }

  // Add elements
  for (const [key, value] of Object.entries(elements)) {
    rootObj[key] = convertElementValue(value);
  }

  result[rootElement] = rootObj;

  return result;
}

/**
 * Convert element value recursively
 */
function convertElementValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => convertElementValue(item));
  } else if (value && typeof value === 'object' && value.rootElement) {
    // Nested serialization data - recursively transform but unwrap the root
    const nestedObject = toFastXMLObject(value);
    // Return the content of the root element, not the root element itself
    return nestedObject[value.rootElement];
  } else if (value && typeof value === 'object') {
    // Plain object - convert properties to fast-xml-parser format
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      // No heuristics - let xmld decorators decide what's an attribute vs element
      result[key] = convertElementValue(val);
    }
    return result;
  } else {
    return value;
  }
}

/**
 * Convenience function that combines toSerializationData + toFastXMLObject
 * Usage: toFastXML(instance) -> ready for XMLBuilder.build()
 */
export function toFastXML(instance: any): any {
  const data = toSerializationData(instance);
  return toFastXMLObject(data);
}
