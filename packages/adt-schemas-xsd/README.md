# adt-schemas-xsd

**ADT XML Schemas** - Type-safe SAP ADT schemas generated from official XSD definitions, with built-in `parse`/`build` methods for [speci](../speci/README.md) integration.

Part of the **ADT Toolkit** - see [main README](../../README.md) for architecture overview.

## What is it?

This package provides TypeScript schemas for SAP ADT (ABAP Development Tools) REST APIs, auto-generated from SAP's official XSD schema definitions using [ts-xsd](../ts-xsd/README.md) with the factory generator pattern.

**Key Role**: This is the **single source of truth** for ADT types. All type definitions flow from XSD → TypeScript, eliminating manual type maintenance.

Each schema is pre-wrapped with `parse()` and `build()` methods, making them directly usable in speci contracts for automatic type inference.

```typescript
import { schemas } from 'adt-schemas-xsd';

// Schemas have parse/build methods built-in
const data = schemas.configurations.parse(xmlString);
// data is fully typed as InferXsd<typeof configurations>

// Use directly in speci contracts - type is automatically inferred
const contract = {
  get: () => http.get('/endpoint', {
    responses: { 200: schemas.configurations },
  }),
};
```

## Installation

```bash
bun add adt-schemas-xsd
```

## Usage

### With speci Contracts

The primary use case - schemas work directly with speci for type-safe REST contracts:

```typescript
import { schemas } from 'adt-schemas-xsd';
import { http } from 'speci/rest';

// Response type is automatically inferred from schema
const configurationsContract = {
  get: () => http.get('/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations', {
    responses: { 200: schemas.configurations },
  }),
};
```

### Direct Parsing

Parse ADT XML responses directly:

```typescript
import { schemas } from 'adt-schemas-xsd';

const xml = await fetch('/sap/bc/adt/cts/transportrequests').then(r => r.text());
const data = schemas.transportmanagment.parse(xml);

// data is fully typed
console.log(data.request?.requestHeader?.trRequestId);
```

### Build XML

Build XML from typed objects:

```typescript
import { schemas } from 'adt-schemas-xsd';

const xml = schemas.transportmanagment.build({
  request: {
    requestHeader: {
      trRequestId: 'DEVK900001',
      trDescription: 'My transport',
    },
  },
});
```

### Available Schemas

| Schema | Description |
|--------|-------------|
| `schemas.adtcore` | Core ADT object types (objectReference, etc.) |
| `schemas.atom` | Atom feed format (links, categories) |
| `schemas.abapsource` | ABAP source code structures |
| `schemas.abapoo` | ABAP OO types (classes, interfaces) |
| `schemas.classes` | Class metadata |
| `schemas.interfaces` | Interface metadata |
| `schemas.transportmanagment` | Transport requests and tasks |
| `schemas.transportsearch` | Transport search results |
| `schemas.configurations` | Search configurations |
| `schemas.configuration` | Single configuration |
| `schemas.atc` | ABAP Test Cockpit |
| `schemas.atcworklist` | ATC worklist |
| `schemas.atcresult` | ATC results |
| `schemas.checkrun` | Check runs |
| `schemas.checklist` | Check lists |

### Type Inference

```typescript
import { schemas, type InferXsd } from 'adt-schemas-xsd';

// Get TypeScript type from schema
type Configurations = InferXsd<typeof schemas.configurations>;

// Use in your code
function processConfigs(configs: Configurations) {
  const configArray = Array.isArray(configs.configuration) 
    ? configs.configuration 
    : [configs.configuration];
  // ...
}
```

### Using Raw Schemas

If you need the raw schema without parse/build methods:

```typescript
import { schemas } from 'adt-schemas-xsd';

// schemas.configurations is already wrapped
// Access the underlying schema structure
console.log(schemas.configurations.ns);       // namespace
console.log(schemas.configurations.root);     // root element
console.log(schemas.configurations.elements); // element definitions
```

### Custom Schema Wrapping

Use the schema factory for custom wrapping:

```typescript
import { schema, type XsdSchema } from 'adt-schemas-xsd';

// Wrap your own schema with parse/build
const mySchema = schema({
  ns: 'http://example.com/custom',
  root: 'MyRoot',
  elements: {
    MyRoot: {
      sequence: [{ name: 'field', type: 'string' }],
    },
  },
} as const satisfies XsdSchema);

// Now mySchema has parse() and build() methods
const data = mySchema.parse(xml);
```

## Architecture

```
adt-schemas-xsd/
├── src/
│   ├── index.ts          # Main exports (schemas, schema factory)
│   ├── speci.ts          # Schema factory (wraps with parse/build)
│   └── schemas/
│       ├── index.ts      # Generated: exports all schemas
│       └── generated/    # Generated: individual schema files
│           ├── configurations.ts
│           ├── atom.ts
│           └── ...
```

### How It Works

1. **Download**: XSD files are downloaded from SAP ADT SDK
2. **Generate**: `ts-xsd` factory generator creates TypeScript files
3. **Wrap**: Each schema imports the `speci.ts` factory and wraps itself
4. **Export**: `schemas/index.ts` re-exports all wrapped schemas

Generated schema files look like:

```typescript
// schemas/generated/configurations.ts
import schema from '../../speci';
import Atom from './atom';
import Configuration from './configuration';

export default schema({
  ns: 'http://www.sap.com/adt/configurations',
  root: 'Configurations',
  include: [Atom, Configuration],
  elements: { ... },
});
```

## Manual Schemas for ABAP XML Format

Some SAP endpoints return ABAP XML format (`asx:abap` envelope) which doesn't have official XSD definitions. For these, create manual schemas in `src/schemas/manual/`:

### Creating a Manual Schema

```typescript
// src/schemas/manual/transportfind.ts
import schema from '../../speci';

export default schema({
  ns: 'http://www.sap.com/abapxml',
  prefix: 'asx',
  root: 'abap',  // Element name WITHOUT namespace prefix
  elements: {
    abap: {
      sequence: [{ name: 'values', type: 'values' }],
      attributes: [{ name: 'version', type: 'string' }],
    },
    values: {
      sequence: [{ name: 'DATA', type: 'DATA' }],
    },
    DATA: {
      sequence: [
        { name: 'CTS_REQ_HEADER', type: 'CTS_REQ_HEADER', minOccurs: 0, maxOccurs: 'unbounded' },
      ],
    },
    CTS_REQ_HEADER: {
      sequence: [
        { name: 'TRKORR', type: 'string' },
        { name: 'TRFUNCTION', type: 'string' },
        // ... more fields
      ],
    },
  },
} as const);  // CRITICAL: 'as const' is required for proper type inference!
```

### Key Points for ABAP XML Schemas

1. **ALWAYS use `as const`**: Required for TypeScript to infer literal types from the schema definition
2. **Element names WITHOUT namespace prefix**: Use `'abap'`, `'values'` - NOT `'asx:abap'`, `'asx:values'`
3. **Root element content is parsed directly**: The parsed result is the content of the root element, not wrapped in it
4. **Export from index**: Add to `src/schemas/index.ts`:
   ```typescript
   export { default as transportfind } from './manual/transportfind';
   ```

### Parsed Structure

For XML like:
```xml
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
    <DATA><CTS_REQ_HEADER>...</CTS_REQ_HEADER></DATA>
  </asx:values>
</asx:abap>
```

ts-xsd parses to:
```javascript
{
  version: "1.0",           // Root element attributes
  values: {                 // Root element content (no 'abap' wrapper)
    DATA: {
      CTS_REQ_HEADER: [...]
    }
  }
}
```

## Development

### Regenerate Schemas

```bash
# Download XSD files from SAP
npx nx download adt-schemas-xsd

# Generate TypeScript from XSD (uses factory generator)
npx nx generate adt-schemas-xsd

# Build package
npx nx build adt-schemas-xsd
```

### Add New Schemas

Edit `schemas.config.ts` and add schema names:

```typescript
export const schemas = [
  'adtcore',
  'atom',
  // Add more schemas here
  'mynewschema',
];
```

### Customize Generation

The generate script uses `ts-xsd` factory generator:

```typescript
// scripts/generate.ts
import { generateFromXsd, factoryGenerator } from 'ts-xsd/codegen';

const result = generateFromXsd(
  xsdContent,
  { resolver: resolveImport, importedSchemas },
  factoryGenerator,
  { factory: '../../speci' }  // Path to speci.ts factory
);
```

## Integration with speci

This package is designed to work seamlessly with [speci](https://github.com/abapify/speci) for type-safe REST contracts. The `Serializable` interface from speci is used:

```typescript
interface Serializable<T> {
  parse(raw: string): T;
  build?(data: T): string;
}
```

speci's `InferSchema` type automatically infers the response type from the `parse()` method's return type, enabling full type safety in contracts.

## License

MIT
