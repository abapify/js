# xmld API Reference

Complete reference for all decorators, functions, and types in **xmld**.

## Decorators

### Class Decorators

#### `@xmld` ⭐ **Signature Decorator**

**Our signature decorator** - Marks a class as XML-enabled for auto-instantiation detection.

**Parameters:** None

**Usage:**

```typescript
@xmld
@root('item')
class Item {
  @element title!: string;
  @element description!: string;
}

// Use with explicit auto-instantiation:
@xmld
@root('feed')
class Feed {
  @element({ type: Item, array: true }) items: Item[] = [];
}
```

**Requirements:**

- Must be applied to classes that will be auto-instantiated
- Can be combined with `@root` for root elements
- Enables validation for explicit auto-instantiation

#### `@xml`

Alias for `@xmld` (backward compatibility).

**Parameters:** None

**Usage:** Same as `@xmld` - both decorators are functionally identical.

#### `@root(elementName: string)`

Defines the root XML element for a class.

**Parameters:**

- `elementName: string` - Name of the root XML element

**Usage:**

```typescript
@xmld
@root('rss')
class RSSFeed {
  @attribute version = '2.0';
  @element title!: string;
}
// Generates: <rss version="2.0"><title>...</title></rss>

@xmld
@root('soap:Envelope')
class SOAPEnvelope {
  // Will generate <soap:Envelope>...</soap:Envelope>
}
```

**Requirements:**

- Must be applied to classes that will be used as XML root
- Only one `@root` per class hierarchy
- Element name can include namespace prefix

---

#### `@namespace(prefix: string, uri: string)`

Assigns a namespace to a class or property.

**Parameters:**

- `prefix: string` - Namespace prefix (e.g., 'atom', 'soap')
- `uri: string` - Namespace URI

**Usage:**

```typescript
// Class-level namespace
@namespace('atom', 'http://www.w3.org/2005/Atom')
@xmlRoot('feed')
class AtomFeed {
  // Generates <atom:feed xmlns:atom="http://www.w3.org/2005/Atom">
}

// Property-level namespace
class Document {
  @namespace('dc', 'http://purl.org/dc/elements/1.1/')
  @element('creator')
  author!: string; // <dc:creator>...</dc:creator>
}
```

**Behavior:**

- Class-level: Applies to all elements in the class
- Property-level: Applies only to that property
- Automatically registers namespace URI for XML generation

---

### Property Decorators

#### `@element`

Explicitly marks a property as an XML element.

**Parameters:** None (basic usage) or `ElementOptions` (explicit auto-instantiation)

**Basic Usage:**

```typescript
@xmld
@root('document')
class Document {
  @element title!: string; // <title>...</title>
  @element content!: string; // <content>...</content>
}
```

**Explicit Auto-Instantiation:**

```typescript
interface ElementOptions {
  type?: Constructor;     // Explicit type for auto-instantiation
  array?: boolean;        // Whether this is an array of the specified type
  name?: string;          // Custom element name (defaults to property name)
}

@xmld @root('blog-post')
class BlogPost {
  // ✨ Explicit auto-instantiation - no surprises!
  @element({ type: Author }) author!: Author;
  @element({ type: Tag, array: true }) tags: Tag[] = [];
  @element({ type: Comment, name: 'user-comment' }) comment!: Comment;
}

  // Internal properties - NOT in XML
  private _lastModified = new Date();
  public helper = new DocumentHelper();
}
```

**Supported Types:**

- Primitives: `string`, `number`, `boolean`, `Date`
- Objects: Nested class instances (auto-instantiated if `@xml`)
- Arrays: Arrays of primitives or objects (auto-instantiated if elements are `@xml`)
- Interfaces: Used with `@unwrap` for flattening

---

#### `@attribute`

Marks a property as an XML attribute instead of element.

**Parameters:** None

**Usage:**

```typescript
@xml
@root('document')
class Document {
  @attribute id!: string; // id="..."
  @attribute version!: string; // version="..."
  @element title!: string; // <title>...</title>
}
// Generates: <document id="123" version="1.0"><title>...</title></document>
```

**Type Conversion:**

- `string`: Used as-is
- `number`: Converted to string
- `boolean`: Converted to "true"/"false"
- `Date`: Converted to ISO string
- `null`/`undefined`: Attribute omitted

---

#### `@unwrap`

Flattens object properties into parent (no wrapper element).

**Parameters:** None

**Usage:**

```typescript
interface MetaInfo {
  title: string;
  author: string;
  created: Date;
}

@xml
@root('document')
class Document {
  @unwrap @element meta!: MetaInfo; // Flattens to <title>, <author>, <created>
  @element content!: string;
}

// Usage
const doc = new Document();
doc.meta = {
  title: 'My Document',
  author: 'John Doe',
  created: new Date(),
};

// Generates:
// <document>
//   <title>My Document</title>
//   <author>John Doe</author>
//   <created>2025-09-20T...</created>
//   <content>...</content>
// </document>
```

**Attribute Groups:**
Combine `@unwrap` with `@attribute` to flatten properties as XML attributes:

```typescript
interface CommonAttrs {
  id: string;
  class: string;
  style: string;
}

@xml
@root('widget')
class Widget {
  @unwrap @attribute common!: CommonAttrs; // Flattens to id="...", class="...", style="..."
  @element label!: string;
}

// Generates: <widget id="123" class="primary" style="color:blue"><label>...</label></widget>
```

**Requirements:**

- Property must have interface or object type
- Can be combined with `@element` or `@attribute`
- Can be combined with `@namespace` for namespaced flattening

---

## Functions

### `toXML(instance: any, options?: SerializationOptions): string`

Converts a decorated class instance to XML string.

**Parameters:**

- `instance: any` - Decorated class instance
- `options?: SerializationOptions` - Serialization configuration

**Returns:** `string` - Generated XML

**Usage:**

```typescript
const feed = new RSSFeed();
feed.version = '2.0';
feed.channel.title = 'My Blog';

const xml = toXML(feed, {
  pretty: true,
  xmlDeclaration: true,
});
```

---

### `fromXML<T>(xml: string, RootClass: new () => T): T`

Parses XML string into decorated class instance.

**Parameters:**

- `xml: string` - XML string to parse
- `RootClass: new () => T` - Constructor for root class

**Returns:** `T` - Parsed class instance

**Usage:**

```typescript
const xmlString =
  '<rss version="2.0"><channel><title>My Blog</title></channel></rss>';
const feed = fromXML(xmlString, RSSFeed);

console.log(feed.version); // "2.0"
console.log(feed.channel.title); // "My Blog"
```

---

### `validate(instance: any): ValidationResult`

Validates a decorated class instance against its decorator constraints.

**Parameters:**

- `instance: any` - Decorated class instance

**Returns:** `ValidationResult` - Validation results

**Usage:**

```typescript
const feed = new RSSFeed();
const result = validate(feed);

if (!result.valid) {
  console.log('Validation errors:', result.errors);
}
```

---

## Types

### `SerializationOptions`

Configuration options for XML serialization.

```typescript
interface SerializationOptions {
  /** Format XML with indentation and line breaks */
  pretty?: boolean;

  /** Include XML declaration (<?xml version="1.0"?>) */
  xmlDeclaration?: boolean;

  /** Character encoding (default: 'UTF-8') */
  encoding?: string;

  /** Additional attributes for root element */
  rootAttributes?: Record<string, string>;

  /** Namespace declaration strategy */
  namespaceDeclarations?: 'root' | 'inline' | 'minimal';

  /** Custom indentation string (default: '  ') */
  indent?: string;

  /** Maximum line length for pretty printing */
  maxLineLength?: number;
}
```

---

### `ValidationResult`

Result of instance validation.

```typescript
interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Array of validation errors */
  errors: ValidationError[];

  /** Array of validation warnings */
  warnings: ValidationWarning[];
}

interface ValidationError {
  /** Property path where error occurred */
  path: string;

  /** Error message */
  message: string;

  /** Error code for programmatic handling */
  code: string;

  /** Expected value or type */
  expected?: any;

  /** Actual value that caused error */
  actual?: any;
}
```

---

### `PropertyMetadata`

Internal metadata structure for decorated properties.

```typescript
interface PropertyMetadata {
  /** Property type */
  type: 'element' | 'attribute' | 'attributeGroup';

  /** Custom name override */
  name?: string;

  /** Namespace information */
  namespace?: {
    prefix: string;
    uri: string;
  };

  /** Parent element path */
  parent?: string;

  /** Auto-instantiation constructor */
  autoInstantiate?: new (...args: any[]) => any;

  /** Conditional inclusion predicate */
  conditional?: (instance: any) => boolean;

  /** Whether property is required */
  required?: boolean;

  /** Default value */
  defaultValue?: any;
}
```

---

## Type Utilities

### `ExtractXMLType<T>`

Extracts the XML structure type from a decorated class.

```typescript
type ExtractXMLType<T> = {
  [K in keyof T]: T[K] extends { __xmlMeta?: infer M }
    ? M extends { type: 'attribute' }
      ? string
      : T[K]
    : T[K];
};

// Usage
class MyDocument {
  @attribute() version!: string;
  @element() title!: string;
  @element() @elementType(Item) items: Item[] = [];
}

type DocumentXMLType = ExtractXMLType<MyDocument>;
// Result: { version: string; title: string; items: Item[]; }
```

---

### `ParsedXMLType<T>`

Infers the result type of XML parsing.

```typescript
type ParsedXMLType<T> = T extends new () => infer R ? R : never;

// Usage
type FeedType = ParsedXMLType<typeof RSSFeed>; // RSSFeed
```

---

## Error Classes

### `XMLDecorationError`

Thrown when decorator usage is invalid.

```typescript
class XMLDecorationError extends Error {
  constructor(
    message: string,
    public property?: string,
    public class?: string
  );
}
```

**Common Scenarios:**

- Missing `@xmlRoot` on root class
- Invalid namespace URI
- Conflicting decorator combinations

---

### `XMLSerializationError`

Thrown during XML serialization.

```typescript
class XMLSerializationError extends Error {
  constructor(message: string, public instance?: any);
}
```

**Common Scenarios:**

- Circular object references
- Invalid property values
- Namespace conflicts

---

### `XMLParsingError`

Thrown during XML parsing.

```typescript
class XMLParsingError extends Error {
  constructor(message: string, public xml?: string, public position?: number);
}
```

**Common Scenarios:**

- Malformed XML syntax
- Missing required elements
- Type conversion failures

---

## Constants

### `METADATA_KEYS`

Internal metadata keys used by the decorator system.

```typescript
const METADATA_KEYS = {
  XML_ROOT: '__xmlRoot',
  PROPERTY_TYPE: '__xmlPropertyType',
  NAMESPACE: '__xmlNamespace',
  ELEMENT_NAME: '__xmlElementName',
  AUTO_INSTANTIATE: '__xmlAutoInstantiate',
} as const;
```

---

### `DEFAULT_OPTIONS`

Default serialization options.

```typescript
const DEFAULT_OPTIONS: SerializationOptions = {
  pretty: false,
  xmlDeclaration: false,
  encoding: 'UTF-8',
  namespaceDeclarations: 'root',
  indent: '  ',
  maxLineLength: 120,
};
```

---

This API reference covers all public interfaces and functionality provided by **xmld**. For implementation details and examples, see the [main specification](./README.md) and [examples](./examples.md).
