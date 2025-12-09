# Contributing to adt-plugin-abapgit

This guide explains how to add support for new ABAP object types and maintain existing handlers.

## Before You Start

**Read this carefully.** The architecture may seem over-engineered at first, but each decision exists for good reasons. Contributors often want to "simplify" by:

- ❌ Writing XML manually instead of using XSD schemas
- ❌ Implementing ADT client calls in handlers
- ❌ Handling file I/O directly in handlers
- ❌ Skipping type generation and using `any`

**Don't do these things.** This document explains why.

---

## Adding a New Object Type

### Step 1: Create the XSD Schema

**Location:** `xsd/{type}.xsd`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- Define the abapGit XML structure for your object type -->
  <xs:element name="abapGit">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="asx:abap" ...>
          <!-- Your object-specific structure -->
        </xs:element>
      </xs:sequence>
      <xs:attribute name="version" type="xs:string"/>
      <xs:attribute name="serializer" type="xs:string"/>
      <xs:attribute name="serializer_version" type="xs:string"/>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

**Why XSD?**

| Alternative | Problem |
|-------------|---------|
| Manual XML strings | No validation, typos cause runtime errors |
| TypeScript interfaces only | Can't validate external XML files |
| JSON Schema | XML ≠ JSON, wrong tool for the job |

XSD provides:
- **External validation**: `xmllint --schema xsd/mytype.xsd file.xml`
- **Industry standard**: Works with any XML tooling
- **Single source of truth**: Types, parser, and builder all generated from one file

### Step 2: Register Schema in ts-xsd Config

**File:** `ts-xsd.config.ts`

```typescript
export default defineConfig({
  schemas: [
    // ... existing schemas
    {
      input: 'xsd/mytype.xsd',
      output: 'src/schemas/generated',
      name: 'mytype',
    },
  ],
});
```

### Step 3: Generate TypeScript Types

```bash
npx nx codegen adt-plugin-abapgit
```

This generates in `src/schemas/generated/`:
- `types/mytype.ts` - TypeScript interfaces
- `schemas/mytype.ts` - Schema object with `.parse()` and `.build()`

### Step 4: Create the Handler

**Location:** `src/lib/handlers/objects/{type}.ts`

```typescript
/**
 * {TYPE} object handler for abapGit format
 */

import { Adk{Type} } from '../adk';
import { mytype } from '../schemas';
import { createHandler } from '../base';

export const {type}Handler = createHandler(Adk{Type}, {
  // Required: Schema for XML parsing/building
  schema: mytype,

  // Required: Map ADK data → abapGit XML structure
  toAbapGit: (obj) => ({
    FIELD1: obj.name ?? '',
    FIELD2: obj.description ?? '',
    // ... map all required fields
  }),

  // Optional: For objects with source code (single file)
  getSource: (obj) => obj.getSource(),

  // Optional: For objects with multiple source files (like CLAS)
  getSources: (obj) => obj.includes.map((inc) => ({
    suffix: SUFFIX_MAP[inc.type],
    content: obj.getIncludeSource(inc.type),
  })),

  // Optional: Override default filename (e.g., DEVC uses 'package.devc.xml')
  xmlFileName: 'custom.mytype.xml',

  // Optional: Completely custom serialization (rarely needed)
  serialize: async (object, ctx) => {
    // Only use if default behavior doesn't work
    return [ctx.createFile('custom.xml', customContent)];
  },
});
```

### Step 5: Register the Handler

**File:** `src/lib/handlers/registry.ts`

```typescript
// Add import
export { mytypeHandler } from './objects/mytype';
```

### Step 6: Add ADK Type to Re-exports (if needed)

**File:** `src/lib/handlers/adk.ts`

```typescript
// If using ADK class as value (not just type)
export { AdkMyType } from '@abapify/adk';

// If only using as type annotation
export type { AdkMyType } from '@abapify/adk';
```

### Step 7: Add Tests

**Location:** `tests/fixtures/{type}/` and `tests/schemas/{type}.test.ts`

1. Add real abapGit XML fixture files
2. Create schema test following existing pattern
3. Run tests: `npx nx test adt-plugin-abapgit`

---

## Handler API Reference

### `createHandler(type, definition)`

Factory function that creates and auto-registers a handler.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string \| AdkClass` | Object type code (e.g., 'CLAS') or ADK class |
| `definition.schema` | `Schema` | Generated ts-xsd schema |
| `definition.toAbapGit` | `(obj) => Record` | Maps ADK object to abapGit XML values |
| `definition.getSource?` | `(obj) => Promise<string>` | Returns single source file content |
| `definition.getSources?` | `(obj) => Array<{suffix?, content}>` | Returns multiple source files |
| `definition.xmlFileName?` | `string` | Override default XML filename |
| `definition.serialize?` | `(obj, ctx) => Promise<File[]>` | Custom serialization (rarely needed) |

### Handler Context (`ctx`)

Available in custom `serialize` functions:

```typescript
ctx.getObjectName(obj)           // → 'zcl_myclass'
ctx.getData(obj)                 // → ADK dataSync object
ctx.toAbapGitXml(obj)            // → Full XML string with envelope
ctx.createFile(path, content)    // → { path, content }
ctx.createAbapFile(name, src, suffix?)  // → ABAP file with correct naming
```

---

## Common Patterns

### Objects Without Source Code (DTEL, DOMA, etc.)

```typescript
export const dtelHandler = createHandler('DTEL', {
  schema: dtel,
  toAbapGit: (obj) => ({
    ROLLNAME: obj.name ?? '',
    DDTEXT: obj.description ?? '',
    // ... metadata fields only
  }),
  // No getSource/getSources - only XML file generated
});
```

### Objects With Single Source (INTF, PROG, etc.)

```typescript
export const intfHandler = createHandler(AdkInterface, {
  schema: intf,
  toAbapGit: (obj) => ({ /* ... */ }),
  getSource: (obj) => obj.getSource(),  // Returns Promise<string>
});
```

### Objects With Multiple Sources (CLAS)

```typescript
const SUFFIX_MAP: Record<IncludeType, string | undefined> = {
  main: undefined,           // → .clas.abap
  locals_def: 'locals_def',  // → .clas.locals_def.abap
  locals_imp: 'locals_imp',  // → .clas.locals_imp.abap
  testclasses: 'testclasses',
  macros: 'macros',
};

export const classHandler = createHandler(AdkClass, {
  schema: clas,
  toAbapGit: (obj) => ({ /* ... */ }),
  getSources: (cls) => cls.includes.map((inc) => ({
    suffix: SUFFIX_MAP[inc.includeType],
    content: cls.getIncludeSource(inc.includeType),  // Can be Promise
  })),
});
```

### Fixed Filename (DEVC)

```typescript
export const packageHandler = createHandler(AdkPackage, {
  schema: devc,
  xmlFileName: 'package.devc.xml',  // Not '{name}.devc.xml'
  toAbapGit: (pkg) => ({
    CTEXT: pkg.description ?? '',
  }),
});
```

---

## Anti-Patterns (Don't Do This)

### ❌ Manual XML Building

```typescript
// WRONG - No validation, error-prone
toAbapGit: (obj) => `<CLSNAME>${obj.name}</CLSNAME>`
```

```typescript
// CORRECT - Type-safe, validated
toAbapGit: (obj) => ({
  CLSNAME: obj.name ?? '',
})
```

### ❌ ADT Client Calls in Handler

```typescript
// WRONG - Handler shouldn't know about ADT
serialize: async (obj, ctx) => {
  const source = await adtClient.getSource(obj.uri);  // NO!
  // ...
}
```

```typescript
// CORRECT - Use ADK facade
getSource: (obj) => obj.getSource()  // ADK handles ADT calls
```

### ❌ Direct File System Access

```typescript
// WRONG - Handler shouldn't touch fs
serialize: async (obj) => {
  fs.writeFileSync('output.xml', xml);  // NO!
}
```

```typescript
// CORRECT - Return file descriptors
serialize: async (obj, ctx) => {
  return [ctx.createFile('output.xml', xml)];
}
```

### ❌ Skipping XSD Schema

```typescript
// WRONG - No external validation possible
const mySchema = { parse: ..., build: ... };  // Hand-written
```

```typescript
// CORRECT - XSD as source of truth
// 1. Create xsd/mytype.xsd
// 2. Run codegen
// 3. Import generated schema
import { mytype } from '../schemas';
```

---

## Testing

### Schema Tests

Test XML parsing, building, and round-trip:

```typescript
// tests/schemas/mytype.test.ts
const scenario: SchemaScenario<AbapGitMyType> = {
  name: 'MYTYPE',
  xsdName: 'mytype',
  schema: createTypedSchema<AbapGitMyType>(mytype),
  fixtures: [
    {
      path: 'mytype/example.mytype.xml',
      validate: (data) => {
        assert.strictEqual(data.abap.values.FIELD, 'expected');
      },
    },
  ],
};

runSchemaTests(scenario);
```

### Handler Tests

Test handler registration and serialization:

```typescript
// tests/handlers/base.test.ts
it('creates correct files', async () => {
  const handler = getHandler('MYTYPE');
  const files = await handler.serialize(mockObject);
  
  assert.ok(files.some(f => f.path.endsWith('.mytype.xml')));
});
```

---

## Checklist for New Object Types

- [ ] XSD schema created in `xsd/`
- [ ] Schema registered in `ts-xsd.config.ts`
- [ ] Codegen run: `npx nx codegen adt-plugin-abapgit`
- [ ] Handler created in `src/lib/handlers/objects/`
- [ ] Handler registered in `src/lib/handlers/registry.ts`
- [ ] ADK types added to `src/lib/handlers/adk.ts` (if needed)
- [ ] Test fixtures added in `tests/fixtures/`
- [ ] Schema tests added in `tests/schemas/`
- [ ] Build passes: `npx nx build adt-plugin-abapgit`
- [ ] Tests pass: `npx nx test adt-plugin-abapgit`
- [ ] README updated with new object type

---

## TODO / Known Issues

- [ ] **ADK ClassIncludeType**: The `ClassIncludeType` in ADK needs to include all abapGit include types (`testclasses`, `localtypes`, etc.). Currently some types are missing.
- [ ] **Integration tests**: Handler tests that import actual handlers fail due to bundler vs Node.js import incompatibility. Consider using vitest or testing built output.
- [ ] **Export (Git → SAP)**: Currently only import (SAP → Git) is implemented. Export would require ADK write operations.
