# adt-schemas-xsd

**ADT XML Schemas** - Type-safe SAP ADT schemas generated from official XSD definitions, with built-in `parse`/`build` methods for [speci](https://github.com/abapify/speci) integration.

## What is it?

This package provides TypeScript schemas for SAP ADT (ABAP Development Tools) REST APIs, auto-generated from SAP's official XSD schema definitions using `ts-xsd` with the factory generator pattern.

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
