# tsod

**Transform Schema Object Definition** - Bidirectional object transformation engine

Like Zod, but for transformations instead of validation. Define transformation schemas once and use them in both directions.

## ✨ Features

- **🔄 Bidirectional** - Single schema, transform both ways
- **🎯 Type-Safe** - Full TypeScript support with strict typing
- **⚡ Zero Dependencies** - Lightweight core (~150 lines)
- **🧩 Composable** - Nest transformations infinitely
- **🚀 Generic** - Works with any object structure
- **📦 Minimalist** - Clean, focused API

## 🚀 Quick Start

```typescript
import { Transformer } from 'tsod';

// Define schema once
const schema = {
  rules: [
    { from: 'name', to: 'userName' },
    { from: 'age', to: 'userAge' }
  ]
};

const transformer = new Transformer(schema);

// Forward transformation
const target = transformer.forward({ name: 'John', age: 30 });
// { userName: 'John', userAge: 30 }

// Reverse transformation
const source = transformer.reverse({ userName: 'John', userAge: 30 });
// { name: 'John', age: 30 }
```

## 📚 Core Concepts

### Simple Field Mapping

```typescript
const schema = {
  rules: [
    { from: 'firstName', to: 'given_name' },
    { from: 'lastName', to: 'family_name' },
    { from: 'age', to: 'years' }
  ]
};

const transformer = new Transformer(schema);
const result = transformer.forward({
  firstName: 'John',
  lastName: 'Doe',
  age: 30
});
// { given_name: 'John', family_name: 'Doe', years: 30 }
```

### Nested Objects

```typescript
const schema = {
  rules: [
    { from: 'user.name', to: 'userName' },
    { from: 'user.email', to: 'contact.email' },
    { from: 'user.address.city', to: 'location.city' }
  ]
};

const result = transformer.forward({
  user: {
    name: 'John',
    email: 'john@example.com',
    address: { city: 'NYC' }
  }
});
// {
//   userName: 'John',
//   contact: { email: 'john@example.com' },
//   location: { city: 'NYC' }
// }
```

### Transform Functions

```typescript
const schema = {
  rules: [
    {
      from: 'name',
      to: 'userName',
      transform: (value: string) => value.toUpperCase(),
      reverse: (value: string) => value.toLowerCase()
    },
    {
      from: 'age',
      to: 'ageString',
      transform: (value: number) => String(value),
      reverse: (value: string) => parseInt(value, 10)
    }
  ]
};
```

### Arrays

```typescript
// Simple arrays
const schema = {
  rules: [
    { from: 'tags[]', to: 'labels[]' }
  ]
};

// Arrays with nested transformations
const schema = {
  rules: [
    {
      from: 'users[]',
      to: 'people[]',
      rules: [
        { from: 'name', to: 'fullName' },
        { from: 'age', to: 'years' }
      ]
    }
  ]
};

const result = transformer.forward({
  users: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ]
});
// {
//   people: [
//     { fullName: 'John', years: 30 },
//     { fullName: 'Jane', years: 25 }
//   ]
// }
```

### Schema Initialization

```typescript
const schema = {
  init: (direction) => {
    if (direction === 'forward') {
      return {
        '@_xmlns:pak': 'http://www.sap.com/adt/packages',
        '@_xmlns:adtcore': 'http://www.sap.com/adt/core'
      };
    }
    return {};
  },
  rules: [
    { from: 'name', to: '@_adtcore:name' }
  ]
};
```

## 🔧 API Reference

### `Transformer`

Main transformer class for bidirectional transformations.

```typescript
class Transformer {
  constructor(schema: TransformSchema, options?: TransformerOptions)

  forward(source: unknown): Record<string, unknown>
  reverse(target: unknown): Record<string, unknown>
}
```

### `TransformSchema`

```typescript
interface TransformSchema {
  rules: readonly TransformRule[];
  init?: (direction: 'forward' | 'reverse') => unknown;
}
```

### `TransformRule`

```typescript
interface TransformRule {
  from: string;  // Source path (e.g., 'user.name' or 'items[]')
  to: string;    // Target path
  transform?: (value: unknown, context: TransformContext) => unknown;
  reverse?: (value: unknown, context: TransformContext) => unknown;
  rules?: readonly TransformRule[];  // Nested rules for arrays/objects
}
```

### `TransformerOptions`

```typescript
interface TransformerOptions {
  skipUndefined?: boolean;  // Skip undefined values (default: true)
  skipNull?: boolean;       // Skip null values (default: false)
  strict?: boolean;         // Throw on missing paths (default: false)
  pathSeparator?: string;   // Path separator (default: '.')
  arrayMarker?: string;     // Array marker (default: '[]')
}
```

### Convenience Functions

```typescript
// Quick transform
import { transform, reverseTransform, createTransformer } from 'tsod';

const result = transform(source, schema);
const original = reverseTransform(result, schema);

// Or create reusable transformer
const transformer = createTransformer(schema);
```

## 💡 Real-World Examples

### GitHub API → Internal Format

```typescript
const githubSchema = {
  rules: [
    { from: 'login', to: 'username' },
    { from: 'avatar_url', to: 'avatar' },
    { from: 'html_url', to: 'profileUrl' },
    {
      from: 'repos[]',
      to: 'repositories[]',
      rules: [
        { from: 'name', to: 'title' },
        { from: 'full_name', to: 'id' },
        { from: 'stargazers_count', to: 'stars' }
      ]
    }
  ]
};
```

### Flat to Nested (ETL)

```typescript
const etlSchema = {
  rules: [
    { from: 'customer_name', to: 'customer.name' },
    { from: 'customer_email', to: 'customer.email' },
    { from: 'order_id', to: 'order.id' },
    { from: 'order_total', to: 'order.total' },
    { from: 'product_name', to: 'order.product.name' },
    { from: 'product_price', to: 'order.product.price' }
  ]
};
```

### XML-like Transformations (fast-xml-parser)

```typescript
const xmlSchema = {
  init: (direction) => direction === 'forward' ? {
    'pak:package': {
      '@_xmlns:pak': 'http://www.sap.com/adt/packages',
      '@_xmlns:adtcore': 'http://www.sap.com/adt/core',
      '@_xmlns:atom': 'http://www.w3.org/2005/Atom'
    }
  } : {},
  rules: [
    { from: 'name', to: 'pak:package.@_adtcore:name' },
    { from: 'description', to: 'pak:package.@_adtcore:description' },
    { from: 'attributes.packageType', to: 'pak:package.@_pak:packageType' },
    {
      from: 'links[]',
      to: 'pak:package.atom:link[]',
      rules: [
        { from: 'rel', to: '@_rel' },
        { from: 'href', to: '@_href' }
      ]
    }
  ]
};
```

## 🎯 Use Cases

- **API Integration** - Transform between different API formats
- **Data Migration** - Convert between database schemas
- **ETL Pipelines** - Extract, transform, load data
- **XML/JSON Conversion** - Work with fast-xml-parser or similar libraries
- **Format Normalization** - Standardize data from multiple sources
- **Legacy System Integration** - Bridge old and new data formats

## 🏗️ Architecture

tsod follows a clean, minimalist architecture:

```
src/
├── types.ts              # Core type definitions
├── transformer.ts        # Main transformation engine
├── core/
│   └── path-resolver.ts  # Path resolution utilities
└── index.ts              # Public API exports
```

**Design Principles:**
- **Generic** - No domain-specific logic
- **Type-safe** - Full TypeScript strict mode
- **Zero dependencies** - Self-contained
- **Extensible** - Plugin-ready architecture
- **Tested** - 100% test coverage

## 📦 Installation

```bash
npm install tsod
# or
bun add tsod
```

## 🧪 Testing

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage
```

## 📄 Documentation

- **[API Reference](./docs/api.md)** - Complete API documentation
- **[Examples](./docs/examples.md)** - More real-world examples
- **[Architecture](./docs/architecture.md)** - Design decisions and extensibility
- **[Migration Guide](./docs/migration.md)** - Migrating from other libraries

## 🤝 Contributing

Contributions are welcome! Please see our [contributing guidelines](../../CONTRIBUTING.md).

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for clean, bidirectional object transformations**
