/**
 * Minimal decorator-based XML composition system
 * Target: Generate the exact XML structure in zif_test.intf.xml
 */

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

// Attributes modifier - marks that a property should produce attributes
export function attributes(target: any, propertyKey: string) {
  const existing = getMetadata(target, propertyKey) || {};
  setMetadata(target, propertyKey, {
    ...existing,
    type: 'attributes',
  });
}

// Generic namespace decorator with URI - defaults to elements
export function namespace(ns: string, uri: string) {
  return function (target: any, propertyKey: string) {
    const existing = getMetadata(target, propertyKey) || {};
    setMetadata(target, propertyKey, {
      type: existing.type || 'elements', // Default to elements
      namespace: ns,
      uri,
    });
  };
}

// Generic decorator system - no SAP-specific logic here!

// Generic element decorator factory
export const element =
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

  // Track root namespace from rootElement (e.g., 'intf:abapInterface' → 'intf')
  const rootNS = rootElement.includes(':') ? rootElement.split(':')[0] : null;
  if (rootNS)
    usedNamespaces.set(rootNS, 'http://www.sap.com/adt/oo/interfaces'); // Default for intf

  // Process each property - need to check both properties and getters
  const processProperty = (key: string, value: any) => {
    if (value === undefined || value === null) return;

    const meta = getMetadata(constructor.prototype, key);
    if (!meta) return;

    // Track namespace usage with URI from decorator
    if (meta.uri) {
      usedNamespaces.set(meta.namespace, meta.uri);
    }

    if (meta.type === 'attributes') {
      // Render attributes using namespace from property name (SAP ADT format)
      const rendered = renderNamespaceAsAttributes(meta.namespace, value);
      Object.assign(content, rendered);
    } else if (meta.type === 'elements') {
      // Handle child elements
      if (Array.isArray(value)) {
        // For arrays (like atom:link) - render as elements with attributes
        value.forEach((item) => {
          const elementName = `${meta.namespace}:${meta.elementName || 'link'}`;
          if (!content[elementName]) content[elementName] = [];

          // Array elements should have attributes, not child elements
          const renderedItem = renderNamespaceAsAttributes(
            meta.namespace,
            item
          );
          // Add xmlns declaration to each element if URI is provided
          if (meta.uri) {
            renderedItem[`@_xmlns:${meta.namespace}`] = meta.uri;
          }
          content[elementName].push(renderedItem);
        });
      } else {
        // Single elements - handle complex structures
        const elementName = `${meta.namespace}:${meta.elementName || key}`;
        content[elementName] = renderComplexElement(meta.namespace, value, key);
      }
    }
  };

  // Check both regular properties and getters
  for (const [key, value] of Object.entries(instance)) {
    processProperty(key, value);
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

// Handle complex nested elements - generic approach
function renderComplexElement(namespace: string, data: any, key: string): any {
  // Special case: packageRef should be rendered as element with attributes, not nested elements
  if (
    key === 'packageRef' &&
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data)
  ) {
    // Check if this looks like a simple flat object (all values are primitives)
    const allPrimitive = Object.values(data).every(
      (value) =>
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    );

    if (allPrimitive) {
      // Render as attributes of the element
      return renderNamespaceAsAttributes(namespace, data);
    }
  }

  // Handle complex nested structures (like syntaxConfiguration)
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const result: any = {};

    for (const [subKey, subValue] of Object.entries(data)) {
      if (subValue === undefined || subValue === null) continue;

      const elementName = `${namespace}:${subKey}`;

      if (
        typeof subValue === 'object' &&
        subValue !== null &&
        !Array.isArray(subValue)
      ) {
        // Handle cross-namespace objects (like parserLink which should be atom:link)
        if (subKey === 'parserLink') {
          result['atom:link'] = renderNamespaceAsAttributes('atom', subValue);
        } else {
          // Nested object - recursively handle with same namespace
          result[elementName] = renderComplexElement(
            namespace,
            subValue,
            subKey
          );
        }
      } else if (Array.isArray(subValue)) {
        // Array - handle each item
        result[elementName] = subValue.map((item) =>
          typeof item === 'object'
            ? renderNamespaceAsAttributes(namespace, item)
            : item
        );
      } else {
        // Simple value
        result[elementName] = String(subValue);
      }
    }

    return result;
  }

  // For simple objects, use attributes
  return renderNamespaceAsAttributes(namespace, data);
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
