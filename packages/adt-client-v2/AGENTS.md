# AGENTS.md - ADT Client V2 Development Guide

This file provides guidance to AI coding assistants when working with the `adt-client-v2` package.

## Package Overview

**adt-client-v2** - Modern, contract-driven SAP ADT REST client built on `speci` (type-safe REST contracts) and `ts-xml` (schema-driven XML parsing). This replaces the legacy `adt-client` package with a fully type-safe, testable architecture.

## Architecture Principles

### Two-Layer Architecture

The client exposes two distinct APIs:

```typescript
const client = createAdtClient({...});

// 1. Low-level contracts (direct ADT REST access)
client.adt.core.http.sessions.getSession()
client.adt.repository.informationsystem.search.quickSearch({...})

// 2. High-level services (business logic)
client.services.*  // Future: orchestration, validation, workflows

// 3. Utility methods (debugging/testing)
client.fetch('/arbitrary/endpoint', { method: 'GET' })
```

**Layer 1: Contracts** (`src/adt/` → `client.adt.*`)
- Thin, declarative HTTP definitions
- Pure data structures (no business logic)
- Schema-driven type inference
- Direct 1:1 mapping to SAP ADT REST endpoints
- Example: `client.adt.core.http.sessions.getSession()`

**Layer 2: Services** (`src/services/` → `client.services.*`)
- Business logic orchestration
- Combines multiple contract calls
- Domain-specific workflows
- Error handling, retries, validation
- State management
- Example: `client.services.transports.importAndActivate(transportId)`

**Utility Methods** (on client directly)
- `client.fetch(url, options)` - Generic authenticated HTTP requests
- Not contracts (no schema), not services (no business logic)
- For debugging, testing, undocumented endpoints

### When to Use Each Layer

**Use Contracts when:**
- You need direct access to a specific SAP ADT endpoint
- You want 1:1 HTTP mapping with type safety
- The operation is a simple request/response (no orchestration)
- Example: Fetching session data, searching objects, reading class metadata

**Use Services when:**
- You need to combine multiple contract calls
- Business logic, validation, or error handling is required
- The operation involves workflows or state management
- Example: Import transport + activate objects + verify success

**Use Utilities when:**
- Testing undocumented endpoints
- Debugging raw API responses
- One-off requests that don't justify a contract

See [SERVICE-ARCHITECTURE.md](./docs/SERVICE-ARCHITECTURE.md) for detailed examples.

## Critical Rules for Contracts

### Rule 1: ALWAYS Specify Response Types

**MANDATORY**: Every contract endpoint MUST include a `responses` field for type inference.

❌ **WRONG** - No type inference (returns `unknown`):
```typescript
export const badContract = createContract({
  getData: () =>
    adtHttp.get('/sap/bc/adt/example', {
      headers: { Accept: 'application/xml' },
    }),
});
```

✅ **CORRECT** - Full type inference:

**For XML responses with schema:**
```typescript
import { ExampleSchema } from './example-schema';

export const goodContract = createContract({
  getData: () =>
    adtHttp.get('/sap/bc/adt/example', {
      responses: { 200: ExampleSchema },  // ← REQUIRED for type inference
      headers: { Accept: 'application/vnd.sap.adt.example.v1+xml' },
    }),
});
```

**For JSON responses:**
```typescript
import { ExampleSchema } from './example-schema';

export const goodContract = createContract({
  getData: () =>
    adtHttp.get('/sap/bc/adt/example', {
      responses: { 200: ExampleSchema },  // ← REQUIRED (Inferrable schema)
      headers: { Accept: 'application/vnd.sap.adt.example.v1+json' },
    }),
});
```

**For plain text responses:**
```typescript
export const goodContract = createContract({
  getData: () =>
    adtHttp.get('/sap/bc/adt/example', {
      responses: { 200: undefined as unknown as string },  // ← REQUIRED
      headers: { Accept: 'text/plain' },
    }),
});
```

### Rule 2: ALWAYS Validate Types with Tests

**MANDATORY**: Every new contract MUST have a type inference test that validates compile-time types.

Create `tests/<feature>-type-inference.test.ts`:

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAdtClient } from '../src/index';
import type { ExpectedType } from '../src/adt/path/to/schema';

describe('Feature Type Inference', () => {
  it('should infer correct response type from contract', async () => {
    const client = createAdtClient({
      baseUrl: 'https://example.com',
      username: 'test',
      password: 'test',
      client: '100',
      language: 'EN',
    });

    // CRITICAL: This extracts the return type - if it's 'unknown', test fails
    type ActualType = Awaited<ReturnType<typeof client.path.to.method>>;

    // CRITICAL: Verify the type matches our schema
    const typeCheck: ActualType extends ExpectedType ? true : false = true;
    assert.ok(typeCheck, 'Inferred type must match schema');

    // This should compile - if it doesn't, type inference is broken
    try {
      const response = await client.path.to.method();
      const field: string | undefined = response.expectedField;
      assert.ok(true, 'Type access works');
    } catch (error) {
      // Expected at runtime (no real server) - we're validating compile-time types
      assert.ok(true, 'Runtime failure expected - this is a type test');
    }
  });
});
```

**After creating the test**:
```bash
# Build and typecheck - this MUST pass
npx nx build adt-client-v2
npx tsc --noEmit  # Run from adt-client-v2 directory
```

If typecheck passes, type inference is working correctly.

### Rule 3: Schema File Conventions

**For XML Schemas** (using `ts-xml`):

⚠️ **CRITICAL**: Always use `createSchema()` helper to enable speci type inference!

```typescript
// example-schema.ts
import { createSchema } from '../../../base/schema';
import type { InferSchemaType } from '../../../base/schema';

export const ExampleSchema = createSchema({
  tag: 'namespace:element',  // Use namespaced tag if applicable
  ns: {
    namespace: 'http://www.sap.com/adt/namespace',
    atom: 'http://www.w3.org/2005/Atom',
  },
  fields: {
    name: { kind: 'attr', name: 'name', type: 'string' },
    value: { kind: 'elem', name: 'value', type: 'string' },
  },
} as const);

export type ExampleXml = InferSchemaType<typeof ExampleSchema>;
```

**Why `createSchema()` is required**: The helper automatically adds the `_infer` property that `speci` needs for type inference. Without it, contract methods will return `ElementSchema` instead of your parsed type, breaking type safety.

**For JSON Schemas** (Inferrable pattern):
```typescript
// example-schema.ts

/**
 * TypeScript interface matching the JSON structure
 */
export interface ExampleJson {
  // Match exact field names from SAP response (check actual API!)
  systemID?: string;     // Note: SAP often uses camelCase starting lowercase
  userName?: string;     // Not 'user_name' or 'User'

  // Document optional vs required fields accurately
  requiredField: string;
  optionalField?: string;

  // Allow additional properties for forward compatibility
  [key: string]: unknown;
}

/**
 * Inferrable schema for speci type inference
 * CRITICAL: The _infer property tells speci what type to infer
 */
export const ExampleSchema = {
  _infer: undefined as unknown as ExampleJson,
} as const;
```

**Why `_infer` is required**: Speci uses the `Inferrable<T>` pattern to automatically infer response types. Without the `_infer` property, speci returns `unknown` and you lose all type safety.

### Rule 4: Adapter Handles Content Negotiation

The adapter automatically handles response parsing based on content-type:

- **JSON**: `application/json` or `*+json` → `JSON.parse()`
- **XML with schema**: `*/*xml` + schema → `ts-xml.parse()`
- **Text**: `text/*` → raw string
- **Other**: raw string

You don't need to parse responses manually in contracts.

### Rule 5: Vendor-Specific Content Types

SAP uses vendor-specific content types like:
- `application/vnd.sap.adt.core.http.session.v3+xml`
- `application/vnd.sap.adt.core.http.systeminformation.v1+json`

The adapter recognizes `+json` and `+xml` suffixes automatically (fixed in [adapter.ts:158](../../src/adapter.ts#L158)).

## Workflow: Adding a New Contract

### Step 1: Create Schema File

```bash
# For XML endpoint
touch src/adt/path/to/feature-schema.ts

# For JSON endpoint
touch src/adt/path/to/feature-schema.ts
```

Define the schema (see Rule 3 above).

### Step 2: Create Contract File

```bash
touch src/adt/path/to/feature-contract.ts
```

```typescript
import { createContract, adtHttp } from '../../../base/contract';
import { FeatureSchema } from './feature-schema';  // or type { FeatureJson }

export const featureContract = createContract({
  getFeature: () =>
    adtHttp.get('/sap/bc/adt/path/to/feature', {
      responses: { 200: FeatureSchema },  // ← MANDATORY
      headers: {
        Accept: 'application/vnd.sap.adt.feature.v1+xml',
        'X-sap-adt-sessiontype': 'stateful',
      },
    }),
});

export type FeatureContract = typeof featureContract;
```

### Step 3: Register in Main Contract

Edit `src/contract.ts`:

```typescript
import { featureContract } from './adt/path/to/feature-contract';

export const adtContract = {
  discovery: discoveryContract,
  classes: classesContract,
  core: {
    http: {
      sessions: sessionsContract,
      systeminformation: systeminformationContract,
      feature: featureContract,  // ← Add here
    },
  },
} satisfies RestContract;
```

### Step 4: Create Type Inference Test

```bash
touch tests/feature-type-inference.test.ts
```

Follow the pattern from Rule 2 above.

### Step 5: Build and Validate

```bash
# Build the package
npx nx build adt-client-v2

# Typecheck (must pass!)
cd packages/adt-client-v2 && npx tsc --noEmit

# If typecheck fails, you forgot the responses field or have a type error
```

### Step 6: Create CLI Command (Optional)

If the contract needs a CLI command for testing:

```bash
# In adt-cli package
touch packages/adt-cli/src/lib/commands/feature.ts
```

```typescript
import { Command } from 'commander';
import { getAdtClient } from '../client';

export const featureCommand = new Command('feature')
  .description('Test feature endpoint')
  .action(async () => {
    const client = getAdtClient();

    console.log('🔄 Fetching feature data...');
    const data = await client.path.to.feature.getFeature();

    // CLI-friendly output (not JSON dump)
    console.log('📋 Feature Data:');
    console.log(`  • Field 1: ${data.field1}`);
    console.log(`  • Field 2: ${data.field2}`);
  });
```

Register in `packages/adt-cli/src/lib/commands/index.ts` and `cli.ts`.

## Common Mistakes

### Mistake 1: Missing `responses` Field
**Symptom**: TypeScript shows `unknown` type, no autocomplete
**Fix**: Add `responses: { 200: YourSchema }` to contract

### Mistake 2: Not Using `createSchema()` for XML Schemas
**Symptom**: TypeScript shows `ElementSchema` type instead of parsed type (e.g., `Property 'links' does not exist on type 'ElementSchema'`)
**Fix**: Wrap XML schema definitions with `createSchema()` helper:
```typescript
// ❌ WRONG - Returns ElementSchema
export const MySchema: ElementSchema = { ... } as const;

// ✅ CORRECT - Returns inferred type
export const MySchema = createSchema({ ... } as const);
```
The `createSchema()` helper automatically adds the `_infer` property needed for speci type inference.

### Mistake 3: Missing `_infer` Property in JSON Schema
**Symptom**: TypeScript shows `unknown` type even with `responses` field
**Fix**: For JSON responses, create an Inferrable schema with `_infer` property:
```typescript
export const MySchema = {
  _infer: undefined as unknown as MyInterface,
} as const;
```
Then use `responses: { 200: MySchema }` (not `responses: { 200: undefined as unknown as MyInterface }`)

### Mistake 4: Wrong Field Names in Schema
**Symptom**: Runtime data doesn't match schema types
**Fix**: Check actual SAP response (use `npx adt <command> -o output.json`) and match field names exactly

### Mistake 5: Not Running Typecheck
**Symptom**: Type errors discovered later in CLI or production
**Fix**: Always run `npx tsc --noEmit` before committing

### Mistake 6: Skipping Type Inference Test
**Symptom**: Contract changes break type safety silently
**Fix**: Every contract needs a `*-type-inference.test.ts` file

### Mistake 7: Business Logic in Contracts
**Symptom**: Contracts become hard to test and reuse
**Fix**: Keep contracts thin - move logic to services layer

### Mistake 8: Adding `metadata` Field to Contracts
**Symptom**: Redundant code that duplicates `responses` field
**Fix**: **NEVER** add `metadata: { responseSchema: ... }` to contracts. The adapter automatically detects schemas from `responses[200]`. This field is legacy and should be removed if found.
```typescript
// ❌ WRONG - Redundant metadata
adtHttp.get('/endpoint', {
  responses: { 200: MySchema },
  metadata: { responseSchema: MySchema },  // ← Remove this!
})

// ✅ CORRECT - Adapter auto-detects from responses
adtHttp.get('/endpoint', {
  responses: { 200: MySchema },  // ← This is enough!
})
```
The adapter checks if `responses[200]` is an `ElementSchema` (has `tag` and `fields`) and automatically uses it for XML parsing.

### Mistake 9: Using `as any` Type Assertions
**Symptom**: Type safety violations, runtime errors not caught at compile time
**Fix**: **NEVER** use `as any` without explicit justification. If type inference fails, fix the schema/contract, don't bypass it with casts.
```typescript
// ❌ WRONG - Defeats type safety
const sys = systemData as any;
sessionData.links.forEach((link: any) => { ... });

// ✅ CORRECT - Let TypeScript infer types
if (systemData.systemID) { ... }  // Type-safe access
sessionData.links.forEach((link) => { ... });  // Type inferred from schema
```

### Mistake 10: Exposing fetch() as a Contract
**Symptom**: Generic utility methods appearing in contract hierarchy
**Fix**: The `fetch()` method is a **utility function on the client**, not a contract endpoint. Contracts must map to specific SAP ADT endpoints with known schemas.
```typescript
// ❌ WRONG - fetch in contracts
client.adt.core.http.fetch.fetch(url)

// ✅ CORRECT - fetch as client utility
client.fetch(url, { method: 'GET', headers: {...} })
```
Contracts are for typed, schema-driven endpoints. `fetch()` is for debugging and ad-hoc requests.

## Testing Strategy

### Compile-Time Type Tests
- **Purpose**: Validate type inference works
- **Location**: `tests/*-type-inference.test.ts`
- **Run**: `npx tsc --noEmit` (must pass)

### Runtime Integration Tests
- **Purpose**: Validate actual SAP responses match schemas
- **Location**: `tests/e2e/*.test.ts` (future)
- **Run**: `npx nx test adt-client-v2` (when configured)

### Manual CLI Testing
- **Purpose**: Quick validation during development
- **Command**: `npx adt <command>` (see CLI commands)

## File Structure

```
packages/adt-client-v2/
├── src/
│   ├── adapter.ts              # HTTP adapter with session management
│   ├── contract.ts             # Main contract registry
│   ├── session.ts              # Session/CSRF/cookie management
│   ├── base/
│   │   ├── contract.ts         # Contract factory (adtHttp)
│   │   └── schema.ts           # Schema types and utilities
│   ├── adt/                    # Contracts organized by SAP endpoint path
│   │   ├── discovery/
│   │   │   ├── discovery-schema.ts
│   │   │   └── discovery-contract.ts
│   │   ├── oo/classes/
│   │   │   ├── classes-schema.ts
│   │   │   └── classes-contract.ts
│   │   └── core/http/
│   │       ├── sessions-schema.ts
│   │       ├── sessions-contract.ts
│   │       ├── systeminformation-schema.ts
│   │       └── systeminformation-contract.ts
│   └── plugins/                # Optional response transformers
│       ├── types.ts
│       ├── file-storage.ts
│       └── logging.ts
├── tests/
│   ├── type-inference.test.ts
│   ├── discovery-type-inference.test.ts
│   └── systeminformation-type-inference.test.ts
├── AGENTS.md                   # This file
└── SERVICE-ARCHITECTURE.md     # Architecture overview

```

## Key Dependencies

- **speci**: Contract-driven REST client with type inference
- **ts-xml**: Schema-driven XML parsing with type safety
- **adt-schemas**: Reusable SAP ADT XML schemas

## Migration from V1

When migrating from `adt-client` (v1):

1. **Don't rename packages yet** - keep both side-by-side
2. **Migrate service by service** - one CLI command at a time
3. **Create contract + schema** for each endpoint
4. **Add type inference test** before removing v1 code
5. **Update CLI command** to use v2 client
6. **Delete v1 code** only after v2 is tested and working

### Migration Status

**Migrated to V2** (CLI commands using `adt-client-v2`):
- ✅ `info` - Session and system information
- ✅ `fetch` - Generic authenticated HTTP requests
- ✅ `search` - ABAP object repository search
- ✅ `discovery` - Discovery service

**Still Using V1** (CLI commands using `adt-client`):
- ⏳ `get` - Uses `searchObjectsDetailed` from v1
- ⏳ `lock` - Uses `searchObjectsDetailed` from v1
- ⏳ `outline` - Uses `searchObjectsDetailed` from v1
- ⏳ `import/transport` - Uses `transport.getObjects()` and handlers from v1
- ⏳ Other commands - See `packages/adt-cli/src/lib/commands/`

**V1 Cleanup Workflow:**
1. Ensure v2 functionality is stable and tested
2. Identify all v1 usages: `grep -r "adt-client" packages/adt-cli/src/`
3. Remove unused v1 services/methods (e.g., if `searchObjectsDetailed` is fully replaced)
4. Track removal in this section
5. Only deprecate v1 package when all functionality is migrated

## Questions or Issues?

- Check [SERVICE-ARCHITECTURE.md](./docs/SERVICE-ARCHITECTURE.md) for architecture patterns
- See existing contracts in `src/adt/` for examples
- Review type inference tests in `tests/` for validation patterns
- Consult [CLAUDE.md](../../../CLAUDE.md) for project-wide guidelines
