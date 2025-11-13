/**
 * v2 - Pure JavaScript/TypeScript XML Generator
 *
 * Schema-driven XML generation without XSLT.
 * Uses a declarative schema to map JSON → XML with namespaces and attributes.
 */

/**
 * Schema definition for XML generation
 */
export interface XmlSchema {
  [elementName: string]: ElementSchema;
}

export interface ElementSchema {
  /** Namespace prefix for this element (e.g., 'pak', 'atom') */
  $namespace?: string;

  /** Namespace declarations (xmlns) - only on root or where needed */
  $xmlns?: Record<string, string>;

  /** If true, children inherit this element's namespace unless overridden */
  $recursive?: boolean;

  /** Attribute ordering for this element */
  $order?: string[];

  /** Properties configuration */
  $properties?: {
    /** Convert properties to attributes */
    $attributes?: boolean;
    /** Namespace for attributes */
    $namespace?: string;
  };

  /** Children configuration */
  $children?: {
    /** Child element ordering */
    $order?: string[];
  };

  /** Nested element schemas */
  [childName: string]: any;
}

/**
 * Options for XML generation
 */
export interface XmlGeneratorOptions {
  /** Schema for XML structure */
  schema: XmlSchema;
  /** Pretty print with indentation */
  indent?: boolean;
  /** Indentation string (default: '   ') */
  indentString?: string;
}

/**
 * Generate XML from JSON using schema
 */
export function jsonToXmlV2(json: any, options: XmlGeneratorOptions): string {
  const { schema, indent = true, indentString = '   ' } = options;

  // Remove @metadata if present
  const data = { ...json };
  delete data['@metadata'];

  // Start generation
  const rootKey = Object.keys(data)[0];
  const rootValue = data[rootKey];
  const rootSchema = schema[rootKey];

  if (!rootSchema) {
    throw new Error(`No schema found for root element: ${rootKey}`);
  }

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += generateElement(rootKey, rootValue, rootSchema, {}, undefined, 0, indent, indentString);

  return xml;
}

/**
 * Generate a single XML element
 */
function generateElement(
  name: string,
  value: any,
  schema: ElementSchema,
  parentXmlns: Record<string, string>,
  inheritedNamespace: string | undefined,
  depth: number,
  indent: boolean,
  indentString: string
): string {
  const indentation = indent ? indentString.repeat(depth) : '';
  const newline = indent ? '\n' : '';

  // Determine element name with namespace
  // Use explicitly set namespace, or inherited namespace, or no namespace
  const ns = schema.$namespace ?? inheritedNamespace;
  const elementName = ns ? `${ns}:${name}` : name;

  // Collect xmlns declarations (merge with parent, new ones override)
  const xmlns = { ...parentXmlns, ...(schema.$xmlns || {}) };
  const xmlnsDecls = Object.entries(schema.$xmlns || {})
    .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
    .join(' ');

  // Handle arrays - generate multiple elements
  if (Array.isArray(value)) {
    return value
      .map(item => generateElement(name, item, schema, xmlns, inheritedNamespace, depth, indent, indentString))
      .join(newline);
  }

  // Handle primitives or empty objects
  if (typeof value !== 'object' || value === null) {
    return `${indentation}<${elementName}${xmlnsDecls ? ' ' + xmlnsDecls : ''}>${value || ''}</${elementName}>`;
  }

  // Separate attributes from children
  const { attributes, children } = separateAttributesAndChildren(value, schema);

  // Build attribute string
  const attrString = buildAttributes(attributes, schema.$properties, xmlns, schema.$order);

  // Build opening tag
  let xml = `${indentation}<${elementName}`;
  if (xmlnsDecls) xml += ` ${xmlnsDecls}`;
  if (attrString) xml += ` ${attrString}`;

  // If no children, self-close
  if (Object.keys(children).length === 0) {
    xml += '/>';
    return xml;
  }

  xml += '>';

  // Generate children
  const childOrder = schema.$children?.$order || Object.keys(children);
  const childElements: string[] = [];

  // Determine namespace to pass to children
  // If we have $recursive, pass our namespace
  // If we inherited a namespace and didn't override it, continue passing it down
  // If we explicitly set a namespace without $recursive, don't pass it down
  const namespaceForChildren = schema.$recursive
    ? ns  // We have $recursive, pass our namespace
    : (schema.$namespace ? undefined : inheritedNamespace);  // We set explicit namespace without $recursive, stop inheritance. Otherwise, continue inherited namespace.

  for (const childKey of childOrder) {
    if (!(childKey in children)) continue;

    const childValue = children[childKey];
    const childSchema = schema[childKey] || {};

    childElements.push(
      generateElement(childKey, childValue, childSchema, xmlns, namespaceForChildren, depth + 1, indent, indentString)
    );
  }

  if (childElements.length > 0) {
    xml += newline + childElements.join(newline) + newline + indentation;
  }

  xml += `</${elementName}>`;

  return xml;
}

/**
 * Separate object properties into attributes and children based on schema
 */
function separateAttributesAndChildren(
  obj: any,
  schema: ElementSchema
): { attributes: Record<string, any>; children: Record<string, any> } {
  const attributes: Record<string, any> = {};
  const children: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip schema control properties
    if (key.startsWith('$')) continue;

    // Check if this property should be an attribute
    const shouldBeAttribute =
      schema.$properties?.$attributes &&
      (typeof value !== 'object' || value === null || Array.isArray(value) === false);

    // Check if there's a child schema for this key
    const hasChildSchema = schema[key] !== undefined;

    if (shouldBeAttribute && !hasChildSchema) {
      attributes[key] = value;
    } else {
      children[key] = value;
    }
  }

  return { attributes, children };
}

/**
 * Build XML attributes string
 */
function buildAttributes(
  attributes: Record<string, any>,
  propsConfig: ElementSchema['$properties'],
  xmlns: Record<string, string>,
  order?: string[]
): string {
  if (Object.keys(attributes).length === 0) return '';

  const ns = propsConfig?.$namespace;

  // Sort attributes according to order if specified
  let attrKeys = Object.keys(attributes);
  if (order) {
    attrKeys = attrKeys.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      // If both in order, sort by position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only A in order, A comes first
      if (indexA !== -1) return -1;
      // If only B in order, B comes first
      if (indexB !== -1) return 1;
      // Neither in order, keep original order
      return 0;
    });
  }

  return attrKeys
    .map(key => {
      const value = attributes[key];
      const attrName = ns ? `${ns}:${key}` : key;
      return `${attrName}="${escapeXml(String(value))}"`;
    })
    .join(' ');
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
