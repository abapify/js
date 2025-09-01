# @abapify/adk (ABAP Development Kit)

A comprehensive TypeScript library for modeling, generating, and parsing ABAP objects with SAP ADT (ABAP Development Tools) XML support.

## Features

- 🎯 **Type-Safe ABAP Object Modeling** - Strongly typed specifications for ABAP objects
- 🔄 **Bidirectional ADT Transformation** - Generate and parse SAP ADT XML format
- 🏗️ **Extensible Architecture** - Clean adapter pattern for multiple output formats
- ⚡ **Modern Build System** - Built with tsdown for optimal performance
- ✅ **Comprehensive Testing** - Full test coverage with Vitest
- 📦 **Zero Runtime Dependencies** - Only XML processing dependencies

## Installation

```bash
npm install @abapify/adk
```

## Supported ABAP Objects

| Object Type   | Generate XML | Parse XML | Spec Definition                     |
| ------------- | ------------ | --------- | ----------------------------------- |
| **Domain**    | ✅           | ✅        | Complete type and value information |
| **Class**     | ✅           | ✅        | Methods, attributes, events, types  |
| **Interface** | ✅           | ✅        | Abstract methods, events, types     |

## Quick Start

### Working with Domains

```typescript
import { DomainAdtAdapter, Kind } from '@abapify/adk';

// Create a domain specification
const domainSpec = {
  kind: Kind.Domain,
  metadata: {
    name: 'Z_STATUS_DOMAIN',
    description: 'Status values for custom applications',
  },
  spec: {
    typeInformation: {
      datatype: 'CHAR',
      length: 1,
      decimals: 0,
    },
    outputInformation: {
      length: 1,
      style: 'UPPER',
      signExists: false,
      lowercase: false,
      ampmFormat: false,
    },
    valueInformation: {
      appendExists: false,
      fixValues: [
        { position: 1, low: 'A', text: 'Active' },
        { position: 2, low: 'I', text: 'Inactive' },
        { position: 3, low: 'P', text: 'Pending' },
      ],
    },
  },
};

// Generate ADT XML
const adapter = new DomainAdtAdapter(domainSpec);
const xml = adapter.toAdtXML();
console.log(xml);

// Parse ADT XML back to specification
const parsedSpec = DomainAdtAdapter.fromAdtXML(xml);
```

### Working with Classes

```typescript
import { ClassAdtAdapter, Kind } from '@abapify/adk';

const classSpec = {
  kind: Kind.Class,
  metadata: {
    name: 'ZCL_UTILITY_CLASS',
    description: 'Utility class for common operations',
  },
  spec: {
    visibility: 'PUBLIC' as const,
    isFinal: false,
    isAbstract: false,
    superclass: 'CL_OBJECT',
    interfaces: ['ZIF_LOGGER'],
    components: {
      methods: [
        {
          name: 'CONSTRUCTOR',
          visibility: 'PUBLIC' as const,
          isStatic: false,
          isAbstract: false,
          isFinal: false,
          parameters: [
            {
              name: 'IV_CONFIG',
              type: 'IMPORTING' as const,
              dataType: 'STRING',
              isOptional: true,
              description: 'Configuration parameter',
            },
          ],
          exceptions: ['CX_SY_CREATE_OBJECT_ERROR'],
          description: 'Class constructor',
        },
      ],
      attributes: [
        {
          name: 'MV_CONFIG',
          visibility: 'PRIVATE' as const,
          isStatic: false,
          isReadOnly: false,
          dataType: 'STRING',
          description: 'Configuration data',
        },
      ],
      events: [],
      types: [],
    },
  },
};

const adapter = new ClassAdtAdapter(classSpec);
const xml = adapter.toAdtXML();
```

### Working with Interfaces

```typescript
import { InterfaceAdtAdapter, Kind } from '@abapify/adk';

const interfaceSpec = {
  kind: Kind.Interface,
  metadata: {
    name: 'ZIF_DATA_PROCESSOR',
    description: 'Interface for data processing operations',
  },
  spec: {
    category: 'IF' as const,
    interfaces: [], // No parent interfaces
    components: {
      methods: [
        {
          name: 'PROCESS_DATA',
          isAbstract: true,
          parameters: [
            {
              name: 'IT_DATA',
              type: 'IMPORTING' as const,
              dataType: 'TY_DATA_TABLE',
              isOptional: false,
            },
            {
              name: 'RT_RESULT',
              type: 'RETURNING' as const,
              dataType: 'TY_RESULT_TABLE',
              isOptional: false,
            },
          ],
          exceptions: ['CX_PROCESSING_ERROR'],
          description: 'Process input data and return results',
        },
      ],
      attributes: [],
      events: [],
      types: [
        {
          name: 'TY_DATA_TABLE',
          definition: 'TABLE OF STRING',
          description: 'Input data table type',
        },
      ],
    },
  },
};

const adapter = new InterfaceAdtAdapter(interfaceSpec);
const xml = adapter.toAdtXML();
```

## Architecture

### Core Concepts

**Spec Pattern**: All ABAP objects follow a consistent specification pattern:

```typescript
type Spec<T, K extends Kind = Kind> = {
  kind: K; // Object type (Domain, Class, Interface)
  metadata: {
    // Common metadata
    name: string;
    description?: string;
  };
  spec: T; // Object-specific specification
};
```

**Adapter Pattern**: Each object type has an adapter for different output formats:

```
BaseAdapter
├── AdtAdapter (abstract)
    ├── DomainAdtAdapter
    ├── ClassAdtAdapter
    └── InterfaceAdtAdapter
```

### Object Type System

```typescript
// Strongly typed kinds
enum Kind {
  Domain = 'Domain',
  Class = 'Class',
  Interface = 'Interface',
}

// Type-safe specifications
type DomainSpec = Spec<Domain, Kind.Domain>;
type ClassSpec = Spec<Class, Kind.Class>;
type InterfaceSpec = Spec<Interface, Kind.Interface>;
```

## API Reference

### Base Classes

#### `AdtAdapter<T>`

Abstract base class for ADT format adapters.

```typescript
abstract class AdtAdapter<T extends Spec<unknown, Kind>> {
  // Generate ADT object structure
  abstract toAdt(): Record<string, unknown>;

  // Parse ADT object to specification
  abstract fromAdt(adtObject: Record<string, unknown>): T;

  // Generate ADT XML string
  toAdtXML(): string;

  // Parse ADT XML to specification (static method)
  static fromAdtXML<TSpec>(xml: string): TSpec;

  // Get ADT core metadata
  get adtcore(): Record<string, unknown>;
}
```

### Domain Objects

#### `DomainSpec`

Complete domain specification with type, output, and value information.

```typescript
interface Domain {
  typeInformation: {
    datatype: string; // ABAP data type (CHAR, NUMC, etc.)
    length: number; // Field length
    decimals: number; // Decimal places
  };
  outputInformation: {
    length: number; // Output length
    style: string; // Output style
    conversionExit?: string; // Conversion exit
    signExists: boolean; // Sign indicator
    lowercase: boolean; // Allow lowercase
    ampmFormat: boolean; // AM/PM time format
  };
  valueInformation: {
    valueTableRef?: string; // Value table reference
    appendExists: boolean; // Append structure exists
    fixValues: Array<{
      // Fixed values
      position: number;
      low: string;
      high?: string;
      text: string;
    }>;
  };
}
```

#### `DomainAdtAdapter`

```typescript
class DomainAdtAdapter extends AdtAdapter<DomainSpec> {
  toAdt(): Record<string, unknown>;
  fromAdt(adtObject: Record<string, unknown>): DomainSpec;
}
```

### Class Objects

#### `ClassSpec`

Complete class specification with all OOP features.

```typescript
interface Class {
  visibility: 'PUBLIC' | 'PRIVATE';
  isFinal: boolean;
  isAbstract: boolean;
  superclass?: string;
  interfaces: string[];
  components: {
    methods: ClassMethod[];
    attributes: ClassAttribute[];
    events: ClassEvent[];
    types: ClassType[];
  };
}
```

#### Method Parameters

```typescript
interface MethodParameter {
  name: string;
  type: 'IMPORTING' | 'EXPORTING' | 'CHANGING' | 'RETURNING';
  dataType: string;
  isOptional: boolean;
  defaultValue?: string;
  description?: string;
}
```

### Interface Objects

#### `InterfaceSpec`

Interface specification with abstract methods and components.

```typescript
interface Interface {
  category: 'IF' | 'CA'; // Interface or Category
  interfaces: string[]; // Parent interfaces
  components: {
    methods: InterfaceMethod[];
    attributes: InterfaceAttribute[];
    events: InterfaceEvent[];
    types: InterfaceType[];
  };
}
```

## Advanced Usage

### Custom Object Types

Extend the ADK to support additional ABAP object types:

```typescript
// 1. Add to Kind enum
enum Kind {
  Domain = 'Domain',
  Class = 'Class',
  Interface = 'Interface',
  Table = 'Table', // New object type
}

// 2. Define specification
interface Table {
  fields: TableField[];
  keys: TableKey[];
}

type TableSpec = Spec<Table, Kind.Table>;

// 3. Create adapter
class TableAdtAdapter extends AdtAdapter<TableSpec> {
  toAdt(): Record<string, unknown> {
    // Implementation
  }

  fromAdt(adtObject: Record<string, unknown>): TableSpec {
    // Implementation
  }
}
```

### XML Processing Options

Customize XML generation and parsing:

```typescript
import { toXML, fromXML } from '@abapify/adk';

// Custom XML generation
const customXml = toXML(adtObject, {
  format: true,
  ignoreAttributes: false,
});

// Custom XML parsing
const parsed = fromXML(xml, {
  removeNSPrefix: true,
  parseAttributeValue: true,
});
```

### Validation and Type Guards

```typescript
import { Kind } from '@abapify/adk';

function isDomainSpec(spec: any): spec is DomainSpec {
  return spec?.kind === Kind.Domain;
}

function validateClassSpec(spec: ClassSpec): boolean {
  return spec.spec.components.methods.every(
    (method) => method.name && method.visibility
  );
}
```

## Error Handling

The ADK provides clear error messages for common issues:

```typescript
try {
  const spec = adapter.fromAdt(invalidAdtObject);
} catch (error) {
  if (error.message.includes('missing')) {
    // Handle missing required fields
  } else if (error.message.includes('invalid')) {
    // Handle invalid object structure
  }
}
```

## Testing

Run the test suite:

```bash
# Run all ADK tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test domain/adapters/adt.test.ts
```

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';
import { DomainAdtAdapter, Kind } from '@abapify/adk';

describe('DomainAdtAdapter', () => {
  it('should generate valid ADT XML', () => {
    const spec = createMockDomainSpec();
    const adapter = new DomainAdtAdapter(spec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('doma:domain');
  });

  it('should parse ADT XML correctly', () => {
    const xml = getValidDomainXml();
    const spec = DomainAdtAdapter.fromAdtXML(xml);

    expect(spec.kind).toBe(Kind.Domain);
    expect(spec.metadata.name).toBe('TEST_DOMAIN');
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
