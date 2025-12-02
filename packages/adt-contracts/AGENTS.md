# adt-contracts - AI Agent Guide

## Overview

Type-safe SAP ADT REST API contracts using `speci` + `adt-schemas-xsd`.

## Contract Testing Framework

### Purpose

Tests contract **definitions** (not HTTP calls):
- **Method** - GET, POST, PUT, DELETE
- **Path** - URL pattern with parameters
- **Headers** - Accept, Content-Type
- **Query** - URL parameters
- **Body** - Request schema (for POST/PUT)
- **Response** - Response schema per status code

### Why No Mocks?

Contracts are plain objects describing endpoints. No HTTP client needed:

```typescript
// Contract returns a descriptor object
const contract = transportrequests.get('DEVK900001');

// Test the definition directly
expect(contract.method).toBe('GET');
expect(contract.path).toBe('/sap/bc/adt/cts/transportrequests/DEVK900001');
expect(contract.responses[200]).toBe(transportmanagmentSingle);
```

Type safety is verified at compile time - if the test file compiles, types are correct.

### Structure

```
tests/
├── contracts.test.ts      # Generic test runner
└── contracts/
    ├── base.ts            # ContractScenario base class
    ├── index.ts           # Scenario registry
    ├── cts.ts             # CTS contract scenarios
    ├── atc.ts             # ATC contract scenarios
    ├── discovery.ts       # Discovery contract scenarios
    ├── oo.ts              # OO contract scenarios
    └── packages.ts        # Packages contract scenarios
```

### Creating a Scenario

```typescript
// tests/contracts/myapi.ts
import { ContractScenario, type ContractOperation } from './base';
import { myContract } from '../../src/adt/myapi';
import { mySchema } from '@abapify/adt-schemas-xsd';
import { fixtures } from 'adt-fixtures';

export class MyApiScenario extends ContractScenario {
  readonly name = 'My API';
  
  readonly operations: ContractOperation[] = [
    {
      name: 'get item',
      contract: () => myContract.get('ID123'),
      method: 'GET',
      path: '/sap/bc/adt/myapi/ID123',
      headers: { Accept: 'application/xml' },
      response: {
        status: 200,
        schema: mySchema,
        fixture: fixtures.myapi.item,  // Optional: test parsing
      },
    },
    {
      name: 'create item',
      contract: () => myContract.create(),
      method: 'POST',
      path: '/sap/bc/adt/myapi',
      headers: {
        Accept: 'application/xml',
        'Content-Type': 'application/xml',
      },
      body: {
        schema: mySchema,
        fixture: fixtures.myapi.create,  // Optional: test round-trip
      },
      response: { status: 200, schema: mySchema },
    },
  ];
}
```

Register in `tests/contracts/index.ts`:
```typescript
import { MyApiScenario } from './myapi';
export const SCENARIOS = [..., new MyApiScenario()];
```

### What Gets Tested

| Test | When |
|------|------|
| `has correct method` | Always |
| `has correct path` | Always |
| `has correct headers` | If `headers` defined |
| `has correct query params` | If `query` defined |
| `has body schema` | If `body` defined |
| `body schema parses fixture` | If `body.fixture` defined |
| `body schema round-trips` | If `body.fixture` + schema has `build` |
| `has response schema for N` | If `response` defined |
| `response schema parses fixture` | If `response.fixture` defined |

### Fixtures

Use `adt-fixtures` for real SAP XML samples:

```typescript
import { fixtures } from 'adt-fixtures';

// Type-safe fixture access
fixtures.transport.single    // GET transport response
fixtures.transport.create    // POST create request
fixtures.atc.worklist        // ATC worklist
fixtures.atc.result          // ATC result
```

## Contract Areas

| Area | Path | Schemas Used |
|------|------|--------------|
| **CTS** | `/sap/bc/adt/cts/` | `transportmanagment*`, `transportfind` |
| **ATC** | `/sap/bc/adt/atc/` | `atcworklist` |
| **Discovery** | `/sap/bc/adt/discovery` | `discovery` |
| **OO** | `/sap/bc/adt/oo/` | `classes`, `interfaces` |
| **Packages** | `/sap/bc/adt/packages/` | `packagesV1` |

## Running Tests

```bash
# From root workspace
npx nx test adt-contracts

# Or directly
cd packages/adt-contracts
npx vitest run
```

## Adding New Contracts

1. Create contract in `src/adt/{area}/`
2. Import schema from `@abapify/adt-schemas-xsd`
3. Create scenario in `tests/contracts/{area}.ts`
4. Register in `tests/contracts/index.ts`
5. Add fixture to `adt-fixtures` if needed
