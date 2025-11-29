# ts-xml

> ⚠️ **LEGACY PACKAGE** - This package is being replaced by [ts-xsd](../ts-xsd/README.md).
>
> **Why?** `ts-xsd` provides better XSD compatibility, automatic type inference, and integrates with the `speci` contract system.
> This package will be removed once migration is complete.

---

**Type-safe XML ↔ JSON transformation with a single schema definition**

## What is it?

`ts-xml` transforms between XML and JSON using a schema you define once. TypeScript types are automatically inferred from your schema, giving you full type safety at compile time.

```typescript
import { tsxml, build, parse, type InferSchema } from "ts-xml";

// Define schema once
const BookSchema = tsxml.schema({
  tag: "book",
  fields: {
    isbn: { kind: "attr", name: "isbn", type: "string" },
    title: { kind: "attr", name: "title", type: "string" },
    price: { kind: "attr", name: "price", type: "number" },
  },
} as const);

// TypeScript infers the type (note: all fields become string | number | boolean | Date union)
type Book = InferSchema<typeof BookSchema>;
// { isbn: string | number | boolean | Date; title: string | number | boolean | Date; price: string | number | boolean | Date }

// JSON → XML
const book: Book = {
  isbn: "978-0-123456-78-9",
  title: "TypeScript Guide",
  price: 49.99,
};
const xml = build(BookSchema, book);

// XML → JSON
const parsed: Book = parse(BookSchema, xml);
```

## Why?

### The Real Problem

**Libraries like `fast-xml-parser` can do round-trips**, but they force you into their data format:

```typescript
// fast-xml-parser requires this awkward structure
const data = {
  "bk:book": {
    "@_xmlns:bk": "http://example.com/books",
    "@_bk:isbn": "123",
    "@_bk:title": "Book",
    "bk:author": {
      "@_name": "Alice"
    }
  }
};
```

**Problems with this approach:**
- ❌ **Hardcoded format** - Your domain logic is polluted with `@_` prefixes and namespace handling
- ❌ **No type safety** - TypeScript can't infer types from this structure
- ❌ **Can't use class instances** - Must use plain objects with magic keys
- ❌ **Can't use proxies** - Parser expects specific object shape

**Alternative: XSLT processors** require:
- Pre-compiled SEF files
- XSD schemas
- XSLT transformations at runtime
- All adds complexity and slows down parsing/rendering

### What ts-xml Does Differently

**Transforms YOUR objects into XML using native TypeScript schemas:**

```typescript
// Your clean domain object
const book = {
  isbn: "123",
  title: "Book",
  author: { name: "Alice" }
};

// Define schema once
const BookSchema = tsxml.schema({
  tag: "bk:book",
  ns: { bk: "http://example.com/books" },
  fields: {
    isbn: { kind: "attr", name: "bk:isbn", type: "string" },
    title: { kind: "attr", name: "bk:title", type: "string" },
    author: {
      kind: "elem",
      name: "bk:author",
      schema: AuthorSchema
    }
  }
});

// Works with plain objects, class instances, proxies - anything!
const xml = build(BookSchema, book);
```

**Benefits:**
- ✅ **Clean domain objects** - No pollution with XML metadata
- ✅ **Full type safety** - TypeScript infers types from schema
- ✅ **Works with instances** - Use class instances, proxies, any JavaScript object
- ✅ **Fast** - No XSLT compilation, no runtime schema validation
- ✅ **Simple** - Just define schema once, use everywhere

## How?

### Installation

```bash
npm install ts-xml
```

### Basic Usage

#### 1. Define Schema

```typescript
import { tsxml } from "ts-xml";

const PersonSchema = tsxml.schema({
  tag: "person",
  fields: {
    name: { kind: "attr", name: "name", type: "string" },
    age: { kind: "attr", name: "age", type: "number" },
  },
} as const);
```

#### 2. Transform JSON → XML

```typescript
import { build } from "ts-xml";

const person = { name: "Alice", age: 30 };
const xml = build(PersonSchema, person);
// <person name="Alice" age="30"/>
```

#### 3. Parse XML → JSON

```typescript
import { parse } from "ts-xml";

const parsed = parse(PersonSchema, xml);
// { name: "Alice", age: 30 }
```

### Nested Elements

```typescript
const OrderSchema = tsxml.schema({
  tag: "order",
  fields: {
    id: { kind: "attr", name: "id", type: "string" },
    items: {
      kind: "elems",
      name: "item",
      schema: tsxml.schema({
        tag: "item",
        fields: {
          name: { kind: "attr", name: "name", type: "string" },
          price: { kind: "attr", name: "price", type: "number" },
        },
      }),
    },
  },
} as const);

const order = {
  id: "order1",
  items: [
    { name: "apple", price: 1.5 },
    { name: "banana", price: 0.5 },
  ],
};

const xml = build(OrderSchema, order);
// <order id="order1">
//   <item name="apple" price="1.5"/>
//   <item name="banana" price="0.5"/>
// </order>
```

### Namespaces

```typescript
const BookSchema = tsxml.schema({
  tag: "bk:book",
  ns: {
    bk: "http://example.com/books",
    dc: "http://purl.org/dc/elements/1.1/",
  },
  fields: {
    isbn: { kind: "attr", name: "bk:isbn", type: "string" },
    title: { kind: "attr", name: "dc:title", type: "string" },
  },
} as const);

const xml = build(BookSchema, { isbn: "123", title: "Book" });
// <bk:book xmlns:bk="http://example.com/books"
//          xmlns:dc="http://purl.org/dc/elements/1.1/"
//          bk:isbn="123" dc:title="Book"/>
```

## Field Types

| Type | Description | Example |
|------|-------------|---------|
| `attr` | XML attribute | `<book title="..."/>` |
| `text` | Element text content | `<book>content</book>` |
| `elem` | Single child element | `<order><item/></order>` |
| `elems` | Repeated child elements | `<cart><item/><item/></cart>` |

**Data Types**: `string`, `number`, `boolean`, `date`

## API

### `tsxml.schema(config)`

Create a typed schema.

**Config:**
- `tag: string` - Element tag name (with namespace prefix if needed)
- `ns?: Record<string, string>` - Namespace declarations
- `fields: Record<string, Field>` - Field definitions

**Returns:** Typed schema object

### `build(schema, data, options?)`

Transform JSON to XML.

**Options:**
- `xmlDecl?: boolean` - Include XML declaration (default: `true`)
- `encoding?: string` - Encoding (default: `"utf-8"`)

**Returns:** XML string

### `parse(schema, xml)`

Transform XML to JSON.

**Returns:** Typed JSON data

### `InferSchema<Schema>`

TypeScript utility to extract JSON type from schema.

## Real-World Example: SAP ADT

```typescript
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
  description: "Example package",
  superPackage: {
    uri: "/sap/bc/adt/packages/%24tmp",
    name: "$TMP",
  },
};

const xml = build(PackageSchema, pkg);
const parsed = parse(PackageSchema, xml);
```

## Guarantees

- **Type Safety** - Full TypeScript checking at compile time
- **Round-Trip** - XML→JSON→XML preserves all data
- **Namespace Preservation** - QNames emitted exactly as specified
- **Order Preservation** - Element order maintained naturally via DOM/arrays

## Development

```bash
npm install       # Install dependencies
npm run build     # Build package
npm test          # Run tests
npm run typecheck # Type check
```

## Use Cases

- **API clients** - Type-safe XML API requests/responses
- **Configuration** - Parse/generate XML config files
- **Data exchange** - Transform between XML and JSON formats
- **SAP integration** - ADT, RFC, IDoc XML processing

## Alternatives Comparison

### Why ts-xml vs Other Libraries?

| Feature | ts-xml | fast-xml-parser | Zod | Valibot | JSONIX |
|---------|--------|-----------------|-----|---------|--------|
| **XML ↔ JSON bidirectional** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Type inference from schema** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Clean domain objects** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Namespace support** | ✅ | ✅ | N/A | N/A | ✅ |
| **No runtime overhead** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Zero dependencies** | ✅* | ✅ | ✅ | ✅ | ❌ |
| **Bundle size** | ~5KB | ~50KB | ~12KB | ~5KB | ~200KB |
| **XSD codegen support** | ✅ | ❌ | ❌ | ❌ | ✅ |

*ts-xml uses `@xmldom/xmldom` for DOM parsing

### fast-xml-parser

**Good for:** Quick XML parsing without type safety

**Problems:**
- Forces awkward data structure with `@_` prefixes
- No TypeScript type inference
- Your domain objects must match parser's expected format

```typescript
// fast-xml-parser requires this structure
const data = {
  "bk:book": {
    "@_xmlns:bk": "http://example.com/books",
    "@_bk:isbn": "123",
  }
};

// ts-xml lets you use clean objects
const data = { isbn: "123" };
```

### Zod / Valibot

**Good for:** JSON validation and type inference

**Problems:**
- **No XML support** - JSON only
- Runtime validation overhead (Zod)
- Can't handle XML namespaces, attributes vs elements

```typescript
// Zod can't distinguish between:
// <book isbn="123"/>  (attribute)
// <book><isbn>123</isbn></book>  (element)

// ts-xml handles both explicitly
const schema = tsxml.schema({
  tag: "book",
  fields: {
    isbn: { kind: "attr", name: "isbn", type: "string" },  // attribute
    // OR
    isbn: { kind: "elem", name: "isbn", type: "string" },  // element
  }
});
```

### JSONIX

**Good for:** XSD-driven XML binding (Java-style)

**Problems:**
- **Huge bundle size** (~200KB)
- Complex setup with XSD compilation
- Java-style API, not TypeScript-native
- Requires pre-compiled mappings

```typescript
// JSONIX requires XSD compilation step
// $ java -jar jsonix-schema-compiler.jar schema.xsd

// ts-xml works directly with TypeScript
const schema = tsxml.schema({ ... });
```

### When to Use ts-xml

✅ **Use ts-xml when:**
- You need bidirectional XML ↔ JSON transformation
- You want TypeScript type inference from schemas
- You're working with namespaced XML (SOAP, SAP ADT, etc.)
- You want clean domain objects without XML pollution
- Bundle size matters
- You want to generate schemas from XSD (via `ts-xml-codegen`)

❌ **Consider alternatives when:**
- You only need JSON validation → use Zod/Valibot
- You need streaming XML parsing → use sax-js
- You have complex XSD with inheritance → consider JSONIX
- You need XPath queries → use xmldom directly

## Ecosystem

ts-xml is part of a family of packages:

| Package | Description |
|---------|-------------|
| `ts-xml` | Core XML ↔ JSON transformation |
| `ts-xml-xsd` | Parse XSD files using ts-xml (dogfooding!) |
| `ts-xml-codegen` | Generate ts-xml schemas from XSD files |

```bash
# Generate ts-xml schemas from XSD
npx ts-xml-codegen schema.xsd -o generated/
```

## License

MIT
