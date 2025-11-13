# JOTL - JavaScript Object Transformation Language

**Version 0.1.0** - Minimalistic type-safe object transformations

> A declarative, lightweight transformation language for JSON and JavaScript objects with native TypeScript support.

---

## Why JOTL?

Modern applications constantly transform JSON data between different shapes:
- REST API adapters
- GraphQL resolvers
- Data normalization
- ETL pipelines

Current solutions are either too heavy (JSONata ~60KB, XSLT), too rigid (JSON Schema), or non-standard (custom lodash chains). **JOTL provides a lightweight (~2KB), type-safe, serializable alternative.**

---

## Installation

```bash
bun add jotl
# or
npm install jotl
```

---

## Quick Start

### Basic Field Mapping

```typescript
import { makeSchemaProxy, transform } from 'jotl';

interface User {
  firstName: string;
  lastName: string;
}

const src = makeSchemaProxy<User>("user");

const schema = {
  fullName: { $ref: "user.firstName" },
  surname: { $ref: "user.lastName" }
};

const result = transform(
  { firstName: "John", lastName: "Doe" },
  schema
);
// { fullName: "John", surname: "Doe" }
```

### Proxy Authoring (Recommended)

```typescript
interface Invoice {
  total: number;
  lines: Array<{ id: string; qty: number; price: number }>;
}

const src = makeSchemaProxy<Invoice>("invoice");

const schema = {
  totalAmount: src.total,
  items: src.lines(item => ({
    id: item.id,
    quantity: item.qty
  }))
};

const result = transform(invoiceData, schema);
```

---

## Features (v0.1)

✅ **$ref** - Path-based field mapping
✅ **$schema** - Nested transformations (objects & arrays)
✅ **Proxy authoring** - Type-safe schema building
✅ **TypeScript inference** - Full type safety
✅ **Serializable** - Schemas are plain objects

### Coming in v0.2+

- `$value` - Computed functions
- `$if` - Conditional inclusion
- `$const` - Literal constants
- `$default` - Fallback values
- `$merge` - Object merging

---

## Examples

### Array Mapping

```typescript
const schema = {
  items: {
    $ref: "order.lineItems",
    $schema: {
      productId: { $ref: "item.id" },
      qty: { $ref: "item.quantity" }
    }
  }
};
```

### Nested Objects

```typescript
const src = makeSchemaProxy<APIResponse>("response");

const schema = {
  userId: src.data.user.id,
  userName: src.data.user.profile.name
};
```

### Strict Mode

```typescript
// Throws error if path doesn't exist
const result = transform(data, schema, { strict: true });
```

---

## API Reference

### `makeSchemaProxy<T>(root: string): SchemaProxy<T>`

Creates a proxy that records property access as `$ref` paths.

**Parameters:**
- `root` - Root reference name (e.g., `"user"`, `"invoice"`)

**Returns:** Proxy that mirrors the structure of `T`

---

### `transform<TSource, TTarget>(source, schema, options?): TTarget`

Transforms source data using a declarative schema.

**Parameters:**
- `source` - Source data object
- `schema` - Transformation schema
- `options` - Transform options (optional)
  - `strict?: boolean` - Throw on missing paths (default: false)

**Returns:** Transformed object of type `TTarget`

---

## Schema Format

### `$ref` Directive

Maps a field to a source path using dot notation:

```typescript
{ fieldName: { $ref: "source.path.to.value" } }
```

### `$schema` Directive

Applies a nested transformation to the referenced value:

```typescript
{
  items: {
    $ref: "source.items",
    $schema: {
      id: { $ref: "item.id" },
      name: { $ref: "item.name" }
    }
  }
}
```

For arrays, `$schema` is applied to each element.

---

## TypeScript Support

JOTL provides full type inference:

```typescript
interface Source {
  user: { name: string; age: number };
}

const src = makeSchemaProxy<Source>("data");

// ✅ TypeScript knows src.user.name is valid
const schema = { userName: src.user.name };

// ❌ TypeScript error: Property 'invalid' does not exist
const bad = { invalid: src.invalid };
```

---

## Comparison

| Feature      | JOTL  | JSONata | XSLT  | Lodash |
|-------------|-------|---------|-------|--------|
| Bundle Size | ~2 KB | ~60 KB  | Heavy | ~70 KB |
| Typed       | ✅     | ❌       | ❌     | Partial |
| Serializable| ✅     | ✅       | ✅     | ❌      |
| JS-Native   | ✅     | ❌       | ❌     | ✅      |

---

## Roadmap

**v0.1** (Current) - `$ref` and `$schema` only
**v0.2** - Add `$value`, `$if`, `$const`, `$default`
**v0.3** - Add `$merge`, `$when`, validation
**v1.0** - Stable API, comprehensive docs, performance optimization

---

## Contributing

JOTL is in early development. Feedback and contributions welcome!

- **RFC**: [RFC.md](./RFC.md)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## License

MIT

---

## Learn More

- [Full RFC Specification](./RFC.md)
- [TypeScript Examples](./src/index.test.ts)
- [abapify Project](https://github.com/abapify/abapify)
