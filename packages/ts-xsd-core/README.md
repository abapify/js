# @abapify/ts-xsd-core

Core XSD parser and builder with **1:1 TypeScript representation** of W3C XML Schema Definition (XSD) 1.1.

## Purpose

This package provides the foundation for working with XSD documents in TypeScript:

1. **Parse** XSD XML strings into typed `Schema` objects
2. **Build** XSD XML strings from typed `Schema` objects  
3. **Full roundtrip** support: `XSD → Schema → XSD`

It serves as the core layer for higher-level packages like `ts-xsd` (codegen) and `adt-schemas-xsd` (SAP ADT schemas).

## Design Principles

1. **Pure W3C XSD** - Types match the official XMLSchema.xsd exactly
2. **No shortcuts** - No invented properties or conveniences
3. **Full XSD 1.1 support** - Including assertions, alternatives, openContent
4. **99%+ test coverage** - Verified against W3C XMLSchema.xsd

## Installation

```bash
npm install @abapify/ts-xsd-core
```

## Usage

### Parse XSD to Schema

```typescript
import { parseXsd } from '@abapify/ts-xsd-core';

const xsd = `
  <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="root" type="xs:string"/>
  </xs:schema>
`;

const schema = parseXsd(xsd);
// schema.element[0].name === 'root'
```

### Build Schema to XSD

```typescript
import { buildXsd, type Schema } from '@abapify/ts-xsd-core';

const schema: Schema = {
  targetNamespace: 'http://example.com',
  element: [{ name: 'root', type: 'xs:string' }]
};

const xsd = buildXsd(schema);
// <?xml version="1.0"?><xs:schema ...>...</xs:schema>
```

### Build Options

```typescript
buildXsd(schema, {
  prefix: 'xsd',      // Use xsd: instead of xs: (default: 'xs')
  pretty: true,       // Pretty print with indentation (default: true)
  indent: '  '        // Indentation string (default: '  ')
});
```

## API

### `parseXsd(xsd: string): Schema`

Parse an XSD XML string into a typed Schema object.

### `buildXsd(schema: Schema, options?: BuildOptions): string`

Build an XSD XML string from a Schema object.

### Types

All types are derived from the W3C XMLSchema.xsd:

- `Schema` - xs:schema root element
- `TopLevelElement` / `LocalElement` - xs:element declarations
- `TopLevelComplexType` / `LocalComplexType` - xs:complexType definitions
- `TopLevelSimpleType` / `LocalSimpleType` - xs:simpleType definitions
- `ExplicitGroup` - xs:sequence / xs:choice / xs:all
- `Annotation`, `Documentation`, `Appinfo`
- `Restriction`, `Extension`, `List`, `Union`
- `Unique`, `Key`, `Keyref` - Identity constraints
- And more...

## File Structure

```
src/xsd/
├── types.ts    # TypeScript interfaces (W3C 1:1 mapping)
├── parse.ts    # XSD XML → Schema parser
├── build.ts    # Schema → XSD XML builder
└── index.ts    # Public exports
```

## Testing

```bash
# Run tests
npx nx test ts-xsd-core

# Run with coverage
npx nx test:coverage ts-xsd-core
```

Tests download the official W3C XMLSchema.xsd and verify full roundtrip parsing/building.

## Reference

- [W3C XML Schema 1.1 Part 1: Structures](https://www.w3.org/TR/xmlschema11-1/)
- [XMLSchema.xsd](https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd)
