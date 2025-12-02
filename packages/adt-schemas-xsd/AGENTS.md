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

4. **MANDATORY: Add test scenario** (see below)

## 🚨 MANDATORY: Schema Test Coverage

**Every schema MUST have a test scenario.** No exceptions.

When adding or modifying a schema:
1. Check if scenario exists in `tests/scenarios/`
2. If not, create one with real SAP XML fixture
3. Run tests: `npx nx test adt-schemas-xsd`

### Creating a Test Scenario

```typescript
// tests/scenarios/myschema.ts
import { expect } from 'vitest';
import { Scenario, type SchemaType } from './base/scenario';
import { mySchema } from '../../src/schemas/index';

export class MySchemaScenario extends Scenario<typeof mySchema> {
  readonly schema = mySchema;
  readonly fixtures = ['myschema.xml'];  // Real SAP XML in fixtures/

  validateParsed(data: SchemaType<typeof mySchema>): void {
    // Type-safe assertions - TS validates property access
    expect(data.someField).toBe('expected');
    expect(data.nested?.child).toBeDefined();
  }

  validateBuilt(xml: string): void {
    expect(xml).toContain('xmlns:ns="http://...');
  }
}
```

Register in `tests/scenarios/index.ts`:
```typescript
import { MySchemaScenario } from './myschema';
export const SCENARIOS = [..., new MySchemaScenario()];
```

### Test Files

| File | Purpose |
|------|---------|
| `tests/scenarios.test.ts` | Generic test runner |
| `tests/scenarios/base/scenario.ts` | Base class with `SchemaType<S>` |
| `tests/scenarios/index.ts` | Scenario registry |
| `tests/scenarios/fixtures/*.xml` | Real SAP XML samples |
| `tests/scenarios/*.ts` | Scenario implementations |

### What Tests Validate

- **parses**: XML → typed object
- **validates parsed**: Type-safe property assertions
- **builds**: Object → XML
- **validates built**: XML structure verification
- **round-trips**: Stability check

### Uncovered Schemas (TODO)

Check `src/schemas/index.ts` for exported schemas without scenarios:
- `adtcore`, `atom` - Base schemas (may not need direct tests)
- `abapsource`, `abapoo`, `classes`, `interfaces`
- `transportsearch`, `configurations`, `configuration`
- `atc`, `atcworklist`, `atcresult`, `checkrun`, `checklist`
