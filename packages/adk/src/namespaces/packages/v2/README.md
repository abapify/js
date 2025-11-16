# ADT Package V2 - Schema-driven Implementation

This directory contains a reimplementation of the ADT Package specification using **ts-xml**, a schema-driven bidirectional XML ↔ JSON transformer.

## Why V2?

The original implementation (`../package.ts`) uses:
- **Decorators** (`@xml`, `@namespace`, `@root`, `@unwrap`)
- **Classes** with methods
- **Base class** (`BaseSpec`)
- **Manual parsing logic** (`fromXMLString`, `parseAdtCoreAttributes`, `extractNamespace`)

V2 uses **ts-xml** instead:
- ✅ **No decorators** - Pure TypeScript types
- ✅ **No classes** - Simple functions
- ✅ **Functional API** - `parsePackageXml()` / `buildPackageXml()`
- ✅ **Single schema definition** - Powers both XML→JSON and JSON→XML
- ✅ **Full type inference** - TypeScript types automatically derived from schema
- ✅ **Simpler code** - ~25 lines vs 150+ lines

## Files

- **`package.schema.ts`** - Schema definitions for all ADT package elements
  - Namespace constants (`PAK_NS`, `ADTCORE_NS`, `ATOM_NS`)
  - Reusable field mixins (`adtCoreFields`, `adtCoreObjectFields`)
  - Element schemas (attributes, transport, subPackages, etc.)
  - Main `AdtPackageSchema`

- **`package.ts`** - Pure functions for transformation
  - `parsePackageXml(xml)` - Parse XML to typed JSON
  - `buildPackageXml(data, options?)` - Build XML from typed JSON
  - `AdtPackage` type - Fully typed package structure

- **`index.ts`** - Public exports

- **`package.test.ts`** - Tests using real SAP ADT fixtures

## Usage

```typescript
import { parsePackageXml, buildPackageXml, type AdtPackage } from "./v2/index.js";

// Parse XML to typed JSON
const pkg: AdtPackage = parsePackageXml(xmlString);

// Access data directly - fully typed!
console.log(pkg.name);               // "$ABAPGIT_EXAMPLES"
console.log(pkg.description);         // "Abapgit examples"
console.log(pkg.responsible);         // "PPLENKOV"
console.log(pkg.attributes?.packageType); // "development"
console.log(pkg.superPackage?.name);  // "$TMP"
console.log(pkg.subPackages?.packageRefs); // [{ name: "..." }, ...]

// Build XML from JSON
const xml = buildPackageXml(pkg, { xmlDecl: true });

// Round-trip
const xml2 = buildPackageXml(parsePackageXml(xml1));
```

## Type Safety

All types are automatically inferred from the schema:

```typescript
import type { AdtPackage } from "./v2/index.js";

// AdtPackage is fully typed based on AdtPackageSchema
const packageData: AdtPackage = {
  name: "$MY_PACKAGE",
  description: "My Package",
  type: "DEVC/K",
  attributes: {
    packageType: "development",
    isPackageTypeEditable: "false",
    // ... fully type-checked
  },
  // ... all fields type-checked
};

const xml = buildPackageXml(packageData);
```

## Schema Composition

Schemas are composed from smaller, reusable pieces:

```typescript
// Reusable field mixin
export const adtCoreFields = {
  uri: { kind: "attr" as const, name: "adtcore:uri", type: "string" as const },
  type: { kind: "attr" as const, name: "adtcore:type", type: "string" as const },
  name: { kind: "attr" as const, name: "adtcore:name", type: "string" as const },
  description: { kind: "attr" as const, name: "adtcore:description", type: "string" as const },
};

// Composed into element schemas
export const PackageRefSchema = tsxml.schema({
  tag: "pak:packageRef",
  fields: {
    ...adtCoreFields, // Spread reusable fields
  },
} as const);
```

## Testing

Tests use real SAP ADT fixture files:

```bash
npx vitest run packages/adk/src/namespaces/packages/v2/package.test.ts
```

All tests pass:
- ✅ Parse XML to AdtPackage
- ✅ Access nested elements
- ✅ Access atom links
- ✅ Convert to PackageData
- ✅ Round-trip XML → JSON → XML
- ✅ JSON creation

## Migration from V1

**V1 (Decorator-based, OOP):**
```typescript
const spec = AdtPackageSpec.fromXMLString(xmlString);
console.log(spec.core?.name);         // Access via core property
console.log(spec.pak?.attributes);    // Access via pak namespace
const data = spec.toData();
```

**V2 (Functional, schema-driven):**
```typescript
const pkg = parsePackageXml(xmlString);
console.log(pkg.name);               // Direct property access
console.log(pkg.attributes);         // Flattened structure
const xml = buildPackageXml(pkg);    // Just a function call
```

## Benefits

1. **Simpler** - No decorators, no classes, just pure functions
2. **Smaller** - ~25 lines vs 150+ lines of code
3. **Faster** - Direct DOM parsing/building (no decorator/class overhead)
4. **Type-safe** - Full TypeScript inference from schema
5. **Functional** - Easier to test, compose, and reason about
6. **Portable** - Schema can be used in other contexts
7. **Maintainable** - Schema is single source of truth

## Dependencies

- `ts-xml` - Schema-driven XML ↔ JSON transformer
- Original types from `../types.ts` for backward compatibility
