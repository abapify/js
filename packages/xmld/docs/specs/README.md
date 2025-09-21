# xmld Technical Specification

**Version**: 2.0.0  
**Status**: Core Implementation Complete  
**Last Updated**: 2025-09-20

> **Implementation Status**: This specification describes the complete vision for xmld. The current implementation focuses on core XML modeling and serialization. Advanced features like parsing (`fromXML`) and validation are planned for future releases.

## Overview

**xmld** is a generic, type-safe TypeScript library for modeling XML structures using decorators. It provides a declarative approach to XML construction with automatic serialization, parsing, and full type safety.

## Design Principles

### 1. **Generic & Domain-Agnostic**

- Zero knowledge of specific XML formats (SAP, RSS, SOAP, etc.)
- Works with any XML structure through configuration
- No hardcoded namespace logic or domain-specific rules

### 2. **Class-Based Architecture**

- Every XML structure is modeled as a TypeScript class
- Full decorator support (impossible with interfaces)
- Auto-instantiation of nested objects
- Method-based APIs for complex operations

### 3. **Type Safety First**

- Complete TypeScript support with generics
- Automatic type inference where possible
- Compile-time validation of XML structure
- Runtime type checking for critical operations

### 4. **Separation of Concerns**

- **Core**: Generic decorator system
- **Serialization**: XML generation engine
- **Parsing**: XML parsing utilities
- **Types**: TypeScript type utilities

## Core Architecture

```
xmld/
├── src/
│   ├── core/
│   │   ├── decorators.ts      # Core decorator implementations
│   │   ├── metadata.ts        # Metadata storage and retrieval
│   │   └── constants.ts       # Shared constants and enums
│   ├── serialization/
│   │   ├── serializer.ts      # XML serialization engine
│   │   ├── formatter.ts       # XML formatting utilities
│   │   └── namespaces.ts      # Namespace management
│   ├── parsing/
│   │   ├── parser.ts          # XML parsing engine
│   │   ├── validator.ts       # XML validation utilities
│   │   └── types.ts           # Parsing type definitions
│   ├── types/
│   │   ├── decorators.ts      # Decorator type definitions
│   │   ├── serialization.ts   # Serialization types
│   │   └── utilities.ts       # Type utility functions
│   └── index.ts               # Public API exports
```

## Decorator System

### Core Decorators (5 total)

#### `@xml`

**Purpose**: Marks a class as XML-enabled for auto-instantiation detection.  
**Target**: Class  
**Parameters**: None

```typescript
@xml
class Item {
  @element title!: string;
  @element description!: string;
}

// Enables auto-instantiation when used as property type:
class Feed {
  @element items: Item[] = []; // Auto-detects Item is @xml class
}
```

#### `@root(elementName: string)`

**Purpose**: Defines the root XML element for a class.  
**Target**: Class  
**Parameters**:

- `elementName`: Name of the root XML element

```typescript
@xml
@root('rss')
class RSSFeed {
  @attribute version = '2.0';
  @element title!: string;
}
// Generates: <rss version="2.0"><title>...</title></rss>
```

#### `@element`

**Purpose**: Explicitly marks a property as an XML element (opt-in control).  
**Target**: Property  
**Parameters**: None

```typescript
@xml
class Document {
  @element title!: string; // <title>...</title>
  @element content!: string; // <content>...</content>

  // Internal properties - NOT in XML
  private _lastModified = new Date();
  public helper = new DocumentHelper();
}
```

#### `@attribute`

**Purpose**: Marks a property as an XML attribute instead of element.  
**Target**: Property  
**Parameters**: None

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

#### `@unwrap`

**Purpose**: Flattens object properties into parent (no wrapper element).  
**Target**: Property  
**Parameters**: None

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
```

#### `@namespace(prefix: string, uri: string)`

**Purpose**: Assigns a namespace to a class or property.  
**Target**: Class or Property  
**Parameters**:

- `prefix`: Namespace prefix (e.g., 'atom', 'dc')
- `uri`: Namespace URI

```typescript
@xml
@root('feed')
@namespace('atom', 'http://www.w3.org/2005/Atom')
class AtomFeed {
  @element id!: string; // <atom:id>
}

// Or property-level:
class Document {
  @namespace('dc', 'http://purl.org/dc/elements/1.1/')
  @element
  creator!: string; // <dc:creator>
}
```

### Decorator Combinations

#### **Attribute Groups**

Combine `@unwrap` with `@attribute` to flatten interface properties as XML attributes:

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

#### **Namespaced Unwrapping**

Combine `@unwrap` with `@namespace` for namespaced element flattening:

```typescript
interface AtomMeta {
  id: string;
  updated: Date;
  title: string;
}

@xml
@root('entry')
class AtomEntry {
  @unwrap
  @namespace('atom', 'http://www.w3.org/2005/Atom')
  @element
  meta!: AtomMeta; // <atom:id>, <atom:updated>, <atom:title>

  @element content!: string; // <content>
}
```

## Serialization Engine

### Core Function: `toXML(instance: any, options?: SerializationOptions): string`

**Purpose**: Converts a decorated class instance to XML string.

**Parameters**:

- `instance`: Decorated class instance
- `options`: Serialization configuration

**Options**:

```typescript
interface SerializationOptions {
  pretty?: boolean; // Format with indentation
  xmlDeclaration?: boolean; // Include <?xml version="1.0"?>
  encoding?: string; // Character encoding (default: UTF-8)
  rootAttributes?: Record<string, string>; // Additional root attributes
  namespaceDeclarations?: 'root' | 'inline' | 'minimal'; // Namespace strategy
}
```

**Example**:

```typescript
const feed = new RSSFeed();
const xml = toXML(feed, {
  pretty: true,
  xmlDeclaration: true,
  namespaceDeclarations: 'root',
});
```

### Serialization Process

1. **Metadata Collection**: Gather all decorator metadata from class hierarchy
2. **Namespace Resolution**: Collect and deduplicate namespace declarations
3. **Element Processing**: Convert properties to XML elements/attributes
4. **Auto-Instantiation**: Handle `@elementType` decorated properties
5. **Attribute Grouping**: Flatten `@attributeGroup` properties
6. **XML Generation**: Build final XML string with proper formatting

## Parsing Engine

### Core Function: `fromXML<T>(xml: string, RootClass: new () => T): T`

**Purpose**: Parses XML string into decorated class instance.

**Parameters**:

- `xml`: XML string to parse
- `RootClass`: Constructor for root class

**Example**:

```typescript
const xmlString = '<rss version="2.0">...</rss>';
const feed = fromXML(xmlString, RSSFeed);
console.log(feed.version); // "2.0"
```

### Parsing Process

1. **XML Validation**: Validate XML structure and syntax
2. **Metadata Analysis**: Analyze target class decorator metadata
3. **Element Mapping**: Map XML elements to class properties
4. **Type Conversion**: Convert XML strings to appropriate TypeScript types
5. **Auto-Instantiation**: Create nested objects using `@elementType` metadata
6. **Validation**: Validate final object against class constraints

## Type System

### Metadata Types

```typescript
interface PropertyMetadata {
  type: 'element' | 'attribute' | 'attributeGroup';
  name?: string;
  namespace?: {
    prefix: string;
    uri: string;
  };
  parent?: string;
  autoInstantiate?: new (...args: any[]) => any;
  conditional?: (instance: any) => boolean;
}

interface ClassMetadata {
  xmlRoot?: string;
  namespace?: {
    prefix: string;
    uri: string;
  };
  properties: Map<string, PropertyMetadata>;
}
```

### Type Utilities

```typescript
// Extract XML structure type from decorated class
type ExtractXMLType<T> = {
  [K in keyof T]: T[K] extends { __xmlMeta?: infer M }
    ? M extends { type: 'attribute' }
      ? string
      : T[K]
    : T[K];
};

// Infer parsing result type
type ParsedXMLType<T> = T extends new () => infer R ? R : never;
```

## Error Handling

### Error Types

```typescript
class XMLDecorationError extends Error {
  constructor(message: string, public property?: string, public class?: string) {
    super(message);
  }
}

class XMLSerializationError extends Error {
  constructor(message: string, public instance?: any) {
    super(message);
  }
}

class XMLParsingError extends Error {
  constructor(message: string, public xml?: string, public position?: number) {
    super(message);
  }
}
```

### Error Scenarios

1. **Missing `@xmlRoot`**: Class used as root without `@xmlRoot` decorator
2. **Invalid Namespace**: Malformed namespace URI or prefix
3. **Circular References**: Infinite loops in object graph
4. **Type Mismatches**: Runtime type doesn't match decorator expectations
5. **Malformed XML**: Invalid XML syntax during parsing

## Performance Considerations

### Metadata Caching

- Decorator metadata cached per class prototype
- Namespace registrations cached globally
- Serialization paths memoized for repeated operations

### Memory Management

- WeakMap used for metadata storage to prevent memory leaks
- Lazy instantiation of optional nested objects
- Streaming serialization for large documents

### Optimization Strategies

- Pre-compile serialization functions for known types
- Batch namespace declarations
- Minimize object creation during serialization

## Extension Points

### Custom Decorators

```typescript
function customElement(config: CustomConfig) {
  return function (target: any, propertyKey: string) {
    // Custom decorator implementation
    setMetadata(target, propertyKey, {
      type: 'element',
      custom: config,
    });
  };
}
```

### Serialization Plugins

```typescript
interface SerializationPlugin {
  name: string;
  process(element: any, metadata: PropertyMetadata): any;
}

registerPlugin(new CustomSerializationPlugin());
```

### Type Validators

```typescript
interface TypeValidator<T> {
  validate(value: any): value is T;
  convert(value: any): T;
}

registerValidator('date', new DateValidator());
```

## Testing Strategy

### Unit Tests

- Individual decorator functionality
- Metadata storage and retrieval
- Type conversion utilities
- Error handling scenarios

### Integration Tests

- Complete serialization workflows
- Round-trip parsing and serialization
- Complex nested structures
- Namespace handling

### Performance Tests

- Large document serialization
- Memory usage patterns
- Concurrent operations
- Cache effectiveness

## Migration Guide

### From Manual XML Building

```typescript
// Before: Manual XML construction
const xml = `<rss version="2.0">
  <channel>
    <title>${title}</title>
    <description>${description}</description>
  </channel>
</rss>`;

// After: Declarative with xmld
@xmlRoot('rss')
class RSSFeed {
  @attribute() version = '2.0';
  @element() @elementType(Channel) channel!: Channel;
}
```

### From Other XML Libraries

- **fast-xml-parser**: Replace manual object construction with decorated classes
- **xml2js**: Use `@elementType` for automatic object instantiation
- **xmlbuilder**: Replace imperative building with declarative classes

## Future Enhancements

### Planned Features

- **Schema Validation**: XSD schema integration
- **Streaming Support**: Large document streaming
- **Performance Optimizations**: Compiled serializers
- **IDE Integration**: Better TypeScript tooling

### Experimental Features

- **Template Literals**: XML template string support
- **React Integration**: JSX-like XML construction
- **GraphQL Integration**: Schema-driven XML generation

---

This specification serves as the authoritative guide for **xmld** implementation and usage. All code should conform to these patterns and principles.
