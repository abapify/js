# ts-xsd - AI Agent Guide

## Overview

Type-safe XSD schemas for TypeScript - parse and build XML with full type inference.

## Schema Format

ts-xsd uses a faithful XSD representation:

```typescript
const PersonSchema = {
  ns: 'http://example.com/person',
  prefix: 'per',
  element: [
    { name: 'Person', type: 'Person' },  // Top-level element declarations
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

**Key structure:**
- `element[]` - Top-level xsd:element declarations (name → type mapping)
- `complexType{}` - xsd:complexType definitions
- `simpleType{}` - xsd:simpleType definitions (optional)

## Package Structure

```
ts-xsd/
├── src/
│   ├── xml/              # Parse/build functionality
│   │   ├── parse.ts      # XML → JS object
│   │   └── build.ts      # JS object → XML
│   ├── codegen/          # XSD → TypeScript generator
│   │   ├── xs/           # XSD element handlers
│   │   │   ├── extension.ts  # complexContent > extension (inheritance)
│   │   │   ├── sequence.ts   # sequence/choice elements
│   │   │   ├── attribute.ts  # attributes
│   │   │   └── element.ts    # element fields
│   │   └── generator.ts  # Generator interface
│   ├── generators/       # Built-in generators
│   │   ├── factory.ts    # Factory generator (wraps with factory function)
│   │   └── raw.ts        # Raw generator (plain XsdSchema)
│   ├── types.ts          # Schema types and InferXsd
│   └── index.ts          # Main exports
└── tests/
    ├── basic.test.ts     # Core parse/build tests
    ├── codegen.test.ts   # XSD codegen tests
    ├── generators.test.ts # Generator tests
    └── redefine.test.ts  # xs:redefine tests
```

## Testing

ts-xsd uses **Node.js native test runner** (not vitest):

```bash
# Run all tests
npx tsx --test tests/*.test.ts

# Run specific test pattern
npx tsx --test tests/*.test.ts --test-name-pattern "extends"

# Run with coverage
npx tsx --test --experimental-test-coverage tests/*.test.ts
```

**Key points:**
- Test files use `.ts` extension (not `.mjs`)
- Uses `node:test` and `node:assert` modules
- No vitest.config.ts in this package
- Current coverage: ~86% lines

## Type Inheritance (extends)

The `extends` property enables XSD type inheritance:

```typescript
complexType: {
  Derived: {
    extends: 'Base',  // Inherits from Base type
    sequence: [...],  // Own fields
  },
}
```

**Implementation:**
- `codegen/xs/extension.ts` - Extracts base type from XSD
- `types.ts` - `InferExtends` merges inherited types
- `xml/parse.ts` - `getMergedComplexTypeDef()` merges at runtime
- `xml/build.ts` - Same merging for build

## Codegen Architecture

When generating from XSD:

1. **Parse XSD** - `codegen/xs/schema.ts` extracts namespace, types
2. **Handle inheritance** - `codegen/xs/extension.ts` detects `complexContent > extension`
3. **Generate types** - `codegen/xs/sequence.ts` creates complexType definitions
4. **Apply generator** - `factory()` or `raw()` wraps output

**SchemaData structure:**
```typescript
interface SchemaData {
  namespace?: string;
  prefix: string;
  element: SchemaElementDecl[];  // Top-level elements
  complexType: Record<string, unknown>;
  simpleType?: Record<string, unknown>;
  imports: SchemaImport[];
}
```

## Common Tasks

### Fix a generated schema bug
1. Identify the codegen file responsible
2. Fix in `src/codegen/xs/`
3. Build: `npx nx build ts-xsd`
4. Regenerate schemas: `npx nx run adt-schemas-xsd:generate`

### Add new XSD feature support
1. Update relevant `codegen/xs/*.ts` file
2. Update `types.ts` if type inference needed
3. Update `xml/parse.ts` and `xml/build.ts` for runtime
4. Add tests in `tests/basic.test.ts`

### Add generator tests
1. Add tests in `tests/generators.test.ts`
2. Test both `factory()` and `raw()` generators
3. Test `generateIndex()` and `generateStub()` methods
