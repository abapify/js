# ts-xml

> Type-safe, schema-driven bidirectional XML ↔ JSON transformer with QName-first design

## Features

- **Single Schema Definition**: One schema powers both build (JSON→XML) and parse (XML→JSON)
- **Full Type Safety**: TypeScript types are automatically inferred from your schema
- **QName-First**: All tags and attributes are specified with namespace prefixes (e.g., `pak:package`)
- **Explicit Namespaces**: Namespace declarations via `ns` on element schemas
- **Round-Trip Guarantees**: XML→JSON→XML and JSON→XML→JSON preserve data
- **Zero Configuration**: No ordering config needed; DOM and arrays preserve order naturally
- **Lightweight**: Minimal runtime dependencies

## Installation

```bash
npm install ts-xml
# or
bun add ts-xml
# or
yarn add ts-xml
```

## Quick Start

```typescript
import { tsxml, build, parse } from "ts-xml";
import type { InferSchema } from "ts-xml";

// Define schema
const BookSchema = tsxml.schema({
  tag: "bk:book",
  ns: {
    bk: "http://example.com/books",
    dc: "http://purl.org/dc/elements/1.1/",
  },
  fields: {
    isbn: { kind: "attr", name: "bk:isbn", type: "string" },
    title: { kind: "attr", name: "dc:title", type: "string" },
    published: { kind: "attr", name: "bk:published", type: "date" },
    inStock: { kind: "attr", name: "bk:inStock", type: "boolean" },
    price: { kind: "attr", name: "bk:price", type: "number" },
  },
} as const);

// Infer TypeScript type
type Book = InferSchema<typeof BookSchema>;

// JSON → XML
const book: Book = {
  isbn: "978-0-123456-78-9",
  title: "TypeScript XML Processing",
  published: new Date("2025-01-15"),
  inStock: true,
  price: 49.99,
};

const xml = build(BookSchema, book);
// Output:
// <?xml version="1.0" encoding="utf-8"?>
// <bk:book xmlns:bk="http://example.com/books" xmlns:dc="http://purl.org/dc/elements/1.1/"
//          bk:isbn="978-0-123456-78-9" dc:title="TypeScript XML Processing"
//          bk:published="2025-01-15T00:00:00.000Z" bk:inStock="true" bk:price="49.99"/>

// XML → JSON
const parsed: Book = parse(BookSchema, xml);
// Result: { isbn: "978-0-123456-78-9", title: "TypeScript XML Processing", ... }
```

## Schema Definition

### Field Types

#### `attr` - Attribute Field
```typescript
{ kind: "attr", name: "prefix:name", type: "string" | "number" | "boolean" | "date" }
```

#### `text` - Text Content Field
```typescript
{ kind: "text", type: "string" | "number" | "boolean" | "date" }
```

#### `elem` - Single Child Element
```typescript
{ kind: "elem", name: "prefix:name", schema: ChildSchema }
```

#### `elems` - Repeated Child Elements
```typescript
{ kind: "elems", name: "prefix:name", schema: ChildSchema }
```

### Example: Nested Elements

```typescript
const AddressSchema = tsxml.schema({
  tag: "address",
  fields: {
    street: { kind: "attr", name: "street", type: "string" },
    city: { kind: "attr", name: "city", type: "string" },
  },
} as const);

const PersonSchema = tsxml.schema({
  tag: "person",
  fields: {
    name: { kind: "attr", name: "name", type: "string" },
    address: { kind: "elem", name: "address", schema: AddressSchema },
  },
} as const);

type Person = InferSchema<typeof PersonSchema>;
// Inferred type:
// {
//   name: string;
//   address?: { street: string; city: string };
// }
```

### Example: Repeated Elements

```typescript
const ItemSchema = tsxml.schema({
  tag: "item",
  fields: {
    name: { kind: "attr", name: "name", type: "string" },
    price: { kind: "attr", name: "price", type: "number" },
  },
} as const);

const CartSchema = tsxml.schema({
  tag: "cart",
  fields: {
    id: { kind: "attr", name: "id", type: "string" },
    items: { kind: "elems", name: "item", schema: ItemSchema },
  },
} as const);

const cart = {
  id: "cart1",
  items: [
    { name: "apple", price: 1.5 },
    { name: "banana", price: 0.5 },
  ],
};

const xml = build(CartSchema, cart);
// <cart id="cart1">
//   <item name="apple" price="1.5"/>
//   <item name="banana" price="0.5"/>
// </cart>
```

## API Reference

### `tsxml.schema(schema)`
Create a typed element schema.

### `build(schema, data, options?)`
Build XML string from JSON data using schema.

**Options:**
- `xmlDecl?: boolean` - Include XML declaration (default: `true`)
- `encoding?: string` - XML declaration encoding (default: `"utf-8"`)

### `parse(schema, xml)`
Parse XML string to JSON data using schema.

### `InferSchema<Schema>`
TypeScript utility type to infer JSON type from schema.

## Real-World Example: SAP ADT Package

```typescript
import { tsxml, build, parse } from "ts-xml-claude";
import type { InferSchema } from "ts-xml-claude";

const PackageSchema = tsxml.schema({
  tag: "pak:package",
  ns: {
    pak: "http://www.sap.com/adt/packages",
    adtcore: "http://www.sap.com/adt/core",
  },
  fields: {
    name: { kind: "attr", name: "adtcore:name", type: "string" },
    type: { kind: "attr", name: "adtcore:type", type: "string" },
    description: { kind: "attr", name: "adtcore:description", type: "string" },
    superPackage: {
      kind: "elem",
      name: "pak:superPackage",
      schema: tsxml.schema({
        tag: "pak:superPackage",
        fields: {
          uri: { kind: "attr", name: "adtcore:uri", type: "string" },
          name: { kind: "attr", name: "adtcore:name", type: "string" },
        },
      }),
    },
  },
} as const);

type Package = InferSchema<typeof PackageSchema>;

const pkg: Package = {
  name: "$ABAPGIT_EXAMPLES",
  type: "DEVC/K",
  description: "Abapgit examples",
  superPackage: {
    uri: "/sap/bc/adt/packages/%24tmp",
    name: "$TMP",
  },
};

const xml = build(PackageSchema, pkg);
const parsed = parse(PackageSchema, xml);
```

## Type Safety

All operations are fully type-checked:

```typescript
const schema = tsxml.schema({
  tag: "person",
  fields: {
    name: { kind: "attr", name: "name", type: "string" },
    age: { kind: "attr", name: "age", type: "number" },
  },
} as const);

type Person = InferSchema<typeof schema>;
// { name: string | number | boolean | Date; age: string | number | boolean | Date }

const person: Person = {
  name: "Alice",
  age: 30,
};

const xml = build(schema, person); // ✅ Type-safe
const parsed = parse(schema, xml); // ✅ Typed as Person

// TypeScript will catch errors:
// build(schema, { name: 123 }); // ❌ Type error
```

## Guarantees

- **Namespaces**: Emitted exactly as provided in `ns`. QNames are never re-aliased.
- **Attributes/Elements**: 1:1 mapping with schema; round-trips are stable.
- **Order**: Preserved by DOM and arrays; no schema `order` configuration needed.
- **Empty Elements**: `XMLSerializer` emits `<tag/>` (standard XML).
- **Date Handling**: Dates are serialized to ISO 8601 strings and parsed back to `Date` objects.

## Running Tests

```bash
npm test          # Run all tests
npm run test:watch # Watch mode
npm run demo      # Run demo script
```

## Development

```bash
bun install       # Install dependencies
npm run build     # Build the package
npm run typecheck # Type check
npm test          # Run tests
```

## License

MIT

## Credits

Created by Claude (Anthropic) as a demonstration of schema-driven XML processing.
