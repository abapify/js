# ts-xsd E2E Tests

End-to-end tests for the `ts-xsd` package.

## What's Tested

1. **XSD Import** - Importing XSD schemas into TypeScript
2. **XML Parsing** - Parsing XML fixtures using generated schemas
3. **XML Building** - Building XML from typed objects
4. **Round-trip** - Verifying data integrity through parse → build → parse
5. **Type Safety** - Compile-time type checking

## Test Fixtures

- `fixtures/person.xsd` - Simple schema with attributes and optional elements
- `fixtures/person.xml` - Sample Person XML
- `fixtures/order.xsd` - Complex schema with nested types and arrays
- `fixtures/order.xml` - Sample Order XML with nested items

## Generated Schemas

- `src/schemas/person.ts` - TypeScript schema for Person
- `src/schemas/order.ts` - TypeScript schema for Order

## Running Tests

```bash
# From monorepo root
npx nx test e2e-ts-xsd

# Or directly with vitest
cd e2e/ts-xsd
npx vitest
```

## Regenerating Schemas

If you modify the XSD fixtures, regenerate the schemas:

```bash
npx ts-xsd import fixtures/person.xsd -o src/schemas/
npx ts-xsd import fixtures/order.xsd -o src/schemas/
```
