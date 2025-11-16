# @abapify/adt-schemas

Shared TypeScript types and **ts-xml** schemas for SAP ADT (ABAP Development Tools) APIs.

## Purpose

This package provides a **single source of truth** for ADT object structures:

- **Types** - TypeScript interfaces for all ADT objects (packages, classes, interfaces, etc.)
- **Schemas** - ts-xml schemas for bidirectional XML ↔ TypeScript transformation
- **Namespaces** - XML namespace helpers with consistent prefixing

## Architecture

### Core Concepts

#### 1. Schema (Fundamental Entity)

A **schema** defines the structure of an XML document or element. It can exist independently and is the primary entity for serving XML.

```typescript
// Schema = XML structure definition
export const ClassSchema = classNs.schema({
  tag: "class:abapClass",
  fields: {
    name: classNs.attr("name"),
    final: classNs.attr("final"),
    // ...
  },
} as const);
```

#### 2. Namespace (Optional Helper)

A **namespace** is an XML namespace helper that provides:
- URI and prefix metadata
- Convenience methods for creating fields with consistent prefixes
- Schema factory method

```typescript
// Namespace = organizational helper
export const classNs = createNamespace({
  uri: "http://www.sap.com/adt/oo/classes",
  prefix: "class",
});
```

**Key Insight**: Schemas can exist without namespaces (see Atom example below), making schema the fundamental entity.

#### 3. AdtSchema (XML Service Interface)

An **AdtSchema** wraps a schema to provide XML parsing and building capabilities:

```typescript
export interface AdtSchema<T> {
  fromAdtXml(xml: string): T;
  toAdtXml(data: T, options?: { xmlDecl?: boolean; encoding?: string }): string;
}
```

### Design Philosophy

```
Schema (fundamental)
  ├─ Defines XML structure
  ├─ Can exist without namespace
  └─ Wrapped in AdtSchema to serve XML

Namespace (optional helper)
  ├─ Provides convenience methods
  ├─ Ensures prefix consistency
  └─ Used to BUILD schemas
```

**Schema serves XML, not namespace.**

## Usage

### Basic Usage

```typescript
import { ClassAdtSchema } from "@abapify/adt-schemas/oo/classes";
import type { ClassType } from "@abapify/adt-schemas/oo/classes";

// Parse XML to typed object
const classObj: ClassType = ClassAdtSchema.fromAdtXml(xmlString);
console.log(classObj.name); // "ZCL_MY_CLASS"

// Build XML from typed object
const xml = ClassAdtSchema.toAdtXml(classObj, { xmlDecl: true });
```

### Using Types Only (Backend-Agnostic)

For `@abapify/adk` - use only the types, no XML logic:

```typescript
import type { ClassType } from "@abapify/adt-schemas/oo/classes";

// Work with plain objects (no XML)
const classData: ClassType = {
  name: "ZCL_MY_CLASS",
  abstract: "false",
  // ...
};
```

### Using Schemas (XML Communication)

For `@abapify/adt-client` - use schemas for HTTP communication:

```typescript
import { ClassAdtSchema } from "@abapify/adt-schemas/oo/classes";
import type { ClassType } from "@abapify/adt-schemas/oo/classes";

// Parse XML response from ADT API
const classObj: ClassType = ClassAdtSchema.fromAdtXml(xmlResponse);

// Build XML request for ADT API
const xml = ClassAdtSchema.toAdtXml(classObj);
```

## Package Structure

```
src/
├── base/
│   └── namespace.ts        # Single ts-xml import point
│                          # createNamespace(), createAdtSchema()
│
├── namespaces/
│   ├── atom/              # W3C Atom Syndication Format
│   │   ├── types.ts       # AtomLink
│   │   ├── schema.ts      # AtomLinkSchema
│   │   └── index.ts
│   │
│   └── adt/
│       ├── core/          # ADT Core (foundation)
│       │   ├── types.ts   # AdtCoreType
│       │   ├── schema.ts  # AdtCoreFields (mixins)
│       │   └── index.ts
│       │
│       ├── packages/      # SAP Packages (DEVC)
│       │   ├── types.ts   # PackageType
│       │   ├── schema.ts  # PackagesSchema, PackageAdtSchema
│       │   └── index.ts
│       │
│       ├── oo/
│       │   ├── classes/   # ABAP OO Classes
│       │   │   ├── types.ts
│       │   │   ├── schema.ts  # ClassSchema, ClassAdtSchema
│       │   │   └── index.ts
│       │   │
│       │   └── interfaces/  # ABAP OO Interfaces
│       │       ├── types.ts
│       │       ├── schema.ts  # InterfaceSchema, InterfaceAdtSchema
│       │       └── index.ts
│       │
│       └── ddic/          # Data Dictionary
│           ├── types.ts
│           ├── schema.ts  # DdicDomainSchema, DdicDomainAdtSchema
│           └── index.ts
```

### Folder Structure = XML Namespace URLs

The folder structure mirrors XML namespace URLs for intuitive discovery:

| Folder                | XML Namespace URL                          |
|-----------------------|-------------------------------------------|
| `adt/core/`           | `http://www.sap.com/adt/core`            |
| `adt/packages/`       | `http://www.sap.com/adt/packages`        |
| `adt/oo/classes/`     | `http://www.sap.com/adt/oo/classes`      |
| `adt/oo/interfaces/`  | `http://www.sap.com/adt/oo/interfaces`   |
| `adt/ddic/`           | `http://www.sap.com/adt/ddic`            |
| `atom/`               | `http://www.w3.org/2005/Atom`            |

## Creating New Schemas

### 1. Create Namespace Helper

```typescript
// src/namespaces/adt/myobject/schema.ts
import { createNamespace, createAdtSchema } from "../../../base/namespace.js";

export const myobj = createNamespace({
  uri: "http://www.sap.com/adt/myobject",
  prefix: "myobj",
});
```

### 2. Define Schema Structure

```typescript
export const MyObjectSchema = myobj.schema({
  tag: "myobj:myObject",
  ns: {
    myobj: myobj.uri,
    adtcore: adtcore.uri,
  },
  fields: {
    // ADT core attributes (mixin)
    ...AdtCoreObjectFields,

    // Object-specific attributes
    custom: myobj.attr("custom"),

    // Child elements
    child: myobj.elem("child", ChildSchema),
    items: myobj.elems("item", ItemSchema),
  },
} as const);
```

### 3. Create AdtSchema for XML Service

```typescript
/**
 * My Object ADT Schema
 *
 * Provides bidirectional XML ↔ TypeScript transformation
 */
export const MyObjectAdtSchema = createAdtSchema(MyObjectSchema);
```

### 4. Define TypeScript Types

```typescript
// src/namespaces/adt/myobject/types.ts
import type { InferSchema } from "../../../base/namespace.js";
import type { MyObjectSchema } from "./schema.js";

export type MyObjectType = InferSchema<typeof MyObjectSchema>;
```

### 5. Create Barrel Export

```typescript
// src/namespaces/adt/myobject/index.ts
export * from "./types.js";
export * from "./schema.js";
```

### 6. Add Package Export

```json
// package.json
{
  "exports": {
    "./myobject": {
      "types": "./dist/namespaces/adt/myobject/index.d.ts",
      "import": "./dist/namespaces/adt/myobject/index.js"
    }
  }
}
```

### 7. Update Main Index

```typescript
// src/index.ts
export * from "./namespaces/adt/myobject/index.js";
```

### 8. Create Test Fixtures

Create XML fixtures that match real ADT API responses. **Fixtures mirror the namespace structure:**

```
tests/fixtures/
└── adt/
    ├── packages/
    │   └── [package-name].devc.xml
    ├── oo/
    │   ├── classes/
    │   │   └── [class-name].clas.xml
    │   └── interfaces/
    │       └── [interface-name].intf.xml
    ├── ddic/
    │   └── [domain-name].doma.xml
    └── myobject/
        └── [object-name].myob.xml
```

**Example:**
```xml
<!-- tests/fixtures/adt/myobject/zmy_test.myob.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<myobj:myObject
  xmlns:myobj="http://www.sap.com/adt/myobject"
  xmlns:adtcore="http://www.sap.com/adt/core"
  myobj:custom="value"
  adtcore:name="ZMY_TEST"
  adtcore:type="MYOB/O"
  adtcore:uri="/sap/bc/adt/myobject/zmy_test">
  <myobj:child>content</myobj:child>
  <myobj:item>item1</myobj:item>
</myobj:myObject>
```

**Best Practice:** Use real ADT API responses from your SAP system for accurate testing.

### 9. Write Tests

Use the **roundtrip test helper** for efficient testing:

```typescript
// tests/myobject.test.ts
import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MyObjectAdtSchema, myobj } from "../src/namespaces/adt/myobject/index.js";
import { testRoundtrip } from "./helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixture = readFileSync(join(__dirname, "fixtures/adt/myobject/zmy_test.myob.xml"), "utf-8");

describe("MyObject Schema", () => {
  test("namespace has correct uri and prefix", () => {
    assert.equal(myobj.uri, "http://www.sap.com/adt/myobject");
    assert.equal(myobj.prefix, "myobj");
  });

  test("roundtrip: XML → JSON → XML preserves data", () => {
    // testRoundtrip automatically:
    // 1. Parses XML to JSON
    // 2. Runs your assertions
    // 3. Builds XML from JSON
    // 4. Re-parses and compares (deepEqual)
    testRoundtrip(MyObjectAdtSchema, fixture, (obj) => {
      assert.equal(obj.name, "ZMY_TEST");
      assert.equal(obj.custom, "value");
      assert.ok(obj.items);
      assert.equal(obj.items.length, 2);
    });
  });
});
```

**Automatic Roundtrip Testing:**

All fixtures are automatically tested in `tests/roundtrip.test.ts`:

```typescript
// Discovers all *.xml files in tests/fixtures/adt/
// Matches them to schemas
// Runs roundtrip: XML → JSON → XML → compare
npm test  // Includes automatic roundtrip tests
```

### 10. Run Tests

Tests run directly on TypeScript source using **Node.js native test runner** with tsx loader:

```bash
# Run all tests
npm test

# Run specific test file
node --import tsx --test tests/myobject.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Architecture:**
- **Test Runner**: Node.js built-in (`node --test`)
- **TypeScript Loader**: tsx (`--import tsx`)
- **No Build Required**: Tests run directly on `.ts` source files

**Benefits:**
- ✅ Native Node.js test runner (fast, stable)
- ✅ No build step - instant feedback
- ✅ Better error messages (points to source .ts files)
- ✅ Works with workspace dependencies

## Key Features

### Single ts-xml Import Point

Only `base/namespace.ts` imports from ts-xml - all other files import from base:

```typescript
// base/namespace.ts - ONLY file importing ts-xml
import { tsxml, type InferSchema } from "ts-xml";

// All other files import from base
import { createNamespace, createAdtSchema } from "../../../base/namespace.js";
```

### Field Mixins for Reusability

Common fields can be shared across schemas:

```typescript
// Reusable field mixin
export const AdtCoreObjectFields = {
  uri: adtcore.attr("uri"),
  type: adtcore.attr("type"),
  name: adtcore.attr("name"),
  version: adtcore.attr("version"),
  // ...
} as const;

// Used in multiple schemas
export const ClassSchema = classNs.schema({
  fields: {
    ...AdtCoreObjectFields,  // ← Spread mixin
    final: classNs.attr("final"),
  },
});
```

### Cross-Namespace Dependencies

Schemas can reference components from other namespaces:

```typescript
// interfaces/schema.ts imports from classes/schema.ts
import { abapsource, abapoo } from "../classes/schema.js";

export const InterfaceSchema = intf.schema({
  fields: {
    sourceUri: abapsource.attr("sourceUri"),  // ← From classes namespace
    forkable: abapoo.attr("forkable"),        // ← From classes namespace
  },
});
```

### Schema Independence Example (Atom)

The Atom namespace demonstrates that schemas can work without namespace helpers:

```typescript
// Atom link schema with unprefixed attributes (per Atom spec)
export const AtomLinkSchema = atom.schema({
  tag: "atom:link",
  fields: {
    // NOT using atom.attr() - manually defined
    href: { kind: "attr" as const, name: "href", type: "string" as const },
    rel: { kind: "attr" as const, name: "rel", type: "string" as const },
  },
});
```

## Package Exports

Each namespace can be imported separately:

```typescript
// Import specific namespaces
import { ClassAdtSchema, ClassType } from "@abapify/adt-schemas/oo/classes";
import { InterfaceAdtSchema, InterfaceType } from "@abapify/adt-schemas/oo/interfaces";
import { PackageAdtSchema, PackageType } from "@abapify/adt-schemas/packages";
import { DdicDomainAdtSchema, DdicDomainType } from "@abapify/adt-schemas/ddic";

// Import base utilities
import { createNamespace, createAdtSchema, type AdtSchema } from "@abapify/adt-schemas/base";

// Or import everything
import * as schemas from "@abapify/adt-schemas";
```

## Available Namespaces

| Namespace | URI | Status |
|-----------|-----|--------|
| **adtcore** | `http://www.sap.com/adt/core` | ✅ Complete |
| **atom** | `http://www.w3.org/2005/Atom` | ✅ Complete |
| **packages** | `http://www.sap.com/adt/packages` | ✅ Complete |
| **oo/classes** | `http://www.sap.com/adt/oo/classes` | ✅ Complete |
| **oo/interfaces** | `http://www.sap.com/adt/oo/interfaces` | ✅ Complete |
| **ddic** | `http://www.sap.com/adt/ddic` | ✅ Complete (domains) |
| **abapsource** | `http://www.sap.com/adt/abapsource` | ✅ Shared namespace |
| **abapoo** | `http://www.sap.com/adt/oo` | ✅ Shared namespace |

## Benefits

### 1. Type Safety
- Full TypeScript inference from schemas
- Compile-time validation
- Auto-completion in IDEs

### 2. Single Source of Truth
- Types defined once, used everywhere
- No duplication between packages
- Schema changes propagate automatically

### 3. Separation of Concerns
- **ADK**: Business logic (types only)
- **ADT Client**: HTTP/XML communication (schemas + types)
- **ADT Schemas**: Shared types + XML schemas

### 4. Composability
- Field mixins can be reused
- Sub-schemas can be composed
- Cross-namespace references

### 5. Maintainability
- Folder structure matches XML namespaces
- Consistent API across all schemas
- Single import point for ts-xml

## Dependencies

- **ts-xml**: Schema-driven XML ↔ TypeScript transformer with type inference
- **typescript**: ^5.7.3

## License

MIT
