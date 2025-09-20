# xmld Architecture

Design principles, patterns, and implementation details for **xmld**.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Core Architecture](#core-architecture)
- [Decorator System](#decorator-system)
- [Metadata Management](#metadata-management)
- [Serialization Engine](#serialization-engine)
- [Parsing Engine](#parsing-engine)
- [Type System](#type-system)
- [Performance Considerations](#performance-considerations)
- [Extension Points](#extension-points)
- [Testing Strategy](#testing-strategy)

---

## Design Philosophy

### 1. **Generic First**

**xmld** is designed to be completely domain-agnostic. It contains zero knowledge about specific XML formats, namespaces, or business domains.

```typescript
// ✅ Generic - works with any XML format
@xmlRoot('anyElement')
class AnyDocument {
  @element() anyProperty!: string;
}

// ❌ Domain-specific - hardcoded knowledge
class SAPDocument {
  // Hardcoded SAP-specific logic
}
```

**Benefits:**

- Reusable across different domains
- Easier to test and maintain
- No coupling to specific XML schemas
- Can be published as standalone library

### 2. **Class-Based Architecture**

TypeScript decorators only work on classes, not interfaces. This fundamental constraint drives the class-based design.

```typescript
// ✅ Possible - decorators work on classes
class XMLDocument {
  @element() title!: string;
}

// ❌ Impossible - decorators don't work on interfaces
interface XMLDocument {
  @element() title: string; // Syntax error
}
```

**Benefits:**

- Full decorator support
- Auto-instantiation capabilities
- Method-based APIs
- Constructor logic and validation

### 3. **Type Safety First**

Every operation should be type-safe at compile time with automatic type inference where possible.

```typescript
// Type inference automatically generates correct types
type DocumentType = ExtractXMLType<XMLDocument>;

// Compile-time validation of decorator usage
@xmlRoot('root') // ✅ Valid
@xmlRoot(123) // ❌ Compile error
class Document {}
```

### 4. **Separation of Concerns**

Clear boundaries between different responsibilities:

- **Decorators**: Metadata definition
- **Serialization**: XML generation
- **Parsing**: XML consumption
- **Types**: TypeScript utilities
- **Validation**: Runtime checking

---

## Core Architecture

### Module Structure

```
xmld/
├── src/
│   ├── core/                    # Core decorator system
│   │   ├── decorators.ts        # Decorator implementations
│   │   ├── metadata.ts          # Metadata storage/retrieval
│   │   ├── constants.ts         # Shared constants
│   │   └── types.ts             # Core type definitions
│   ├── serialization/           # XML generation
│   │   ├── serializer.ts        # Main serialization engine
│   │   ├── formatter.ts         # XML formatting utilities
│   │   ├── namespaces.ts        # Namespace management
│   │   └── types.ts             # Serialization types
│   ├── parsing/                 # XML consumption
│   │   ├── parser.ts            # Main parsing engine
│   │   ├── validator.ts         # XML validation
│   │   ├── converter.ts         # Type conversion utilities
│   │   └── types.ts             # Parsing types
│   ├── types/                   # TypeScript utilities
│   │   ├── extraction.ts        # Type extraction utilities
│   │   ├── inference.ts         # Type inference helpers
│   │   └── utilities.ts         # General type utilities
│   ├── validation/              # Runtime validation
│   │   ├── validator.ts         # Instance validation
│   │   ├── rules.ts             # Validation rules
│   │   └── types.ts             # Validation types
│   └── index.ts                 # Public API exports
```

### Dependency Graph

```
┌─────────────┐
│   Public    │
│     API     │
└─────┬───────┘
      │
┌─────▼───────┐    ┌─────────────┐    ┌─────────────┐
│Serialization│    │   Parsing   │    │ Validation  │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                   ┌─────▼───────┐
                   │    Core     │
                   │ Decorators  │
                   └─────────────┘
```

**Key Principles:**

- Core decorators have no dependencies
- Serialization and parsing depend only on core
- Public API orchestrates all modules
- No circular dependencies

---

## Decorator System

### Metadata Storage

Uses `WeakMap` for metadata storage to prevent memory leaks:

```typescript
// Global metadata storage
const classMetadata = new WeakMap<any, ClassMetadata>();
const propertyMetadata = new WeakMap<any, Map<string, PropertyMetadata>>();

// Helper functions
function setClassMetadata(target: any, metadata: ClassMetadata) {
  classMetadata.set(target, metadata);
}

function getClassMetadata(target: any): ClassMetadata | undefined {
  return classMetadata.get(target);
}

function setPropertyMetadata(
  target: any,
  propertyKey: string,
  metadata: PropertyMetadata
) {
  if (!propertyMetadata.has(target)) {
    propertyMetadata.set(target, new Map());
  }
  propertyMetadata.get(target)!.set(propertyKey, metadata);
}
```

**Benefits:**

- Automatic garbage collection
- No memory leaks
- Fast lookup performance
- Type-safe storage

### Decorator Implementation Pattern

All decorators follow a consistent pattern:

```typescript
export function decoratorName(param1?: Type1, param2?: Type2) {
  return function (target: any, propertyKey?: string) {
    // Validate parameters
    if (param1 && !isValidParam1(param1)) {
      throw new XMLDecorationError(`Invalid param1: ${param1}`);
    }

    // Get existing metadata
    const existing = getPropertyMetadata(target, propertyKey!) || {};

    // Merge with new metadata
    const metadata: PropertyMetadata = {
      ...existing,
      type: 'element', // or 'attribute', 'attributeGroup'
      name: param1,
      // ... other properties
    };

    // Store metadata
    setPropertyMetadata(target, propertyKey!, metadata);

    // Optional: Create getter/setter for auto-instantiation
    if (needsAutoInstantiation(metadata)) {
      createAutoInstantiationProperty(target, propertyKey!, metadata);
    }
  };
}
```

### Auto-Instantiation Implementation

Auto-instantiation uses getter/setter pairs:

```typescript
function createAutoInstantiationProperty(
  target: any,
  propertyKey: string,
  metadata: PropertyMetadata
) {
  const privateKey = `_${propertyKey}`;
  const Constructor = metadata.autoInstantiate!;

  Object.defineProperty(target, propertyKey, {
    get() {
      // Lazy instantiation for objects
      if (!this[privateKey] && !Array.isArray(this[privateKey])) {
        this[privateKey] = new Constructor();
      }
      return this[privateKey];
    },

    set(value: any) {
      // Auto-instantiate array items
      if (Array.isArray(value)) {
        this[privateKey] = value.map((item) =>
          item instanceof Constructor ? item : new Constructor(item)
        );
      } else {
        this[privateKey] =
          value instanceof Constructor ? value : new Constructor(value);
      }
    },

    enumerable: true,
    configurable: true,
  });
}
```

---

## Metadata Management

### Metadata Types

```typescript
interface ClassMetadata {
  xmlRoot?: string;
  namespace?: NamespaceInfo;
  parent?: ClassMetadata; // For inheritance
}

interface PropertyMetadata {
  type: 'element' | 'attribute' | 'attributeGroup';
  name?: string;
  namespace?: NamespaceInfo;
  parent?: string;
  autoInstantiate?: Constructor;
  conditional?: (instance: any) => boolean;
  required?: boolean;
  defaultValue?: any;
}

interface NamespaceInfo {
  prefix: string;
  uri: string;
}
```

### Metadata Collection

Metadata is collected from the entire prototype chain:

```typescript
function collectAllMetadata(instance: any): CollectedMetadata {
  const result: CollectedMetadata = {
    classMetadata: null,
    properties: new Map(),
  };

  let currentProto = instance.constructor.prototype;

  // Walk up the prototype chain
  while (currentProto && currentProto !== Object.prototype) {
    // Collect class metadata
    const classData = getClassMetadata(currentProto);
    if (classData && !result.classMetadata) {
      result.classMetadata = classData;
    }

    // Collect property metadata
    const propData = getPropertyMetadata(currentProto);
    if (propData) {
      for (const [key, metadata] of propData) {
        if (!result.properties.has(key)) {
          result.properties.set(key, metadata);
        }
      }
    }

    currentProto = Object.getPrototypeOf(currentProto);
  }

  return result;
}
```

---

## Serialization Engine

### Serialization Pipeline

```typescript
function toXML(instance: any, options: SerializationOptions = {}): string {
  // 1. Validate input
  validateInstance(instance);

  // 2. Collect metadata
  const metadata = collectAllMetadata(instance);

  // 3. Build namespace registry
  const namespaces = buildNamespaceRegistry(metadata);

  // 4. Process elements and attributes
  const xmlObject = processInstance(instance, metadata, namespaces);

  // 5. Generate XML string
  return formatXML(xmlObject, options, namespaces);
}
```

### Element Processing

```typescript
function processInstance(
  instance: any,
  metadata: CollectedMetadata,
  namespaces: NamespaceRegistry
): XMLObject {
  const result: XMLObject = {};

  // Process each property
  for (const [key, value] of Object.entries(instance)) {
    const propMetadata = metadata.properties.get(key);
    if (!propMetadata) continue;

    // Skip conditional elements
    if (propMetadata.conditional && !propMetadata.conditional(instance)) {
      continue;
    }

    // Process based on type
    switch (propMetadata.type) {
      case 'element':
        processElement(result, key, value, propMetadata, namespaces);
        break;
      case 'attribute':
        processAttribute(result, key, value, propMetadata, namespaces);
        break;
      case 'attributeGroup':
        processAttributeGroup(result, key, value, propMetadata, namespaces);
        break;
    }
  }

  return result;
}
```

### Namespace Management

```typescript
class NamespaceRegistry {
  private prefixToUri = new Map<string, string>();
  private uriToPrefix = new Map<string, string>();
  private usedPrefixes = new Set<string>();

  register(prefix: string, uri: string): void {
    this.prefixToUri.set(prefix, uri);
    this.uriToPrefix.set(uri, prefix);
    this.usedPrefixes.add(prefix);
  }

  getPrefix(uri: string): string | undefined {
    return this.uriToPrefix.get(uri);
  }

  getUri(prefix: string): string | undefined {
    return this.prefixToUri.get(prefix);
  }

  getAllDeclarations(): Array<{ prefix: string; uri: string }> {
    return Array.from(this.prefixToUri.entries()).map(([prefix, uri]) => ({
      prefix,
      uri,
    }));
  }
}
```

---

## Parsing Engine

### Parsing Pipeline

```typescript
function fromXML<T>(xml: string, RootClass: new () => T): T {
  // 1. Parse XML to object
  const xmlObject = parseXMLString(xml);

  // 2. Collect target class metadata
  const metadata = collectAllMetadata(new RootClass());

  // 3. Map XML to instance
  const instance = mapXMLToInstance(xmlObject, RootClass, metadata);

  // 4. Validate result
  validateInstance(instance);

  return instance;
}
```

### XML to Instance Mapping

```typescript
function mapXMLToInstance<T>(
  xmlObject: any,
  TargetClass: new () => T,
  metadata: CollectedMetadata
): T {
  const instance = new TargetClass();

  // Process each property metadata
  for (const [propertyKey, propMetadata] of metadata.properties) {
    const xmlValue = extractXMLValue(xmlObject, propMetadata);

    if (xmlValue !== undefined) {
      const convertedValue = convertValue(xmlValue, propMetadata);
      (instance as any)[propertyKey] = convertedValue;
    }
  }

  return instance;
}
```

### Type Conversion

```typescript
function convertValue(xmlValue: any, metadata: PropertyMetadata): any {
  // Handle auto-instantiation
  if (metadata.autoInstantiate) {
    if (Array.isArray(xmlValue)) {
      return xmlValue.map((item) => new metadata.autoInstantiate!(item));
    } else {
      return new metadata.autoInstantiate(xmlValue);
    }
  }

  // Handle primitive types
  if (typeof xmlValue === 'string') {
    return convertStringValue(xmlValue, metadata);
  }

  return xmlValue;
}

function convertStringValue(value: string, metadata: PropertyMetadata): any {
  // Date conversion
  if (metadata.expectedType === Date) {
    return new Date(value);
  }

  // Number conversion
  if (metadata.expectedType === Number) {
    return parseFloat(value);
  }

  // Boolean conversion
  if (metadata.expectedType === Boolean) {
    return value === 'true';
  }

  return value;
}
```

---

## Type System

### Type Extraction

```typescript
// Extract XML structure type from decorated class
type ExtractXMLType<T> = {
  [K in keyof T]: T[K] extends { __xmlMeta?: infer M }
    ? M extends { type: 'attribute' }
      ? string
      : M extends { type: 'element' }
      ? T[K]
      : T[K]
    : T[K];
};
```

### Type Inference Utilities

```typescript
// Infer property type from decorator metadata
type InferPropertyType<T, K extends keyof T> = T[K] extends {
  __xmlMeta?: { autoInstantiate: infer C };
}
  ? C extends new (...args: any[]) => infer R
    ? R
    : T[K]
  : T[K];

// Infer parsing result type
type ParsedXMLType<T> = T extends new () => infer R ? R : never;

// Extract required properties
type RequiredProperties<T> = {
  [K in keyof T]: T[K] extends { __xmlMeta?: { required: true } } ? K : never;
}[keyof T];
```

---

## Performance Considerations

### Metadata Caching

```typescript
// Cache compiled serialization functions
const serializationCache = new WeakMap<any, CompiledSerializer>();

function getOrCreateSerializer(TargetClass: any): CompiledSerializer {
  let serializer = serializationCache.get(TargetClass);

  if (!serializer) {
    serializer = compileSerializer(TargetClass);
    serializationCache.set(TargetClass, serializer);
  }

  return serializer;
}
```

### Memory Management

```typescript
// Use WeakMap to prevent memory leaks
const instanceCache = new WeakMap<any, ProcessedInstance>();

// Lazy instantiation for optional properties
function createLazyProperty(
  target: any,
  propertyKey: string,
  Constructor: any
) {
  const privateKey = Symbol(propertyKey);

  Object.defineProperty(target, propertyKey, {
    get() {
      if (!this[privateKey]) {
        this[privateKey] = new Constructor();
      }
      return this[privateKey];
    },
    configurable: true,
    enumerable: true,
  });
}
```

### Optimization Strategies

1. **Pre-compilation**: Generate serialization functions at build time
2. **Memoization**: Cache expensive computations
3. **Lazy Loading**: Defer object creation until needed
4. **Batch Processing**: Group similar operations
5. **Streaming**: Process large documents incrementally

---

## Extension Points

### Custom Decorators

```typescript
// Plugin interface for custom decorators
interface DecoratorPlugin {
  name: string;
  decoratorFactory: (...args: any[]) => PropertyDecorator;
  processor: (value: any, metadata: PropertyMetadata) => any;
}

// Registration system
const decoratorPlugins = new Map<string, DecoratorPlugin>();

function registerDecoratorPlugin(plugin: DecoratorPlugin) {
  decoratorPlugins.set(plugin.name, plugin);
}

// Usage in serialization
function processCustomDecorator(value: any, metadata: PropertyMetadata): any {
  const plugin = decoratorPlugins.get(metadata.customType!);
  return plugin ? plugin.processor(value, metadata) : value;
}
```

### Serialization Hooks

```typescript
// Hooks for custom serialization logic
interface SerializationHooks {
  beforeSerialization?: (instance: any) => any;
  afterSerialization?: (xml: string, instance: any) => string;
  elementProcessor?: (element: any, metadata: PropertyMetadata) => any;
  attributeProcessor?: (attribute: any, metadata: PropertyMetadata) => any;
}

// Apply hooks during serialization
function applySerializationHooks(
  instance: any,
  hooks: SerializationHooks
): string {
  // Pre-processing
  const processedInstance = hooks.beforeSerialization?.(instance) ?? instance;

  // Core serialization
  let xml = coreSerialize(processedInstance, hooks);

  // Post-processing
  xml = hooks.afterSerialization?.(xml, instance) ?? xml;

  return xml;
}
```

---

## Testing Strategy

### Unit Testing

```typescript
// Test decorator functionality
describe('@element decorator', () => {
  it('should mark property as element', () => {
    class TestClass {
      @element() title!: string;
    }

    const metadata = getPropertyMetadata(TestClass.prototype, 'title');
    expect(metadata?.type).toBe('element');
  });
});

// Test serialization
describe('toXML function', () => {
  it('should serialize simple class', () => {
    @xmlRoot('test')
    class TestClass {
      @element() title = 'Test Title';
    }

    const instance = new TestClass();
    const xml = toXML(instance);

    expect(xml).toContain('<test>');
    expect(xml).toContain('<title>Test Title</title>');
  });
});
```

### Integration Testing

```typescript
// Test complete workflows
describe('XML round-trip', () => {
  it('should maintain data integrity', () => {
    const original = createTestDocument();
    const xml = toXML(original);
    const parsed = fromXML(xml, TestDocument);

    expect(parsed).toEqual(original);
  });
});
```

### Performance Testing

```typescript
// Benchmark serialization performance
describe('Performance', () => {
  it('should serialize large documents efficiently', () => {
    const largeDocument = createLargeDocument(10000);

    const startTime = performance.now();
    const xml = toXML(largeDocument);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1000); // 1 second
    expect(xml.length).toBeGreaterThan(0);
  });
});
```

---

This architecture provides a solid foundation for **xmld** that is:

- **Scalable**: Can handle complex XML structures
- **Maintainable**: Clear separation of concerns
- **Extensible**: Plugin system for customization
- **Performant**: Optimized for speed and memory usage
- **Type-Safe**: Full TypeScript support throughout

The design balances flexibility with performance, providing a powerful yet easy-to-use API for XML modeling in TypeScript.
