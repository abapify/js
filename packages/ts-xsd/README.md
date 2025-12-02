# ts-xsd

**Type-safe XSD schemas for TypeScript** - Parse and build XML with full type inference.

Part of the **ADT Toolkit** foundation - see [main README](../../README.md) for architecture overview.

## What is it?

`ts-xsd` lets you define XSD-like schemas as plain TypeScript objects. TypeScript automatically infers the types, and you get type-safe `parse()` and `build()` functions.

```typescript
import { parse, build, type XsdSchema, type InferXsd } from 'ts-xsd';

// Define schema as plain object with `as const`
const PersonSchema = {
  ns: 'http://example.com/person',
  prefix: 'per',
  element: [
    { name: 'Person', type: 'Person' },
  ],
  complexType: {
    Person: {
      sequence: [
        { name: 'FirstName', type: 'string' },
        { name: 'LastName', type: 'string' },
        { name: 'Age', type: 'number', minOccurs: 0 },
      ],
      attributes: [
        { name: 'id', type: 'string', required: true },
      ],
    },
  },
} as const satisfies XsdSchema;

// Type is automatically inferred!
type Person = InferXsd<typeof PersonSchema>;
// {
//   id: string;
//   FirstName: string;
//   LastName: string;
//   Age: number | undefined;
// }

// Parse XML → typed object
const person = parse(PersonSchema, xmlString);
console.log(person.FirstName); // ✅ typed as string

// Build typed object → XML
const xml = build(PersonSchema, {
  id: '123',
  FirstName: 'John',
  LastName: 'Doe',
  Age: 30,
});
```

## Why ts-xsd?

| Feature | ts-xsd | fast-xml-parser | Zod | JSONIX |
|---------|--------|-----------------|-----|--------|
| **XML ↔ JSON bidirectional** | ✅ | ✅ | ❌ | ✅ |
| **Type inference from schema** | ✅ | ❌ | ✅ | ❌ |
| **Clean domain objects** | ✅ | ❌ | ✅ | ❌ |
| **No runtime validation overhead** | ✅ | ✅ | ❌ | ❌ |
| **XSD codegen** | ✅ | ❌ | ❌ | ✅ |
| **Bundle size** | ~3KB | ~50KB | ~12KB | ~200KB |

## Installation

```bash
npm install ts-xsd
# or
bun add ts-xsd
```

## Usage

### Define Schema

```typescript
const OrderSchema = {
  element: [
    { name: 'Order', type: 'Order' },
  ],
  complexType: {
    Order: {
      sequence: [
        { name: 'items', type: 'Items' },
      ],
      attributes: [
        { name: 'id', type: 'string', required: true },
      ],
    },
    Items: {
      sequence: [
        { name: 'item', type: 'Item', maxOccurs: 'unbounded' },
      ],
    },
    Item: {
      sequence: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
      ],
    },
  },
} as const satisfies XsdSchema;

type Order = InferXsd<typeof OrderSchema>;
```

### Parse XML

```typescript
const xml = `
  <Order id="order-1">
    <items>
      <item><name>Apple</name><price>1.5</price></item>
      <item><name>Banana</name><price>0.75</price></item>
    </items>
  </Order>
`;

const order = parse(OrderSchema, xml);
// order.id = 'order-1'
// order.items.item[0].name = 'Apple'
// order.items.item[0].price = 1.5
```

### Build XML

```typescript
const order: Order = {
  id: 'order-2',
  items: {
    item: [
      { name: 'Orange', price: 2.0 },
      { name: 'Grape', price: 3.5 },
    ],
  },
};

const xml = build(OrderSchema, order);
```

## Import from XSD

Use the CLI to import XSD schemas into TypeScript:

```bash
# Print TypeScript to stdout (default)
npx ts-xsd import schema.xsd

# Write to file
npx ts-xsd import schema.xsd -o generated/

# Process multiple files
npx ts-xsd import schemas/*.xsd -o out/

# Read from stdin (pipe)
cat schema.xsd | npx ts-xsd import

# Output JSON instead of TypeScript
npx ts-xsd import schema.xsd --json

# Pipe JSON to jq
npx ts-xsd import schema.xsd --json | jq .

# Use custom resolver for xsd:import paths
npx ts-xsd import schema.xsd -r ./my-resolver.ts
```

## Pluggable Generators

ts-xsd supports pluggable generators that control how TypeScript code is generated from XSD schemas. This enables different output formats for different use cases.

### Built-in Generators

#### Raw Generator (Default)

Generates plain TypeScript schema files with `XsdSchema` type:

```typescript
// Generated output
import type { XsdSchema } from 'ts-xsd';

export default {
  ns: 'http://example.com/person',
  element: [{ name: 'Person', type: 'Person' }],
  complexType: { ... },
} as const satisfies XsdSchema;
```

#### Factory Generator

Wraps schemas with a factory function for custom processing (e.g., adding `parse`/`build` methods):

```typescript
// Generated output
import schema from '../../my-factory';

export default schema({
  ns: 'http://example.com/person',
  element: [{ name: 'Person', type: 'Person' }],
  complexType: { ... },
});
```

### Using Generators Programmatically

```typescript
import { generateFromXsd, factoryGenerator, rawGenerator } from 'ts-xsd/codegen';

// Default: raw generator
const result1 = generateFromXsd(xsdContent, options);

// Factory generator with custom factory path
const result2 = generateFromXsd(
  xsdContent,
  options,
  factoryGenerator,
  { factory: '../../my-factory' }
);
```

### Creating Custom Generators

Implement the `Generator` interface:

```typescript
import type { Generator, GeneratorContext } from 'ts-xsd/codegen';

const myGenerator: Generator = {
  generate({ schema, args }: GeneratorContext): string {
    // Generate TypeScript code from schema data
    return `
import myWrapper from '${args.wrapper || './wrapper'}';

export default myWrapper(${JSON.stringify(schema.complexType)});
`;
  },
  
  // Optional: generate index file
  generateIndex(schemas: string[]): string {
    return schemas.map(s => `export { default as ${s} } from './${s}';`).join('\n');
  },
};
```

### Generator Context

Generators receive a context with:

```typescript
interface GeneratorContext {
  schema: {
    namespace?: string;    // Target namespace URI
    prefix: string;        // Namespace prefix
    element: SchemaElementDecl[];  // Top-level element declarations
    complexType: Record<string, unknown>;  // ComplexType definitions
    simpleType?: Record<string, unknown>;  // SimpleType definitions
    imports: SchemaImport[];  // Dependencies
  };
  args: Record<string, string>;  // CLI arguments (--key=value)
}
```

### Generated Output

Given this XSD:

```xml
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://example.com/person">
  <xs:element name="Person">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="FirstName" type="xs:string"/>
        <xs:element name="LastName" type="xs:string"/>
      </xs:sequence>
      <xs:attribute name="id" type="xs:string" use="required"/>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

Generates:

```typescript
import type { XsdSchema } from 'ts-xsd';

export default {
  ns: 'http://example.com/person',
  prefix: 'person',
  element: [
    { name: 'Person', type: 'Person' },
  ],
  complexType: {
    Person: {
      sequence: [
        { name: 'FirstName', type: 'string' },
        { name: 'LastName', type: 'string' },
      ],
      attributes: [
        { name: 'id', type: 'string', required: true },
      ],
    },
  },
} as const satisfies XsdSchema;
```

### Handling xsd:import

When an XSD imports other schemas, ts-xsd generates TypeScript imports with an `include` array:

```xml
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           xmlns:common="http://example.com/common"
           targetNamespace="http://example.com/customer">
  <xs:import namespace="http://example.com/common" schemaLocation="common.xsd"/>
  <xs:element name="Customer">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="Name" type="xs:string"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

Generates:

```typescript
import type { XsdSchema } from 'ts-xsd';
import Common from './common';

export default {
  ns: 'http://example.com/customer',
  prefix: 'customer',
  include: [Common],  // Imported schemas
  element: [
    { name: 'Customer', type: 'Customer' },
  ],
  complexType: {
    Customer: {
      sequence: [
        { name: 'Name', type: 'string' },
      ],
    },
  },
} as const satisfies XsdSchema;
```

The `include` array enables:
- **Type inference** - TypeScript merges element types from all included schemas
- **Runtime lookup** - `parse()` and `build()` resolve types from included schemas

### Custom Import Resolver

For non-standard `schemaLocation` values (like SAP's `platform:/plugin/...` URLs), use a custom resolver:

```typescript
// adt-resolver.ts
import type { ImportResolver } from 'ts-xsd/codegen';

const resolve: ImportResolver = (schemaLocation, namespace) => {
  // platform:/plugin/.../model/foo.xsd → ./foo
  const match = schemaLocation.match(/\/model\/([^/]+)\.xsd$/);
  if (match) return `./${match[1]}`;
  return schemaLocation.replace(/\.xsd$/, '');
};

export default resolve;
```

Usage:

```bash
npx ts-xsd import schema.xsd -r ./adt-resolver.ts
```

## Composing Schemas with Include

You can compose schemas by including other schemas. This enables modular schema design:

```typescript
// common.ts - Shared types
const CommonSchema = {
  element: [
    { name: 'Address', type: 'Address' },
  ],
  complexType: {
    Address: {
      sequence: [
        { name: 'Street', type: 'string' },
        { name: 'City', type: 'string' },
        { name: 'Country', type: 'string' },
      ],
    },
  },
} as const satisfies XsdSchema;

export default CommonSchema;
```

```typescript
// customer.ts - Uses common types
import Common from './common';

const CustomerSchema = {
  include: [Common],  // Include common types
  element: [
    { name: 'Customer', type: 'Customer' },
  ],
  complexType: {
    Customer: {
      sequence: [
        { name: 'Name', type: 'string' },
        { name: 'BillingAddress', type: 'Address' },  // From Common
        { name: 'ShippingAddress', type: 'Address' }, // From Common
      ],
    },
  },
} as const satisfies XsdSchema;

// Type inference works across includes!
type Customer = InferXsd<typeof CustomerSchema>;
// {
//   Name: string;
//   BillingAddress: { Street: string; City: string; Country: string };
//   ShippingAddress: { Street: string; City: string; Country: string };
// }

// Parse and build work with included types
const customer = parse(CustomerSchema, xml);
const xml = build(CustomerSchema, customer);
```

## Schema Reference

### XsdSchema

```typescript
interface XsdSchema {
  ns?: string;           // Target namespace
  prefix?: string;       // Namespace prefix
  element?: XsdElementDecl[];  // Top-level element declarations
  complexType: Record<string, XsdComplexType>;  // ComplexType definitions
  simpleType?: Record<string, XsdSimpleType>;   // SimpleType definitions
  include?: XsdSchema[]; // Imported schemas (types merged at runtime)
  attributeFormDefault?: 'qualified' | 'unqualified';  // Attribute namespace qualification
  elementFormDefault?: 'qualified' | 'unqualified';    // Element namespace qualification
}
```

### XsdElementDecl

```typescript
interface XsdElementDecl {
  name: string;   // Element name
  type: string;   // Type name (references complexType or simpleType)
}
```

### XsdComplexType

```typescript
interface XsdComplexType {
  extends?: string;         // Base type name (type inheritance)
  sequence?: XsdField[];    // Ordered child elements
  choice?: XsdField[];      // Choice of child elements
  attributes?: XsdAttribute[];
  text?: boolean;           // Has text content
}
```

### Type Inheritance (extends)

ts-xsd supports XSD type inheritance via the `extends` property. When a type extends another, it inherits all sequence fields, choice fields, and attributes from the base type.

```typescript
// Base type
const BaseSchema = {
  element: [{ name: 'Base', type: 'Base' }],
  complexType: {
    Base: {
      sequence: [{ name: 'baseName', type: 'string' }],
      attributes: [{ name: 'baseId', type: 'string', required: true }],
    },
  },
} as const satisfies XsdSchema;

// Derived type extends Base
const DerivedSchema = {
  include: [BaseSchema],
  element: [{ name: 'Derived', type: 'Derived' }],
  complexType: {
    Derived: {
      extends: 'Base',  // Inherits baseName and baseId
      sequence: [{ name: 'derivedName', type: 'string' }],
    },
  },
} as const satisfies XsdSchema;

type Derived = InferXsd<typeof DerivedSchema>;
// {
//   baseId: string;      // Inherited from Base
//   baseName: string;    // Inherited from Base
//   derivedName: string; // Own field
// }
```

**Key features:**
- **Type inference** - TypeScript correctly infers inherited fields
- **Multi-level inheritance** - Supports chains like GrandChild → Child → Base
- **Runtime merging** - `parse()` and `build()` automatically include inherited fields
- **XSD codegen** - Generator extracts `extends` from `complexContent > extension`

### XsdField

```typescript
interface XsdField {
  name: string;
  type: string;             // Primitive type or element name
  minOccurs?: number;       // 0 = optional
  maxOccurs?: number | 'unbounded';  // > 1 or 'unbounded' = array
}
```

### XsdAttribute

```typescript
interface XsdAttribute {
  name: string;
  type: string;
  required?: boolean;
}
```

### Primitive Types

| XSD Type | TypeScript Type |
|----------|-----------------|
| `string`, `token`, `anyURI`, etc. | `string` |
| `int`, `integer`, `decimal`, `float`, `double` | `number` |
| `boolean` | `boolean` |
| `date`, `dateTime` | `Date` |

## API

### `parse(schema, xml)`

Parse XML string to typed object.

### `build(schema, data, options?)`

Build XML string from typed object.

**Options:**
- `xmlDecl?: boolean` - Include XML declaration (default: `true`)
- `encoding?: string` - Encoding (default: `'utf-8'`)
- `pretty?: boolean` - Pretty print (default: `false`)

### `InferXsd<T>`

TypeScript utility type to infer object type from schema.

## License

MIT
