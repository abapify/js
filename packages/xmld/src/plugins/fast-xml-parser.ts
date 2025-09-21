/**
 * Fast-XML-Parser transformation utilities for xmld
 * Zero dependencies - pure data transformation
 */

import type { SerializationData } from '../serialization/serializer';
import { toSerializationData } from '../serialization/serializer';
import { getClassMetadata, getAllPropertyMetadata } from '../core/metadata';
import { METADATA_TYPES } from '../core/constants';

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

// ===== PARSING PLUGIN (NEW!) =====

/**
 * Parse fast-xml-parser compatible JSON to object instance using decorator metadata
 *
 * This maintains xmld's zero-dependency principle by accepting already-parsed JSON
 * instead of depending on fast-xml-parser directly.
 *
 * Usage:
 * ```typescript
 * import { XMLParser } from 'fast-xml-parser';
 * import { fromFastXMLObject } from 'xmld';
 *
 * const parser = new XMLParser(options);
 * const json = parser.parse(xml);
 * const instance = fromFastXMLObject(json, MyClass);
 * ```
 */
export function fromFastXMLObject<T>(
  fastXmlJson: any,
  ClassConstructor: new () => T
): T {
  // Get class metadata to find root element - try both approaches
  let classMetadata = getClassMetadata(ClassConstructor);
  if (!classMetadata?.xmlRoot) {
    // Try the serializer approach: use .prototype
    classMetadata = getClassMetadata(ClassConstructor.prototype);
  }

  if (!classMetadata?.xmlRoot) {
    throw new Error(
      `Class ${ClassConstructor.name} is not decorated with @root`
    );
  }

  // Find the root element in parsed JSON
  const rootElement = fastXmlJson[classMetadata.xmlRoot];
  if (!rootElement) {
    throw new Error(
      `Root element '${classMetadata.xmlRoot}' not found in JSON`
    );
  }

  // Create instance and populate properties
  const instance = new ClassConstructor();
  const propertyMetadata = getAllPropertyMetadata(ClassConstructor.prototype);

  // Process each decorated property (propertyMetadata is a Map, not Object)
  for (const [propertyKey, metadata] of propertyMetadata) {
    const value = parseProperty(rootElement, propertyKey, metadata);
    if (value !== undefined) {
      (instance as any)[propertyKey] = value;
    }
  }

  return instance;
}

/**
 * Parse a single property based on its metadata (fast-xml-parser specific)
 */
function parseProperty(
  rootElement: any,
  propertyKey: string,
  metadata: any
): any {
  const { type, namespace, elementName, isArray, unwrap } = metadata;

  console.log(`🔍 Parsing property '${propertyKey}':`, {
    type,
    namespace,
    elementName,
    isArray,
    unwrap,
  });
  console.log(`🔍 METADATA_TYPES.ATTRIBUTE:`, METADATA_TYPES.ATTRIBUTE);
  console.log(
    `🔍 Type comparison:`,
    type,
    '===',
    METADATA_TYPES.ATTRIBUTE,
    '?',
    type === METADATA_TYPES.ATTRIBUTE
  );

  switch (type) {
    case METADATA_TYPES.ATTRIBUTE:
      console.log(`🔍 Calling parseAttributes for '${propertyKey}'`);
      const result = parseAttributes(rootElement, namespace, unwrap);
      console.log(`🔍 parseAttributes result for '${propertyKey}':`, result);
      return result;

    case METADATA_TYPES.ELEMENT:
      console.log(`🔍 Calling parseElement for '${propertyKey}'`);
      return parseElement(
        rootElement,
        namespace,
        elementName || propertyKey,
        isArray
      );

    default:
      console.warn(
        `Unknown metadata type: ${type} for property ${propertyKey}`
      );
      return undefined;
  }
}

/**
 * Parse attributes from root element (fast-xml-parser format: @_namespace:name)
 */
function parseAttributes(
  rootElement: any,
  namespace?: string,
  unwrap?: boolean
): any {
  const attributes: any = {};
  const prefix = namespace ? `@_${namespace.prefix}:` : '@_';

  console.log(`🔍 parseAttributes called with namespace:`, namespace);
  console.log(`🔍 Expected prefix:`, prefix);
  console.log(`🔍 rootElement keys:`, Object.keys(rootElement));

  // Extract all attributes with the namespace prefix
  for (const [key, value] of Object.entries(rootElement)) {
    console.log(`🔍 Checking key '${key}' against prefix '${prefix}'`);
    if (typeof key === 'string' && key.startsWith(prefix)) {
      const attrName = key.substring(prefix.length);
      console.log(`🔍 Found attribute: '${key}' -> '${attrName}' = ${value}`);
      attributes[attrName] = value;
    }
  }

  console.log(`🔍 Final attributes object:`, attributes);
  const result = Object.keys(attributes).length > 0 ? attributes : undefined;
  console.log(`🔍 parseAttributes returning:`, result);
  return result;
}

/**
 * Parse element(s) from root element (fast-xml-parser format)
 */
function parseElement(
  rootElement: any,
  namespace?: string,
  elementName?: string,
  isArray?: boolean
): any {
  if (!elementName) return undefined;

  const fullElementName = namespace
    ? `${namespace}:${elementName}`
    : elementName;
  const elementData = rootElement[fullElementName];

  if (!elementData) return undefined;

  if (isArray) {
    // Handle array elements
    const arrayData = Array.isArray(elementData) ? elementData : [elementData];
    return arrayData.map((item) => parseElementItem(item));
  } else {
    // Handle single element
    return parseElementItem(elementData);
  }
}

/**
 * Parse individual element item (could be object or primitive)
 */
function parseElementItem(item: any): any {
  if (typeof item === 'object' && item !== null) {
    // For complex objects, extract attributes and content
    const result: any = {};

    // Extract attributes (fast-xml-parser format: @_attrName)
    for (const [key, value] of Object.entries(item)) {
      if (typeof key === 'string' && key.startsWith('@_')) {
        const attrName = key.substring(2); // Remove @_ prefix
        result[attrName] = value;
      }
    }

    // If we have attributes, return the object, otherwise return the item as-is
    return Object.keys(result).length > 0 ? result : item;
  }

  return item;
}
