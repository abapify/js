# adt-schemas-xsd - AI Agent Guide

## Overview

This package provides type-safe SAP ADT schemas generated from XSD definitions using `ts-xsd`.

## Schema Generation

**Always use nx target:**

```bash
# ✅ CORRECT - uses config and runs download first
npx nx run adt-schemas-xsd:generate

# ❌ WRONG - direct command may miss config or dependencies
npx ts-xsd codegen
```

The `generate` target:
1. Downloads XSD files from SAP (`download` dependency)
2. Builds ts-xsd (`ts-xsd:build` dependency)
3. Runs codegen with config: `npx ts-xsd codegen -c tsxsd.config.ts`

## Key Files

| File | Purpose |
|------|---------|
| `tsxsd.config.ts` | Defines schemas to generate, factory path, import resolver |
| `.xsd/model/*.xsd` | Source XSD files (downloaded from SAP) |
| `src/schemas/generated/` | Output directory for generated schemas |
| `src/schemas/manual/` | Manually created schemas (ABAP XML format) |
| `src/speci.ts` | Factory wrapper adding parse/build methods |

## Schema Structure

Generated schemas include:
- `extends` - Base type name (XSD type inheritance)
- `sequence` - Ordered child elements
- `choice` - Choice of child elements  
- `attributes` - Element attributes
- `include` - Imported schemas

Example:
```typescript
export default schema({
  ns: 'http://www.sap.com/adt/oo/classes',
  root: 'AbapClass',
  include: [Adtcore, Abapoo],
  elements: {
    AbapClass: {
      extends: 'AbapOoObject',  // Type inheritance
      sequence: [...],
      attributes: [...],
    },
  },
} as const);
```

## Modifying Schemas

**NEVER edit generated files directly!**

If a generated schema is incorrect:
1. Fix the generator in `ts-xsd/src/codegen/`
2. Rebuild ts-xsd: `npx nx build ts-xsd`
3. Regenerate: `npx nx run adt-schemas-xsd:generate`

For schemas without XSD (ABAP XML format), create manual schemas in `src/schemas/manual/`.

## Adding New Schemas

1. Add schema name to `tsxsd.config.ts`:
   ```typescript
   const schemas = {
     // ... existing
     mynewschema: { root: 'MyRoot' },
   };
   ```

2. Regenerate: `npx nx run adt-schemas-xsd:generate`

3. Export from `src/schemas/index.ts` if needed
