/**
 * XML serialization engine with plugin support
 * Zero dependencies - plugins handle actual XML generation
 */

import { METADATA_TYPES, ERROR_MESSAGES } from '../core/constants';
import {
  getClassMetadata,
  getAllPropertyMetadata,
  type PropertyMetadata,
  type NamespaceInfo,
} from '../core/metadata';

// Serialization interfaces
export interface SerializationPlugin {
  serialize(data: SerializationData): string;
}

export interface SerializationData {
  rootElement: string;
  namespaces: Map<string, string>;
  attributes: Record<string, any>;
  elements: Record<string, any>;
}

export interface SerializationOptions {
  plugin?: SerializationPlugin;
  pretty?: boolean;
  encoding?: string;
}

/**
 * Main serialization function
 * Converts decorated class instances to XML using plugins
 */
export function toXML(
  instance: any,
  options: SerializationOptions = {}
): string {
  if (!instance || typeof instance !== 'object') {
    throw new Error('Instance must be an object');
  }

  const classMetadata = getClassMetadata(instance.constructor.prototype);
  if (!classMetadata?.xmlRoot) {
    throw new Error(ERROR_MESSAGES.MISSING_XML_ROOT);
  }

  // Extract serialization data from decorated instance
  const data = extractSerializationData(instance);

  // Use plugin to generate XML, or fallback to basic serialization
  if (options.plugin) {
    return options.plugin.serialize(data);
  } else {
    return basicSerialize(data, options);
  }
}

/**
 * Extract serialization data without generating XML
 * Returns the raw SerializationData for use with external libraries
 */
export function toSerializationData(instance: any): SerializationData {
  if (!instance || typeof instance !== 'object') {
    throw new Error('Instance must be an object');
  }

  const classMetadata = getClassMetadata(instance.constructor.prototype);
  if (!classMetadata?.xmlRoot) {
    throw new Error(ERROR_MESSAGES.MISSING_XML_ROOT);
  }

  return extractSerializationData(instance);
}

/**
 * Extract serialization data from decorated instance
 */
function extractSerializationData(instance: any): SerializationData {
  const constructor = instance.constructor;
  const classMetadata = getClassMetadata(constructor.prototype);
  const propertyMetadata = getAllPropertyMetadata(constructor.prototype);

  const data: SerializationData = {
    rootElement: classMetadata!.xmlRoot!,
    namespaces: new Map(),
    attributes: {},
    elements: {},
  };

  // Add class-level namespace
  if (classMetadata?.namespace) {
    data.namespaces.set(
      classMetadata.namespace.prefix,
      classMetadata.namespace.uri
    );
  }

  // Collect namespaces from all levels of inheritance
  collectInheritedNamespaces(constructor.prototype, data.namespaces);

  // Process each decorated property
  for (const [propertyKey, metadata] of propertyMetadata) {
    const value = instance[propertyKey];
    if (value === undefined || value === null) continue;

    processProperty(
      propertyKey,
      value,
      metadata,
      data,
      classMetadata?.namespace
    );
  }

  return data;
}

/**
 * Collect namespaces from all levels of inheritance
 */
function collectInheritedNamespaces(
  target: any,
  namespaces: Map<string, string>
): void {
  let currentPrototype = target;
  while (currentPrototype && currentPrototype !== Object.prototype) {
    const classMetadata = getClassMetadata(currentPrototype);
    if (classMetadata?.namespace) {
      namespaces.set(
        classMetadata.namespace.prefix,
        classMetadata.namespace.uri
      );
    }

    // Also collect namespaces from property metadata
    const propertyMetadata = getAllPropertyMetadata(currentPrototype);
    for (const [, metadata] of propertyMetadata) {
      if (metadata.namespace) {
        namespaces.set(metadata.namespace.prefix, metadata.namespace.uri);
      }
    }

    currentPrototype = Object.getPrototypeOf(currentPrototype);
  }
}

/**
 * Process a single property based on its metadata
 */
function processProperty(
  propertyKey: string,
  value: any,
  metadata: PropertyMetadata,
  data: SerializationData,
  classNamespace?: NamespaceInfo
): void {
  // Add property-level namespace
  if (metadata.namespace) {
    data.namespaces.set(metadata.namespace.prefix, metadata.namespace.uri);
  }

  // Use property namespace or fall back to class namespace
  const effectiveNamespace = metadata.namespace || classNamespace;
  const elementName = getElementName(propertyKey, metadata, effectiveNamespace);

  if (metadata.unwrap) {
    // Unwrap: flatten object properties into parent
    processUnwrappedProperty(value, metadata, data, effectiveNamespace);
  } else if (metadata.type === METADATA_TYPES.ATTRIBUTE) {
    // Attribute
    data.attributes[elementName] = serializeValue(value);
  } else {
    // Element (default)
    // Special handling for auto-instantiation metadata (arrays and single objects)
    if (
      metadata.autoInstantiate &&
      ((Array.isArray(value) && value.length > 0) ||
        (!Array.isArray(value) && value && typeof value === 'object'))
    ) {
      const constructor = metadata.autoInstantiate;
      const classMetadata = getClassMetadata(constructor.prototype);

      if (classMetadata?.isXMLClass) {
        if (Array.isArray(value)) {
          // For arrays of objects that should be XML classes, each item should generate
          // its own element using the target class's root element name
          value.forEach((item) => {
            // Create a temporary instance to get the correct serialization structure
            const tempInstance = new constructor();
            // Copy properties from the plain object to the instance
            Object.assign(tempInstance, item);
            const itemData = extractSerializationData(tempInstance);

            // Add each item's namespaces to the parent
            itemData.namespaces.forEach((uri, prefix) => {
              data.namespaces.set(prefix, uri);
            });

            // Use the item's root element name, not the property name
            if (data.elements[itemData.rootElement]) {
              // If element already exists, make it an array
              if (!Array.isArray(data.elements[itemData.rootElement])) {
                data.elements[itemData.rootElement] = [
                  data.elements[itemData.rootElement],
                ];
              }
              (data.elements[itemData.rootElement] as any[]).push(itemData);
            } else {
              data.elements[itemData.rootElement] = itemData;
            }
          });
        } else {
          // For single objects that should be XML classes
          const tempInstance = new constructor();
          // Copy properties from the plain object to the instance
          Object.assign(tempInstance, value);
          const itemData = extractSerializationData(tempInstance);

          // Add namespaces to the parent
          itemData.namespaces.forEach((uri, prefix) => {
            data.namespaces.set(prefix, uri);
          });

          // Use the item's root element name, not the property name
          data.elements[itemData.rootElement] = itemData;
        }
        return; // Skip the default processing
      }
    }

    data.elements[elementName] = processElementValue(value);
  }
}

/**
 * Process unwrapped property (flattening)
 */
function processUnwrappedProperty(
  value: any,
  metadata: PropertyMetadata,
  data: SerializationData,
  effectiveNamespace?: NamespaceInfo
): void {
  if (!value || typeof value !== 'object') return;

  // Flatten object properties
  for (const [key, val] of Object.entries(value)) {
    if (val === undefined || val === null) continue;

    // For unwrapped properties, use the namespace from the unwrap property
    const elementName = applyNamespace(key, effectiveNamespace);

    if (metadata.type === METADATA_TYPES.ATTRIBUTE) {
      data.attributes[elementName] = serializeValue(val);
    } else {
      data.elements[elementName] = processElementValue(val);
    }
  }
}

/**
 * Process element value (handles arrays and nested objects)
 */
function processElementValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => processElementValue(item));
  } else if (value instanceof Date) {
    // Handle Date objects as primitives, not as generic objects
    return serializeValue(value);
  } else if (value && typeof value === 'object') {
    // Check if it's a decorated XML class
    const classMetadata = getClassMetadata(value.constructor.prototype);
    if (classMetadata?.isXMLClass) {
      // Recursively serialize nested XML object
      return extractSerializationData(value);
    } else {
      // Plain object - return as-is for further processing
      return value;
    }
  } else {
    return serializeValue(value);
  }
}

/**
 * Serialize primitive values
 */
function serializeValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  } else if (value instanceof Date) {
    return value.toISOString();
  } else if (typeof value === 'boolean') {
    return value.toString();
  } else if (typeof value === 'number') {
    return value.toString();
  } else {
    return String(value);
  }
}

/**
 * Get element name with namespace prefix
 */
function getElementName(
  propertyKey: string,
  metadata: PropertyMetadata,
  effectiveNamespace?: NamespaceInfo
): string {
  const name = metadata.name || propertyKey;
  return applyNamespace(name, effectiveNamespace);
}

/**
 * Apply namespace prefix to element name
 */
function applyNamespace(name: string, namespace?: NamespaceInfo): string {
  if (namespace) {
    return `${namespace.prefix}:${name}`;
  }
  return name;
}

/**
 * Basic XML serialization (fallback when no plugin provided)
 * This is a simple implementation - plugins should be used for production
 */
function basicSerialize(
  data: SerializationData,
  options: SerializationOptions
): string {
  const { rootElement, namespaces, attributes, elements } = data;

  // Build namespace declarations
  const nsDeclarations = Array.from(namespaces.entries())
    .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
    .join(' ');

  // Build attributes
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  // Combine namespace declarations and attributes
  const allAttrs = [nsDeclarations, attrString].filter(Boolean).join(' ');
  const attrsPart = allAttrs ? ` ${allAttrs}` : '';

  // Build elements
  const elementsString = Object.entries(elements)
    .map(([key, value]) => serializeElement(key, value))
    .join('');

  // Build final XML
  if (elementsString) {
    return `<${rootElement}${attrsPart}>${elementsString}</${rootElement}>`;
  } else {
    return `<${rootElement}${attrsPart}/>`;
  }
}

/**
 * Serialize a single element (recursive)
 */
function serializeElement(name: string, value: any): string {
  if (Array.isArray(value)) {
    return value.map((item) => serializeElement(name, item)).join('');
  } else if (value && typeof value === 'object' && value.rootElement) {
    // Nested serialization data from processElementValue
    return basicSerialize(value, {});
  } else if (value && typeof value === 'object') {
    // Check if it's a decorated XML class that wasn't processed yet
    const classMetadata = getClassMetadata(value.constructor.prototype);
    if (classMetadata?.isXMLClass) {
      try {
        const nestedData = extractSerializationData(value);
        const nestedXml = basicSerialize(nestedData, {});
        // Remove the root element wrapper and return just the content
        const match = nestedXml.match(/<[^>]+>(.*)<\/[^>]+>$/s);
        return match
          ? `<${name}>${match[1]}</${name}>`
          : `<${name}>${String(value)}</${name}>`;
      } catch {
        return `<${name}>${String(value)}</${name}>`;
      }
    } else {
      // Plain object - serialize properties as nested elements
      const nestedElements = Object.entries(value)
        .map(([key, val]) => `<${key}>${serializeValue(val)}</${key}>`)
        .join('');
      return `<${name}>${nestedElements}</${name}>`;
    }
  } else {
    const content = serializeValue(value);
    return `<${name}>${content}</${name}>`;
  }
}
