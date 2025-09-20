/**
 * ADK Decorators v2 - Spec-compliant implementation
 *
 * Goal: Generate structures identical to fast-xml-parser format
 * for direct XML rendering without transformation.
 */

// =============================================================================
// METADATA STORAGE
// =============================================================================

const metadataMap = new WeakMap<any, Map<string, any>>();

function setMetadata(target: any, key: string, value: any) {
  if (!metadataMap.has(target)) {
    metadataMap.set(target, new Map());
  }
  metadataMap.get(target)!.set(key, value);
}

function getMetadata(target: any, key: string): any {
  return metadataMap.get(target)?.get(key);
}

// Special symbol for marking object properties that should become attributes
export const $attributes = Symbol('attributes');

// =============================================================================
// CLASS DECORATORS
// =============================================================================

export interface XmlOptions {
  validateOnCreate?: boolean;
  strictMode?: boolean;
}

/**
 * @xml - Marks a class as XML-serializable
 */
export function xml(options: XmlOptions = {}) {
  return function (target: any) {
    setMetadata(target.prototype, '__xml_enabled', true);
    setMetadata(target.prototype, '__xml_options', options);
  };
}

// =============================================================================
// PROPERTY DECORATORS
// =============================================================================

/**
 * @root - Marks a property as the root element (implies @element)
 */
export function root(target: any, propertyKey: string) {
  // Validate: only one @root per class
  const existingRoot = getMetadata(target, '__xml_root');
  if (existingRoot) {
    throw new Error(
      `Multiple @root decorators found in class '${target.constructor.name}'. ` +
        `Only one @root allowed per class. Found: '${existingRoot}' and '${propertyKey}'`
    );
  }

  setMetadata(target, '__xml_root', propertyKey);
  setMetadata(
    target,
    `${propertyKey}${METADATA_KEYS.TYPE}`,
    METADATA_TYPES.ELEMENT
  ); // @root implies @element
}

/**
 * @namespace - Assigns XML namespace to element/attributes
 */
export function namespace(ns: string) {
  return function (target: any, propertyKey: string) {
    setMetadata(target, `${propertyKey}${METADATA_KEYS.NAMESPACE}`, ns);
  };
}

/**
 * @name - Overrides property name for XML element name
 */
export function name(elementName: string) {
  return function (target: any, propertyKey: string) {
    setMetadata(target, `${propertyKey}${METADATA_KEYS.NAME}`, elementName);
  };
}

/**
 * @element - Marks property as XML element (default behavior)
 */
export function element(target: any, propertyKey: string) {
  setMetadata(
    target,
    `${propertyKey}${METADATA_KEYS.TYPE}`,
    METADATA_TYPES.ELEMENT
  );
}

/**
 * @attributes - Marks property as XML attributes on parent element
 */
export function attributes(target: any, propertyKey: string) {
  const existingType = getMetadata(
    target,
    `${propertyKey}${METADATA_KEYS.TYPE}`
  );
  if (existingType === METADATA_TYPES.ELEMENT) {
    throw new Error(
      `Cannot combine @attributes with @element on property '${propertyKey}' ` +
        `in class '${target.constructor.name}'`
    );
  }
  setMetadata(
    target,
    `${propertyKey}${METADATA_KEYS.TYPE}`,
    METADATA_TYPES.ATTRIBUTES
  );
}

/**
 * @parent - Specifies parent element for this property
 */
export function parent(parentElementName: string) {
  return function (target: any, propertyKey: string) {
    setMetadata(
      target,
      `${propertyKey}${METADATA_KEYS.PARENT}`,
      parentElementName
    );
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const METADATA_TYPES = {
  ELEMENT: 'element',
  ATTRIBUTES: 'attributes',
  NAMESPACE: 'namespace',
} as const;

const METADATA_KEYS = {
  TYPE: '__type',
  NAMESPACE: '__namespace',
  NAME: '__name',
  PARENT: '__parent',
} as const;

// =============================================================================
// NAMESPACE REGISTRY
// =============================================================================

export interface Namespace {
  readonly prefix: string;
  readonly uri: string;
}

const namespaceRegistry = new Map<string, string>();

export function registerNamespace(namespace: Namespace): void;
export function registerNamespace(prefix: string, uri: string): void;
export function registerNamespace(
  namespaceOrPrefix: Namespace | string,
  uri?: string
): void {
  const prefix =
    typeof namespaceOrPrefix === 'string'
      ? namespaceOrPrefix
      : namespaceOrPrefix.prefix;
  const namespaceUri =
    typeof namespaceOrPrefix === 'string' ? uri! : namespaceOrPrefix.uri;

  // Simple conflict check
  const existing = namespaceRegistry.get(prefix);
  if (existing && existing !== namespaceUri) {
    throw new Error(
      `Namespace conflict: '${prefix}' already registered with different URI`
    );
  }
  namespaceRegistry.set(prefix, namespaceUri);
}

// =============================================================================
// SMART NAMESPACE DECORATOR FACTORY
// =============================================================================

export function createNamespace<A, E>(config: { name: string; uri: string }) {
  return function (target: any, propertyKey: string) {
    // Register the namespace
    registerNamespace(config.name, config.uri);

    // Set metadata for smart processing
    setMetadata(
      target,
      `${propertyKey}${METADATA_KEYS.NAMESPACE}`,
      config.name
    );
    setMetadata(
      target,
      `${propertyKey}${METADATA_KEYS.TYPE}`,
      METADATA_TYPES.NAMESPACE
    );
  };
}

export function getNamespaceUri(prefix: string): string {
  return namespaceRegistry.get(prefix) || '';
}

// NOTE: No default namespace registrations - this system is domain-agnostic
// Namespaces must be registered by domain-specific packages in /namespaces/ folder

// =============================================================================
// XML GENERATION - FAST-XML-PARSER FORMAT
// =============================================================================

type MetadataType = (typeof METADATA_TYPES)[keyof typeof METADATA_TYPES];

interface PropertyMetadata {
  type: MetadataType;
  namespace?: string;
  name?: string;
  parent?: string;
}

function getPropertyMetadata(
  target: any,
  propertyKey: string
): PropertyMetadata {
  // Check current prototype first, then walk up the inheritance chain
  let currentProto = target;
  let metadata: PropertyMetadata = {
    type: METADATA_TYPES.ELEMENT,
    namespace: undefined,
    name: undefined,
    parent: undefined,
  };

  while (currentProto && currentProto.constructor.name !== 'Object') {
    // Try to get metadata from current prototype level
    const type = getMetadata(
      currentProto,
      `${propertyKey}${METADATA_KEYS.TYPE}`
    );
    const namespace = getMetadata(
      currentProto,
      `${propertyKey}${METADATA_KEYS.NAMESPACE}`
    );
    const name = getMetadata(
      currentProto,
      `${propertyKey}${METADATA_KEYS.NAME}`
    );
    const parent = getMetadata(
      currentProto,
      `${propertyKey}${METADATA_KEYS.PARENT}`
    );

    // Use first found metadata (child class overrides parent)
    if (type && metadata.type === METADATA_TYPES.ELEMENT) metadata.type = type; // Allow overriding default
    if (namespace && !metadata.namespace) metadata.namespace = namespace;
    if (name && !metadata.name) metadata.name = name;
    if (parent && !metadata.parent) metadata.parent = parent;

    currentProto = Object.getPrototypeOf(currentProto);
  }

  // Default type to 'element' if not found
  if (!metadata.type) metadata.type = METADATA_TYPES.ELEMENT;

  return metadata;
}

function buildElementName(namespace?: string, name?: string): string {
  if (namespace && name) {
    return `${namespace}:${name}`;
  }
  return name || '';
}

/**
 * Convert decorated instance to fast-xml-parser format
 */
export function toXML(instance: any): any {
  const constructor = instance.constructor;
  const prototype = constructor.prototype;

  // Validate @xml decorator
  if (!getMetadata(prototype, '__xml_enabled')) {
    throw new Error(
      `Class '${constructor.name}' must have @xml decorator to use toXML()`
    );
  }

  // Find root element
  const rootProperty = getMetadata(prototype, '__xml_root');
  if (!rootProperty) {
    throw new Error(
      `Class '${constructor.name}' must have exactly one @root property`
    );
  }

  // Get root element metadata
  const rootMeta = getPropertyMetadata(prototype, rootProperty);
  const rootElementName = buildElementName(
    rootMeta.namespace,
    rootMeta.name || rootProperty
  );

  if (!rootElementName) {
    throw new Error(
      `Root element name cannot be empty for property '${rootProperty}' ` +
        `in class '${constructor.name}'`
    );
  }

  // Build XML structure in fast-xml-parser format
  const result: any = {};
  const rootContent: any = {};

  // Collect used namespaces for xmlns declarations
  const usedNamespaces = new Set<string>();
  if (rootMeta.namespace) {
    usedNamespaces.add(rootMeta.namespace);
  }

  // Process all properties
  for (const [propertyKey, value] of Object.entries(instance)) {
    if (propertyKey === rootProperty) continue; // Skip root property itself
    if (value === undefined || value === null) continue; // Skip undefined/null values

    const meta = getPropertyMetadata(prototype, propertyKey);

    // Collect namespaces
    if (meta.namespace) {
      usedNamespaces.add(meta.namespace);
    }

    // Determine target parent
    // If no @parent specified, default to root element (dynamic!)
    const targetParent = meta.parent || rootElementName;

    // Handle properties that belong to root element
    if (targetParent === rootElementName) {
      processProperty(rootContent, propertyKey, value, meta);
    }
  }

  // Add namespace declarations to root element
  for (const nsPrefix of usedNamespaces) {
    const uri = getNamespaceUri(nsPrefix);
    if (uri) {
      rootContent[`@_xmlns:${nsPrefix}`] = uri;
    }
  }

  result[rootElementName] = rootContent;
  return result;
}

/**
 * Process a single property and add it to the target container
 */
function processProperty(
  container: any,
  propertyKey: string,
  value: any,
  meta: PropertyMetadata
) {
  if (meta.type === METADATA_TYPES.ATTRIBUTES) {
    processAttributes(container, value, meta.namespace);
  } else if (meta.type === METADATA_TYPES.NAMESPACE) {
    processSmartNamespace(container, value, meta.namespace, propertyKey, meta);
  } else {
    // Pass just the element name (without namespace) to processElement
    // processElement will build the full namespaced name internally
    const elementName = meta.name || propertyKey;
    processElement(container, elementName, value, meta.namespace);
  }
}

function processSmartNamespace(
  container: any,
  value: any,
  namespace?: string,
  propertyKey?: string,
  meta?: PropertyMetadata
) {
  if (!value || typeof value !== 'object') return;

  // Handle direct property mapping (e.g., @atom link: AtomLinkType[])
  if (Array.isArray(value) && propertyKey) {
    // Use @name decorator override if available, otherwise use property key
    const elementName = meta?.name || propertyKey;

    // Direct array property - use element name (with @name override support)
    processElement(container, elementName, value, namespace);
    return;
  }

  // Handle object-based smart namespace (e.g., @atom atomData: { link: [...] })
  // Smart processing: Simple values → attributes, Complex values → elements
  // This applies to all smart namespaces created with createNamespace()
  for (const [key, val] of Object.entries(value)) {
    if (val === undefined || val === null) continue;

    if (isSimpleValue(val)) {
      // Simple values become attributes in smart namespaces
      const attrKey = namespace ? `@_${namespace}:${key}` : `@_${key}`;
      container[attrKey] = convertToString(val);
    } else {
      // Complex values (objects, arrays) become elements
      processElement(container, key, val, namespace);
    }
  }
}

/**
 * Check if a value is simple (should become an attribute)
 */
function isSimpleValue(value: any): boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  );
}

/**
 * Process attributes - convert object properties to @_namespace:key format
 */
function processAttributes(container: any, value: any, namespace?: string) {
  if (!value || typeof value !== 'object') return;

  for (const [key, attrValue] of Object.entries(value)) {
    if (attrValue === undefined || attrValue === null) continue;

    const attrKey = namespace ? `@_${namespace}:${key}` : `@_${key}`;
    container[attrKey] = convertToString(attrValue);
  }
}

/**
 * Process element - add as child element with proper namespace
 */
function processElement(
  container: any,
  elementName: string,
  value: any,
  namespace?: string
) {
  const fullElementName = namespace
    ? `${namespace}:${elementName}`
    : elementName;

  if (Array.isArray(value)) {
    // Handle arrays - create multiple elements with same name
    // Each array item becomes a separate XML element
    container[fullElementName] = value.map((item) =>
      processElementValueWithNamespace(item, namespace)
    );
  } else {
    // Handle single element
    container[fullElementName] = processElementValueWithNamespace(
      value,
      namespace
    );
  }
}

/**
 * Process element value with namespace context for attributes
 */
function processElementValueWithNamespace(value: any, namespace?: string): any {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle arrays - keep them as arrays
  if (Array.isArray(value)) {
    return value.map((item) =>
      processElementValueWithNamespace(item, namespace)
    );
  }

  if (typeof value === 'object') {
    // Check if this object has the special $attributes symbol
    if (value[$attributes]) {
      const result: any = {};

      // Convert $attributes properties to namespaced attributes
      for (const [key, attrValue] of Object.entries(value[$attributes])) {
        if (attrValue !== undefined && attrValue !== null) {
          const attrKey = namespace ? `@_${namespace}:${key}` : `@_${key}`;
          result[attrKey] = convertToString(attrValue);
        }
      }

      // Process any other properties as child elements
      for (const [key, childValue] of Object.entries(value)) {
        if (
          key !== $attributes &&
          childValue !== undefined &&
          childValue !== null
        ) {
          if (typeof childValue === 'object' && !Array.isArray(childValue)) {
            result[key] = processElementValueWithNamespace(
              childValue,
              namespace
            );
          } else {
            result[key] = processElementValueWithNamespace(
              childValue,
              namespace
            );
          }
        }
      }

      return result;
    }

    // For regular objects, convert properties to child elements
    const result: any = {};

    for (const [key, childValue] of Object.entries(value)) {
      if (childValue === undefined || childValue === null) continue;

      if (typeof childValue === 'object' && !Array.isArray(childValue)) {
        // Nested object - convert to child element
        result[key] = processElementValueWithNamespace(childValue, namespace);
      } else {
        // Primitive value or array - process recursively
        result[key] = processElementValueWithNamespace(childValue, namespace);
      }
    }

    return result;
  }

  // Primitive value
  return convertToString(value);
}

/**
 * Process element value - convert to appropriate format
 */
function processElementValue(value: any): any {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle arrays - keep them as arrays
  if (Array.isArray(value)) {
    return value.map((item) => processElementValue(item));
  }

  if (typeof value === 'object') {
    // Check if this object has the special $attributes symbol
    if (value[$attributes]) {
      const result: any = {};

      // Convert $attributes properties to attributes (without namespace prefix for now)
      // The namespace will be added by the calling context
      for (const [key, attrValue] of Object.entries(value[$attributes])) {
        if (attrValue !== undefined && attrValue !== null) {
          result[`@_${key}`] = convertToString(attrValue);
        }
      }

      // Process any other properties as child elements
      for (const [key, childValue] of Object.entries(value)) {
        if (
          key !== $attributes &&
          childValue !== undefined &&
          childValue !== null
        ) {
          if (typeof childValue === 'object' && !Array.isArray(childValue)) {
            result[key] = processElementValue(childValue);
          } else {
            result[key] = processElementValue(childValue);
          }
        }
      }

      return result;
    }

    // For regular objects, convert properties to child elements
    const result: any = {};

    for (const [key, childValue] of Object.entries(value)) {
      if (childValue === undefined || childValue === null) continue;

      if (typeof childValue === 'object' && !Array.isArray(childValue)) {
        // Nested object - convert to child element
        result[key] = processElementValue(childValue);
      } else {
        // Primitive value or array - process recursively
        result[key] = processElementValue(childValue);
      }
    }

    return result;
  }

  // Primitive value
  return convertToString(value);
}

/**
 * Convert value to string representation for XML
 */
function convertToString(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
