# ts-xsd - AI Agent Guide

## Overview

Type-safe XSD schemas for TypeScript - parse and build XML with full type inference.

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
│   ├── types.ts          # Schema types and InferXsd
│   └── index.ts          # Main exports
└── tests/
    └── basic.test.ts     # Tests using Node.js test runner
```

## Testing

ts-xsd uses **Node.js native test runner** (not vitest):

```bash
# Run all tests
npx tsx --test tests/basic.test.ts

# Run specific test pattern
npx tsx --test tests/*.test.ts --test-name-pattern "extends"
```

**Key points:**
- Test files use `.ts` extension (not `.mjs`)
- Uses `node:test` and `node:assert` modules
- No vitest.config.ts in this package

## Type Inheritance (extends)

The `extends` property enables XSD type inheritance:

```typescript
elements: {
  Derived: {
    extends: 'Base',  // Inherits from Base type
    sequence: [...],  // Own fields
  },
}
```

**Implementation:**
- `codegen/xs/extension.ts` - Extracts base type from XSD
- `types.ts` - `InferExtends` merges inherited types
- `xml/parse.ts` - `getMergedElementDef()` merges at runtime
- `xml/build.ts` - Same merging for build

## Codegen Architecture

When generating from XSD:

1. **Parse XSD** - `codegen/xs/schema.ts` extracts namespace, types
2. **Handle inheritance** - `codegen/xs/extension.ts` detects `complexContent > extension`
3. **Generate elements** - `codegen/xs/sequence.ts` creates element definitions
4. **Apply generator** - `factoryGenerator` or `rawGenerator` wraps output

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
