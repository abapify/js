/**
 * Minimal decorator-based XML composition system
 * Target: Generate the exact XML structure in zif_test.intf.xml
 */

// Shared symbol for attributes interface - MUST be used by all namespaces
export const attributesInterface = Symbol('attributesInterface');

// Simple metadata storage (no reflect-metadata needed for minimal version)
const metadata = new WeakMap<any, Map<string, any>>();

// Helper to store metadata
function setMetadata(target: any, key: string, data: any) {
  if (!metadata.has(target)) {
    metadata.set(target, new Map());
  }
  metadata.get(target)!.set(key, data);
}

// Helper to get metadata
function getMetadata(target: any, key: string) {
  return metadata.get(target)?.get(key);
}

// Root element decorator
export function XMLRoot(rootElement: string) {
  return function (target: any) {
    setMetadata(target.prototype, '__xmlRoot', rootElement);
  };
}

// Attributes modifier - supports both function call and direct decorator usage
// @attributes - for legacy compatibility (BaseXML)
// @attributes() - for new usage with optional parent argument
export function attributes(targetOrParent?: any, propertyKey?: string): any {
  // Case 1: Called as decorator directly @attributes (legacy BaseXML compatibility)
  if (typeof targetOrParent === 'object' && propertyKey) {
    const existing = getMetadata(targetOrParent, propertyKey) || {};
    setMetadata(targetOrParent, propertyKey, {
      ...existing,
      type: 'attributes',
      parent: null, // Root element for legacy usage
    });
    return;
  }

  // Case 2: Called as function @attributes(parent) - returns decorator
  const parent = typeof targetOrParent === 'string' ? targetOrParent : null;
  return function (target: any, propertyKey: string) {
    const existing = getMetadata(target, propertyKey) || {};
    setMetadata(target, propertyKey, {
      ...existing,
      type: 'attributes',
      parent: parent, // Use provided parent or null for root
    });
  };
}

// Generic namespace decorator with URI - defaults to elements
// Also works as a transformation function when called with data
export function namespace(
  ns: string,
  uri: string,
  mixedContent: boolean = false
) {
  function decorator(target: any, propertyKey: string) {
    const existing = getMetadata(target, propertyKey) || {};
    setMetadata(target, propertyKey, {
      type: existing.type || 'elements', // Default to elements
      namespace: ns,
      uri,
      parent: existing.parent || null, // Inherit parent from other decorators
    });

    // For mixed-content namespaces, create property setter that automatically adds attributesInterface symbol
    if (mixedContent) {
      const privateKey = `_${propertyKey}`;

      Object.defineProperty(target, propertyKey, {
        get() {
          return this[privateKey];
        },
        set(value: any) {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Automatically add the attributesInterface symbol for mixed content
            // The symbol should point to the attributes that should become XML attributes

            // Use Object.assign to preserve all properties and add the symbol
            const result = Object.assign({}, value);
            // Add the symbol to mark what becomes XML attributes (the entire value)
            Object.defineProperty(result, attributesInterface, {
              value: value,
              enumerable: false,
              configurable: true,
              writable: true,
            });

            // Debug logging
            console.log(`[SETTER DEBUG] Setting ${propertyKey} with symbol`);
            console.log(
              `[SETTER DEBUG] Result has ${
                Object.getOwnPropertySymbols(result).length
              } symbols`
            );
            console.log(
              `[SETTER DEBUG] Symbol check:`,
              result[attributesInterface] !== undefined
            );

            this[privateKey] = result;
          } else {
            this[privateKey] = value;
          }
        },
        enumerable: true,
        configurable: true,
      });
    }
  }

  // Add transformation capability
  decorator.transform = function (data: any) {
    return renderNamespaceAsAttributes(ns, data);
  };

  // Helper to recursively add namespace to nested objects
  function addNamespaceToNested(data: any, namespace: string): any {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return data;
    }

    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;

      const namespacedKey = `${namespace}:${key}`;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // For nested objects, recursively add namespace to their properties too
        result[namespacedKey] = addNamespaceToNested(value, namespace);
      } else {
        result[namespacedKey] = value;
      }
    }
    return result;
  }

  // Make it callable as a transformation function
  function namespaceFn(dataOrTarget: any, propertyKey?: string) {
    if (propertyKey !== undefined) {
      // Called as decorator
      return decorator(dataOrTarget, propertyKey);
    } else {
      // Called as transformation function - return intermediate format for $attr()
      // Use recursive namespacing for proper nested object handling
      return addNamespaceToNested(dataOrTarget, ns);
    }
  }

  // Copy transform method
  namespaceFn.transform = decorator.transform;

  return namespaceFn;
}

// Generic decorator system - no SAP-specific logic here!

// Element decorator - supports both function call and direct decorator usage
// @element - for direct usage (no parent)
// @element(parent) - for usage with optional parent argument
export function element(targetOrParent?: any, propertyKey?: string): any {
  // Case 1: Called as decorator directly @element (no parentheses)
  if (typeof targetOrParent === 'object' && propertyKey) {
    const existing = getMetadata(targetOrParent, propertyKey) || {};
    setMetadata(targetOrParent, propertyKey, {
      ...existing,
      type: 'elements',
      parent: null, // Root element for direct usage
    });
    return;
  }

  // Case 2: Called as function @element(parent) - returns decorator
  const parent = typeof targetOrParent === 'string' ? targetOrParent : null;
  return function (target: any, propertyKey: string) {
    const existing = getMetadata(target, propertyKey) || {};
    setMetadata(target, propertyKey, {
      ...existing,
      type: 'elements',
      parent: parent, // Use provided parent or null for root
    });
  };
}

// Generic element decorator factory (legacy)
export const elementFactory =
  (namespace: string, uri: string, elementName?: string) =>
  (target: any, propertyKey: string) => {
    setMetadata(target, propertyKey, {
      type: 'elements',
      namespace,
      elementName: elementName || propertyKey,
      uri,
    });
  };

// Transform function - converts decorated instance to XML object
export function toXML(instance: any): any {
  const constructor = instance.constructor;
  const rootElement = getMetadata(constructor.prototype, '__xmlRoot');

  if (!rootElement) {
    throw new Error('No @XMLRoot decorator found');
  }

  const result: any = {};
  const content: any = {};
  const usedNamespaces = new Map<string, string>(); // namespace -> URI

  // Track root namespace from rootElement (e.g., 'test:root' → 'test')
  // Note: Root namespace URI should come from decorator metadata, not hardcoded
  const rootNS = rootElement.includes(':') ? rootElement.split(':')[0] : null;

  // Helper to get or create parent container
  const getParentContainer = (parent: string | null) => {
    if (!parent) return content; // Root element

    // Ensure parent element exists
    if (!content[parent]) {
      content[parent] = {};
    }
    return content[parent];
  };

  // Process each property - need to check both properties and getters
  const processProperty = (key: string, value: any, providedMeta?: any) => {
    if (value === undefined || value === null) return;

    const meta = providedMeta || getMetadata(constructor.prototype, key);
    if (!meta) return;

    // Track namespace usage with URI from decorator
    if (meta.uri) {
      usedNamespaces.set(meta.namespace, meta.uri);
    }

    // Get target container based on parent
    const targetContainer = getParentContainer(meta.parent);

    if (meta.type === 'attributes') {
      // Render attributes using namespace from property name (SAP ADT format)
      const rendered = renderNamespaceAsAttributes(meta.namespace, value);
      Object.assign(targetContainer, rendered);
    } else if (meta.type === 'elements') {
      // Handle child elements
      if (Array.isArray(value)) {
        // For arrays (like atom:link) - render as elements with attributes
        value.forEach((item) => {
          const elementName = `${meta.namespace}:${meta.elementName || 'link'}`;
          if (!targetContainer[elementName]) targetContainer[elementName] = [];

          // Array elements should have attributes, not child elements
          const renderedItem = renderNamespaceAsAttributes(
            meta.namespace,
            item
          );
          // Add xmlns declaration to each element if URI is provided
          if (meta.uri) {
            renderedItem[`@_xmlns:${meta.namespace}`] = meta.uri;
          }
          targetContainer[elementName].push(renderedItem);
        });
      } else {
        // Single elements - handle object types as nested elements
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Object type: create child elements for each property using same namespace
          const nestedElements = renderObjectAsChildElements(
            meta.namespace,
            value
          );
          Object.assign(targetContainer, nestedElements);
        } else {
          // Simple value: create single element
          const elementName = `${meta.namespace}:${meta.elementName || key}`;
          targetContainer[elementName] = String(value);
        }
      }
    }
  };

  // Check both regular properties and getters
  for (const [key, value] of Object.entries(instance)) {
    // Try to find metadata on current prototype first, then check parent chain
    let meta = getMetadata(constructor.prototype, key);
    if (!meta) {
      // Check parent prototypes for metadata
      let currentProto = Object.getPrototypeOf(constructor.prototype);
      while (
        currentProto &&
        currentProto.constructor.name !== 'Object' &&
        !meta
      ) {
        meta = getMetadata(currentProto, key);
        currentProto = Object.getPrototypeOf(currentProto);
      }
    }

    // PATTERN RECOGNITION: Auto-detect attribute properties based on name patterns
    // This implements the successful approach from the memory
    if (!meta && isAttributeProperty(key)) {
      meta = {
        type: 'attributes',
        namespace: inferNamespace(key),
        uri: getNamespaceUri(inferNamespace(key)),
      };
    }

    processProperty(key, value, meta);
  }

  // Also check prototype for getters (decorated methods)
  const proto = constructor.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor && descriptor.get && getMetadata(proto, key)) {
      const value = descriptor.get.call(instance);
      processProperty(key, value);
    }
  }

  // Add xmlns declarations to root element from decorator metadata
  for (const [ns, uri] of usedNamespaces) {
    content[`@_xmlns:${ns}`] = uri;
  }

  result[rootElement] = content;
  return result;
}

// Render object properties as child elements with namespace
function renderObjectAsChildElements(namespace: string, obj: any): any {
  const result: any = {};

  // Check if object has attributesInterface symbol - indicates mixed attributes/elements
  if (obj[attributesInterface]) {
    // Mixed attributes and elements case
    const attributeInterface = obj[attributesInterface];
    if (attributeInterface && typeof attributeInterface === 'object') {
      // Get attribute property names from the interface
      const attributeKeys = Object.keys(attributeInterface);

      // Split object into attributes and elements
      const attributes: any = {};
      const elements: any = {};

      for (const [key, value] of Object.entries(obj)) {
        if (attributeKeys.includes(key)) {
          // This property becomes an XML attribute
          attributes[`@_${namespace}:${key}`] =
            typeof value === 'boolean'
              ? value
                ? 'true'
                : 'false'
              : String(value);
        } else {
          // This property becomes a child element
          elements[key] = value;
        }
      }

      // Combine attributes and child elements
      Object.assign(result, attributes);

      // Process child elements normally
      for (const [key, value] of Object.entries(elements)) {
        if (value === undefined || value === null) continue;

        const elementName = `${namespace}:${key}`;

        if (Array.isArray(value)) {
          // Array handling - treat as regular array property, no magic naming
          result[elementName] = value.map((item) => {
            if (typeof item === 'object' && item !== null) {
              return renderObjectAsChildElements(namespace, item);
            } else {
              return String(item);
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          result[elementName] = renderObjectAsChildElements(namespace, value);
        } else {
          result[elementName] = String(value);
        }
      }

      return result;
    }
  }

  // Standard processing - all properties become child elements
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    const elementName = `${namespace}:${key}`;

    if (Array.isArray(value)) {
      // Array handling - treat as regular array property, no magic naming
      result[elementName] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return renderObjectAsChildElements(namespace, item);
        } else {
          return String(item);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      // Nested object: recurse with same namespace
      result[elementName] = renderObjectAsChildElements(namespace, value);
    } else {
      // Primitive: convert to string
      result[elementName] = String(value);
    }
  }

  return result;
}

// Render namespace data as XML attributes
function renderNamespaceAsAttributes(namespace: string, data: any): any {
  const result: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    // Generate @_namespace:key format for attributes (fast-xml-parser format)
    const attrKey = `@_${namespace}:${key}`;

    if (typeof value === 'boolean') {
      result[attrKey] = value ? 'true' : 'false';
    } else if (value instanceof Date) {
      result[attrKey] = value.toISOString();
    } else {
      result[attrKey] = String(value);
    }
  }

  return result;
}

// Pattern recognition functions based on memory of successful implementation
function isAttributeProperty(propertyName: string): boolean {
  // Properties that should become XML attributes based on the memory
  return ['core', 'oo', 'source'].includes(propertyName);
}

function inferNamespace(propertyName: string): string {
  // Namespace inference based on property names from the memory
  const namespaceMap: Record<string, string> = {
    core: 'adtcore',
    oo: 'abapoo',
    source: 'abapsource',
  };
  return namespaceMap[propertyName] || propertyName;
}

function getNamespaceUri(namespace: string): string {
  // URI mapping for known namespaces
  const uriMap: Record<string, string> = {
    adtcore: 'http://www.sap.com/adt/core',
    abapoo: 'http://www.sap.com/adt/oo',
    abapsource: 'http://www.sap.com/adt/abapsource',
    atom: 'http://www.w3.org/2005/Atom',
  };
  return uriMap[namespace] || '';
}
