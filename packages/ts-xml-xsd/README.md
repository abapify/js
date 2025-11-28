# ts-xml-xsd

XSD schema definitions for ts-xml - parse and build XSD files using ts-xml itself!

## Overview

This package provides ts-xml schemas for parsing W3C XML Schema Definition (XSD) files. It's a perfect example of dogfooding - we use ts-xml to parse XSD, which itself defines XML schemas.

## Installation

```bash
bun add ts-xml-xsd
```

## Usage

```typescript
import { parse, XsdSchemaSchema, type XsdSchema } from 'ts-xml-xsd';
import { readFileSync } from 'fs';

// Parse an XSD file
const xsdContent = readFileSync('schema.xsd', 'utf-8');
const schema: XsdSchema = parse(XsdSchemaSchema, xsdContent);

// Access schema information
console.log('Target namespace:', schema.targetNamespace);
console.log('Complex types:', schema.complexTypes.map(t => t.name));
console.log('Root elements:', schema.elements.map(e => e.name));

// Iterate over types
for (const complexType of schema.complexTypes) {
  console.log(`Type: ${complexType.name}`);
  
  if (complexType.sequence) {
    for (const elem of complexType.sequence.elements) {
      console.log(`  - ${elem.name}: ${elem.type}`);
    }
  }
  
  for (const attr of complexType.attributes) {
    console.log(`  @ ${attr.name}: ${attr.type}`);
  }
}
```

## Available Schemas

| Schema | Description |
|--------|-------------|
| `XsdSchemaSchema` | Root `<xsd:schema>` element |
| `XsdComplexTypeSchema` | `<xsd:complexType>` definitions |
| `XsdSimpleTypeSchema` | `<xsd:simpleType>` definitions |
| `XsdElementSchema` | `<xsd:element>` declarations |
| `XsdAttributeSchema` | `<xsd:attribute>` declarations |
| `XsdSequenceSchema` | `<xsd:sequence>` compositor |
| `XsdChoiceSchema` | `<xsd:choice>` compositor |
| `XsdAllSchema` | `<xsd:all>` compositor |
| `XsdExtensionSchema` | `<xsd:extension>` for type derivation |
| `XsdRestrictionSchema` | `<xsd:restriction>` for type derivation |
| `XsdImportSchema` | `<xsd:import>` declarations |
| `XsdIncludeSchema` | `<xsd:include>` declarations |

## Type Exports

All schemas have corresponding TypeScript types:

```typescript
import type {
  XsdSchema,
  XsdComplexType,
  XsdSimpleType,
  XsdElement,
  XsdAttribute,
  XsdSequence,
  XsdExtension,
  // ... etc
} from 'ts-xml-xsd';
```

## Supported XSD Features

- ✅ Complex types with sequences, choices, all
- ✅ Simple types with restrictions (enumerations)
- ✅ Type inheritance (extension, restriction)
- ✅ Attributes with use, default, fixed
- ✅ Elements with minOccurs, maxOccurs
- ✅ Imports and includes
- ✅ Annotations and documentation
- ✅ Namespace handling

## Example: Extract Type Information

```typescript
import { parse, XsdSchemaSchema } from 'ts-xml-xsd';

const xsd = `
  <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
              targetNamespace="http://example.com">
    <xsd:complexType name="Person">
      <xsd:sequence>
        <xsd:element name="name" type="xsd:string"/>
        <xsd:element name="age" type="xsd:int"/>
      </xsd:sequence>
    </xsd:complexType>
  </xsd:schema>
`;

const schema = parse(XsdSchemaSchema, xsd);
const personType = schema.complexTypes.find(t => t.name === 'Person');

// personType.sequence.elements = [
//   { name: 'name', type: 'xsd:string' },
//   { name: 'age', type: 'xsd:int' }
// ]
```

## License

MIT
