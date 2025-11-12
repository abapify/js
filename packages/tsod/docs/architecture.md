# Architecture

## Design Philosophy

tsod is built on three core principles:

1. **Generic** - No hardcoded domain logic (XML, JSON, etc.)
2. **Bidirectional** - Single schema for both transform directions
3. **Minimal** - Focused, lightweight, zero dependencies

## Internal Rules Architecture

Following the pattern established by `xmld`, tsod uses a modular, extensible architecture.

### Core Layers

```
┌─────────────────────────────────────┐
│         Public API (index.ts)        │
│   Transformer, transform(), etc.     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Transformation Engine             │
│      (transformer.ts)                │
│  - Rule application                  │
│  - Direction handling                │
│  - Context management                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Path Resolution                 │
│    (core/path-resolver.ts)           │
│  - getValue()                        │
│  - setValue()                        │
│  - parsePath()                       │
└──────────────────────────────────────┘
```

### Extension Points

tsod is designed to be extended through several mechanisms:

#### 1. Custom Transform Functions

```typescript
const schema = {
  rules: [
    {
      from: 'data',
      to: 'result',
      transform: (value, context) => {
        // Custom transformation logic
        // Access context.direction, context.path, etc.
        return transformedValue;
      },
      reverse: (value, context) => {
        // Reverse transformation
        return originalValue;
      }
    }
  ]
};
```

#### 2. Schema Initialization

```typescript
const schema = {
  init: (direction) => {
    // Initialize target object
    // Can be direction-specific
    return direction === 'forward'
      ? { metadata: { version: '1.0' } }
      : {};
  },
  rules: [...]
};
```

#### 3. Transformer Options

```typescript
const transformer = new Transformer(schema, {
  skipUndefined: true,
  skipNull: false,
  strict: false,
  pathSeparator: '.',
  arrayMarker: '[]'
});
```

### Potential Plugin System

For future extensibility, tsod could support plugins similar to xmld:

```typescript
// Proposed plugin interface
interface TransformPlugin {
  name: string;
  beforeTransform?: (source: unknown, context: TransformContext) => unknown;
  afterTransform?: (result: unknown, context: TransformContext) => unknown;
  customResolvers?: Record<string, PathResolver>;
}

// Usage
const transformer = new Transformer(schema, {
  plugins: [
    xmlNamespacePlugin,
    validationPlugin,
    loggingPlugin
  ]
});
```

### Rule Processing Pipeline

```
1. Schema Initialization
   ├─ Call init() if provided
   └─ Create target object

2. Rule Iteration
   ├─ For each rule:
   │  ├─ Resolve source path
   │  ├─ Check skip conditions (undefined, null)
   │  ├─ Detect array/nested rules
   │  ├─ Apply transformation function
   │  └─ Set value in target

3. Nested Processing
   ├─ Detect nested rules
   ├─ Recursively apply rules
   └─ Merge results

4. Array Processing
   ├─ Detect array marker
   ├─ Map over items
   ├─ Apply item transformations
   └─ Return transformed array
```

### Path Resolution Strategy

Path resolution is kept simple and generic:

```
user.name          → ['user', 'name']
data.items[]       → ['data', 'items']  (array marker removed)
a.b.c.d            → ['a', 'b', 'c', 'd']
@_xmlns:pak        → ['@_xmlns:pak']     (treated as single key)
```

This allows for arbitrary key names including special characters used by XML libraries (e.g., `@_`, namespaces with `:`)

### Type Safety

tsod uses TypeScript's type system extensively:

```typescript
// All types are readonly to prevent accidental mutation
interface TransformRule {
  readonly from: string;
  readonly to: string;
  readonly transform?: TransformFn;
  readonly reverse?: TransformFn;
  readonly rules?: readonly TransformRule[];
}

// Context preserves full type information
interface TransformContext {
  readonly direction: 'forward' | 'reverse';
  readonly path: readonly string[];
  readonly parent?: unknown;
  readonly root: unknown;
}
```

### Performance Considerations

1. **No JSON serialization** - Direct object manipulation
2. **Minimal allocations** - Reuse context objects where possible
3. **Early returns** - Skip processing when appropriate
4. **No regex** - Simple string operations

### Comparison with xmld

| Aspect | xmld | tsod |
|--------|------|------|
| **Domain** | XML modeling | Generic objects |
| **Approach** | Decorator-based | Schema-based |
| **Metadata** | Reflection API | Plain objects |
| **Direction** | One-way (to XML) | Bidirectional |
| **Dependencies** | reflect-metadata | Zero |
| **Use Case** | XML generation | Any transformation |

Both follow similar architectural principles:
- Modular, layered design
- Clear separation of concerns
- Extensible through plugins/customization
- Type-safe APIs

### Future Enhancements

Potential areas for extension:

1. **Validation Plugin** - Validate during transformation
2. **Logging Plugin** - Track transformation steps
3. **Caching** - Memoize transformations for performance
4. **Schema Composition** - Merge multiple schemas
5. **Path Expressions** - JSONPath or XPath support
6. **Streaming** - Transform large datasets incrementally
7. **Type Generation** - Generate TypeScript types from schemas
