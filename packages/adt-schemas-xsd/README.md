# adt-schemas-xsd

**ADT XML Schemas** - Type-safe SAP ADT schemas generated from official XSD definitions.

## What is it?

This package provides TypeScript schemas for SAP ADT (ABAP Development Tools) REST APIs, auto-generated from SAP's official XSD schema definitions using `ts-xsd`.

```typescript
import { adtcore, parse, type InferXsd } from 'adt-schemas-xsd';

// Full type inference from XSD!
type AdtCoreObject = InferXsd<typeof adtcore>;

// Parse XML with full type safety
const xml = `<adtcore:objectReference name="ZCL_MY_CLASS" uri="/sap/bc/adt/oo/classes/zcl_my_class"/>`;
const obj = parse(adtcore, xml);
console.log(obj.name); // ✅ typed as string
```

## Installation

```bash
bun add adt-schemas-xsd
```

## Usage

### Parse ADT XML

```typescript
import { adtcore, parse } from 'adt-schemas-xsd';

const xml = await fetch('/sap/bc/adt/oo/classes/zcl_my_class').then(r => r.text());
const data = parse(adtcore, xml);

console.log(data.name);        // Class name
console.log(data.uri);         // ADT URI
console.log(data.type);        // Object type
console.log(data.description); // Description
```

### Available Schemas

| Schema | Description |
|--------|-------------|
| `adtcore` | Core ADT object types (objectReference, etc.) |
| `abapsource` | ABAP source code structures |
| `abapoo` | ABAP OO types (classes, interfaces) |
| `cts` | Change and Transport System |
| `atc` | ABAP Test Cockpit |
| `activation` | Object activation |
| `discovery` | ADT discovery service |
| `repository` | Repository information |
| `transport` | Transport requests |
| `checkrun` | Check runs |
| `coverage` | Code coverage |
| `unittest` | Unit tests |

### Type Inference

```typescript
import { adtcore, type InferXsd } from 'adt-schemas-xsd';

// Get TypeScript type from schema
type AdtCoreObject = InferXsd<typeof adtcore>;

// Use in your code
function processObject(obj: AdtCoreObject) {
  console.log(obj.name);
}
```

## Development

### Regenerate Schemas

```bash
# Download XSD files from SAP
npx nx download adt-schemas-xsd

# Generate TypeScript from XSD
npx nx generate adt-schemas-xsd

# Build package
npx nx build adt-schemas-xsd
```

### Add New Schemas

Edit `scripts/generate.ts` and add schema names to `SCHEMAS_TO_GENERATE`:

```typescript
const SCHEMAS_TO_GENERATE = [
  'adtcore',
  'abapsource',
  // Add more schemas here
  'mynewschema',
];
```

## How It Works

1. **Download**: Uses `p2-cli` to download SAP ADT SDK from Eclipse update site
2. **Extract**: Extracts only `model/*.xsd` files (no Java code)
3. **Generate**: Uses `ts-xsd` with custom resolver to generate TypeScript
4. **Build**: Compiles to JavaScript with full type definitions

The custom resolver handles SAP's non-standard `platform:/plugin/...` URLs in `xsd:import` statements.

## License

MIT
