# ts-xsd-v2

TypeScript representation of W3C XML Schema Definition (XSD) 1.1

## Goal

Create a **1:1 TypeScript representation** of the official W3C XMLSchema.xsd:
https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd

## Design Principles

1. **Pure W3C XSD** - Types match the official XMLSchema.xsd exactly
2. **No shortcuts** - No ts-xsd conveniences or invented properties
3. **Self-hosting** - The schema can describe itself
4. **Type inference** - Parse XSD files and get typed results

## Structure

```
src/xsd/
├── types.ts        # TypeScript interfaces matching W3C XSD spec
├── schema.ts       # XSD_SCHEMA constant (W3C-compliant)
├── XMLSchema.xsd   # Reference: official W3C schema
└── index.ts        # Exports
```

## Key Types

All types are derived from the W3C XMLSchema.xsd:

- `Schema` - xs:schema root element
- `TopLevelElement` / `LocalElement` - xs:element declarations
- `TopLevelComplexType` / `LocalComplexType` - xs:complexType definitions
- `TopLevelSimpleType` / `LocalSimpleType` - xs:simpleType definitions
- `ExplicitGroup` - xs:sequence / xs:choice
- `All` - xs:all
- And more...

## Usage

```typescript
import { Schema, TopLevelComplexType } from 'ts-xsd-v2';

// Types match W3C XSD structure exactly
const schema: Schema = {
  targetNamespace: 'http://example.com',
  element: [
    { name: 'Root', type: 'RootType' }
  ],
  complexType: [
    {
      name: 'RootType',
      sequence: {
        element: [
          { name: 'field', type: 'xs:string' }
        ]
      }
    }
  ]
};
```

## Reference

- [W3C XML Schema 1.1 Part 1: Structures](https://www.w3.org/TR/xmlschema11-1/)
- [XMLSchema.xsd](https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd)
