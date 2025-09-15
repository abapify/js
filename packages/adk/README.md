# @abapify/adk (ABAP Development Kit)

A modern TypeScript-first library for representing SAP ABAP objects with accurate ADT (ABAP Development Tools) XML parsing and serialization.

## Features

- 🎯 **TypeScript-First Design** - Clean, strongly typed ADT object representations
- 🔄 **Accurate XML Processing** - Faithful parsing and rendering of real ADT XML payloads
- 🏗️ **Minimalist Architecture** - Focused on representation, not communication
- ⚡ **Namespace-Aware** - Proper handling of ADT XML namespaces (adtcore, abapsource, atom)
- ✅ **Comprehensive Testing** - Full test coverage with real XML fixtures
- 📦 **Separation of Concerns** - ADK handles representation, ADT client handles communication

## Installation

```bash
npm install @abapify/adk
```

## Supported ABAP Objects

| Object Type   | Parse XML | Generate XML | TypeScript Types | Real XML Fixtures |
| ------------- | --------- | ------------ | ---------------- | ----------------- |
| **Interface** | ✅        | ✅           | ✅               | ✅                |
| **Class**     | ✅        | ✅           | ✅               | ✅                |
| **Domain**    | ✅        | ✅           | ✅               | ✅                |

## Quick Start

### Working with Interfaces

```typescript
import { Interface } from '@abapify/adk';

// Parse from real ADT XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<intf:abapInterface xmlns:intf="http://www.sap.com/adt/oo/interfaces"
    abapoo:modeled="false"
    abapsource:sourceUri="source/main"
    adtcore:name="ZIF_MY_INTERFACE"
    adtcore:type="INTF/OI"
    adtcore:description="My custom interface"
    xmlns:abapoo="http://www.sap.com/adt/oo"
    xmlns:abapsource="http://www.sap.com/adt/abapsource"
    xmlns:adtcore="http://www.sap.com/adt/core">
  <adtcore:packageRef adtcore:name="ZPACKAGE" adtcore:type="DEVC/K" />
</intf:abapInterface>`;

const intf = Interface.fromXml(xml);

// Access strongly typed properties
console.log(intf.name); // "ZIF_MY_INTERFACE"
console.log(intf.description); // "My custom interface"
console.log(intf.sourceUri); // "source/main"
console.log(intf.isModeled); // false

// Manage source code
intf.setSourceMain('interface ZIF_MY_INTERFACE public.\nendinterface.');
console.log(intf.getSourceMain());

// Generate XML back
const generatedXml = intf.toXml();
```

### Working with Classes

```typescript
import { Class } from '@abapify/adk';

// Create from constructor
const cls = new Class(
  {
    name: 'ZCL_MY_CLASS',
    type: 'CLAS/OC',
    description: 'My custom class',
    masterLanguage: 'EN',
    version: 'inactive',
  },
  { modeled: false },
  { sourceUri: 'source/main' }
);

// Access properties
console.log(cls.name); // "ZCL_MY_CLASS"
console.log(cls.isModeled); // false

// Parse from XML
const classXml = `<?xml version="1.0" encoding="UTF-8"?>
<class:abapClass xmlns:class="http://www.sap.com/adt/oo/classes"
    adtcore:name="ZCL_EXISTING_CLASS"
    adtcore:type="CLAS/OC"
    xmlns:adtcore="http://www.sap.com/adt/core">
</class:abapClass>`;

const parsedClass = Class.fromXml(classXml);
```

### Working with Domains

```typescript
import { Domain } from '@abapify/adk';

// Create domain with fixed values
const domain = new Domain(
  {
    name: 'ZDO_STATUS',
    type: 'DOMA/DD',
    description: 'Status domain',
    masterLanguage: 'EN',
  },
  {
    dataType: 'CHAR',
    length: 1,
    decimals: 0,
    fixedValues: [
      { lowValue: 'A', description: 'Active' },
      { lowValue: 'I', description: 'Inactive' },
    ],
  }
);

// Access domain properties
console.log(domain.dataType); // "CHAR"
console.log(domain.length); // 1
console.log(domain.fixedValues); // Array of fixed values

// Generate XML
const domainXml = domain.toXml();
```

## Architecture

### Core Concepts

The new ADK follows a **TypeScript-first, minimalist architecture** focused on accurate ADT XML representation:

**Base Class Pattern**: All ADT objects extend a common base class:

```typescript
abstract class AdtObject<TSections> {
  protected adtcore: AdtCoreAttributes;
  protected sections: TSections;
  protected packageRef?: PackageReference;
  protected links: AtomLink[] = [];

  // Common ADT properties
  get name(): string {
    return this.adtcore.name;
  }
  get type(): string {
    return this.adtcore.type;
  }
  get description(): string | undefined {
    return this.adtcore.description;
  }

  // Abstract methods for XML processing
  abstract toXml(): string;
  static fromXml<T extends AdtObject>(xml: string): T;
}
```

**Namespace-Specific Interfaces**: Clean separation of ADT XML namespaces:

```typescript
// adtcore namespace - common to all ADT objects
interface AdtCoreAttributes {
  name: string;
  type: string;
  description?: string;
  language?: string;
  masterLanguage?: string;
  responsible?: string;
  changedBy?: string;
  createdBy?: string;
  changedAt?: Date;
  createdAt?: Date;
  version?: 'active' | 'inactive';
}

// abapsource namespace - ABAP-specific attributes
interface AbapSourceAttributes {
  sourceUri: string;
  fixPointArithmetic?: boolean;
  activeUnicodeCheck?: boolean;
}

// atom namespace - link elements
interface AtomLink {
  href: string;
  rel: string;
  type?: string;
  title?: string;
  etag?: string;
}
```

**Typed Sections**: Object-specific data organized in sections:

```typescript
// Interface sections
interface InterfaceSections {
  sourceMain?: string; // Source code content
  syntaxConfiguration?: SyntaxConfiguration;
}

// Domain sections
interface DomainSections {
  dataType?: string;
  length?: number;
  decimals?: number;
  fixedValues?: DomainFixedValue[];
}
```

## API Reference

### Base Classes

#### `AdtObject<TSections>`

Abstract base class for all ADT objects with common properties and XML processing.

```typescript
abstract class AdtObject<TSections> {
  protected adtcore: AdtCoreAttributes;
  protected sections: TSections;
  protected packageRef?: PackageReference;
  protected links: AtomLink[] = [];

  // Common getters
  get name(): string;
  get type(): string;
  get description(): string | undefined;
  get language(): string | undefined;
  get masterLanguage(): string | undefined;
  get responsible(): string | undefined;
  get changedBy(): string | undefined;
  get createdBy(): string | undefined;
  get changedAt(): Date | undefined;
  get createdAt(): Date | undefined;
  get version(): 'active' | 'inactive' | undefined;

  // Package and links
  get packageRef(): PackageReference | undefined;
  get links(): AtomLink[];

  // Sections access
  getSections(): TSections;

  // Abstract methods (must be implemented by concrete classes)
  abstract toXml(): string;
  static fromXml<T extends AdtObject>(xml: string): T;
}
```

### Concrete ADT Objects

#### `Interface`

ABAP Interface ADT object with proper TypeScript types.

```typescript
class Interface extends AdtObject<InterfaceSections> {
  constructor(
    adtcore: AdtCoreAttributes,
    abapoo: { modeled: boolean },
    abapsource: AbapSourceAttributes,
    sections?: InterfaceSections
  );

  // ABAP-specific getters
  get sourceUri(): string;
  get isModeled(): boolean;
  get fixPointArithmetic(): boolean | undefined;
  get activeUnicodeCheck(): boolean | undefined;

  // Source management
  getSourceMain(): string | undefined;
  setSourceMain(source: string): void;

  // XML processing
  toXml(): string;
  static fromXml(xml: string): Interface;
}
```

#### `Class`

ABAP Class ADT object following the same pattern as Interface.

```typescript
class Class extends AdtObject<ClassSections> {
  constructor(
    adtcore: AdtCoreAttributes,
    abapoo: { modeled: boolean },
    abapsource: AbapSourceAttributes,
    sections?: ClassSections
  );

  // Same interface as Interface class
  get sourceUri(): string;
  get isModeled(): boolean;
  getSourceMain(): string | undefined;
  setSourceMain(source: string): void;

  toXml(): string;
  static fromXml(xml: string): Class;
}
```

#### `Domain`

ABAP Domain ADT object with domain-specific properties.

```typescript
class Domain extends AdtObject<DomainSections> {
  constructor(adtcore: AdtCoreAttributes, sections?: DomainSections);

  // Domain-specific getters
  get dataType(): string | undefined;
  get length(): number | undefined;
  get decimals(): number | undefined;
  get outputLength(): number | undefined;
  get conversionExit(): string | undefined;
  get valueTable(): string | undefined;
  get fixedValues(): DomainFixedValue[];

  toXml(): string;
  static fromXml(xml: string): Domain;
}

interface DomainFixedValue {
  lowValue: string;
  highValue?: string;
  description?: string;
}
```

## Advanced Usage

### Custom Object Types

Extend the ADK to support additional ABAP object types by following the established pattern:

```typescript
// 1. Define sections interface
interface TableSections {
  sourceMain?: string;
  fields?: TableField[];
  keys?: TableKey[];
}

// 2. Create ADT object class
class Table extends AdtObject<TableSections> {
  constructor(adtcore: AdtCoreAttributes, sections: TableSections = {}) {
    super(adtcore, sections);
  }

  // Table-specific getters
  get fields(): TableField[] {
    return this.sections.fields || [];
  }
  get keys(): TableKey[] {
    return this.sections.keys || [];
  }

  // XML processing
  toXml(): string {
    // Generate table XML following ADT format
    return `<?xml version="1.0" encoding="UTF-8"?>
<ddic:table xmlns:ddic="http://www.sap.com/adt/ddic"
    adtcore:name="${this.name}"
    adtcore:type="TABL/DT"
    xmlns:adtcore="http://www.sap.com/adt/core">
  <!-- Table-specific XML content -->
</ddic:table>`;
  }

  static fromXml(xml: string): Table {
    const parsed = AdtObject.parseXml(xml);
    // Parse table-specific XML structure
    // Return new Table instance
  }
}
```

### Round-trip XML Processing

The ADK ensures data integrity through parse → serialize → parse cycles:

```typescript
// Parse original ADT XML
const original = Interface.fromXml(adtXml);

// Serialize back to XML
const serializedXml = original.toXml();

// Parse serialized XML
const reparsed = Interface.fromXml(serializedXml);

// Verify key attributes are preserved
console.assert(reparsed.name === original.name);
console.assert(reparsed.sourceUri === original.sourceUri);
console.assert(reparsed.packageRef?.name === original.packageRef?.name);
```

### Integration with ADT Client

The ADK is designed to work seamlessly with ADT client libraries:

```typescript
import { AdtClient } from '@abapify/adt-client';
import { Interface } from '@abapify/adk';

const client = new AdtClient(/* connection config */);

// Fetch interface XML from ADT
const xml = await client.getObject('ZIF_MY_INTERFACE');

// Parse to ADK object
const intf = Interface.fromXml(xml);

// Modify source code
intf.setSourceMain(
  'interface ZIF_MY_INTERFACE public.\n  methods: process.\nendinterface.'
);

// Generate updated XML
const updatedXml = intf.toXml();

// Send back to ADT
await client.updateObject('ZIF_MY_INTERFACE', updatedXml);
```

## Error Handling

The ADK provides clear error messages for XML parsing and validation issues:

```typescript
try {
  const intf = Interface.fromXml(invalidXml);
} catch (error) {
  if (error.message.includes('missing')) {
    // Handle missing required XML elements
    console.error('Required XML element missing:', error.message);
  } else if (error.message.includes('Invalid ADT object')) {
    // Handle invalid XML structure
    console.error('XML structure invalid:', error.message);
  }
}

// Validate parsed objects
function validateInterface(intf: Interface): boolean {
  return intf.name && intf.type === 'INTF/OI' && intf.sourceUri;
}
```

## Testing

Run the test suite:

```bash
# Run all ADK tests
npm run test

# Run specific test files
npx vitest run src/adt/oo/interfaces/interface.test.ts --reporter=basic
npx vitest run src/adt/oo/classes/class.test.ts --reporter=basic
npx vitest run src/adt/ddic/domains/domain.test.ts --reporter=basic
```

Example test structure using real XML fixtures:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Interface } from './interface';

describe('Interface', () => {
  let realXmlFixture: string;

  beforeEach(() => {
    // Load real ADT XML fixture
    realXmlFixture = readFileSync(
      join(__dirname, '../../../../fixtures/zif_test.intf.xml'),
      'utf-8'
    );
  });

  it('should parse Interface from real ADT XML', () => {
    const intf = Interface.fromXml(realXmlFixture);

    expect(intf.name).toBe('ZIF_PEPL_TEST_NESTED1');
    expect(intf.type).toBe('INTF/OI');
    expect(intf.sourceUri).toBe('source/main');
    expect(intf.isModeled).toBe(false);
  });

  it('should maintain data integrity through round-trip processing', () => {
    const original = Interface.fromXml(realXmlFixture);
    const serialized = original.toXml();
    const reparsed = Interface.fromXml(serialized);

    expect(reparsed.name).toBe(original.name);
    expect(reparsed.sourceUri).toBe(original.sourceUri);
  });
});
```

## Development

### Building

```bash
npm run build
```

### Architecture Guidelines

1. **Type Safety**: All specifications must be strongly typed
2. **Error Handling**: Provide clear, actionable error messages
3. **Extensibility**: Use abstract base classes and interfaces
4. **Testing**: Maintain >95% test coverage
5. **Documentation**: Document all public APIs

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

## Integration Examples

### With Build Tools

```typescript
// rollup.config.js
import { DomainAdtAdapter } from '@abapify/adk';

export default {
  plugins: [
    {
      name: 'abap-domain-generator',
      generateBundle() {
        const domains = loadDomainSpecs();
        domains.forEach((spec) => {
          const adapter = new DomainAdtAdapter(spec);
          const xml = adapter.toAdtXML();
          this.emitFile({
            type: 'asset',
            fileName: `domains/${spec.metadata.name}.xml`,
            source: xml,
          });
        });
      },
    },
  ],
};
```

### With REST APIs

```typescript
import express from 'express';
import { DomainAdtAdapter } from '@abapify/adk';

const app = express();

app.post('/api/domains', (req, res) => {
  try {
    const spec = req.body;
    const adapter = new DomainAdtAdapter(spec);
    const xml = adapter.toAdtXML();

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/domains/:name', (req, res) => {
  const xml = req.body;
  const spec = DomainAdtAdapter.fromAdtXML(xml);

  // Update domain in database
  updateDomain(spec);

  res.json({ success: true, name: spec.metadata.name });
});
```

## Comparison with Other Tools

| Feature       | @abapify/adk         | abapGit XML         | Manual ADT |
| ------------- | -------------------- | ------------------- | ---------- |
| Type Safety   | ✅ Strong typing     | ❌ Raw XML          | ❌ Manual  |
| Bidirectional | ✅ Generate + Parse  | ✅ Parse only       | ❌ Manual  |
| Validation    | ✅ Compile-time      | ❌ Runtime          | ❌ Manual  |
| IDE Support   | ✅ Full IntelliSense | ❌ Limited          | ❌ None    |
| Testing       | ✅ Unit testable     | ❌ Integration only | ❌ Manual  |
| Documentation | ✅ Generated docs    | ❌ Wiki-based       | ❌ Manual  |

## Performance

- **Build Size**: ~66KB (19KB gzipped)
- **Runtime**: Zero dependencies after build
- **Memory**: Efficient object creation with minimal overhead
- **Parsing**: Fast XML processing with streaming support

## Roadmap

- **v0.1.0**: Core Domain, Class, Interface support ✅
- **v0.2.0**: Table and Structure support
- **v0.3.0**: Function Module and Program support
- **v0.4.0**: Enhancement and Extension support
- **v1.0.0**: Complete SAP object type coverage

## License

MIT - see [LICENSE](../../LICENSE) file for details.

## Related Projects

- [@abapify/adt-cli](../adt-cli) - Command-line interface for SAP ADT operations
- [@abapify/cds2abap](../cds2abap) - Convert SAP CDS models to ABAP objects
- [@abapify/components](../components) - Reusable UI components for ABAP development

## Support

- 📖 [Documentation](https://abapify.dev/docs/adk)
- 🐛 [Issue Tracker](https://github.com/abapify/js/issues)
- 💬 [Discussions](https://github.com/abapify/js/discussions)
- 📧 [Email Support](mailto:support@abapify.dev)
