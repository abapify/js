# @abapify/adk (ABAP Development Kit)

A minimalistic TypeScript library for representing SAP ABAP objects with accurate ADT (ABAP Development Tools) XML parsing and serialization.

Part of the **ADT Toolkit** - see [main README](../../README.md) for architecture overview.

Built on `@abapify/adt-schemas-xsd` for robust, type-safe XML processing.

## Features

- 🎯 **TypeScript-First Design** - Clean, strongly typed ADT object representations
- 🔄 **Accurate XML Processing** - Faithful parsing and rendering of real ADT XML payloads
- 🏗️ **Minimalistic Architecture** - Thin OOP layer over adt-schemas
- ⚡ **Zero Duplication** - Generic factory pattern eliminates boilerplate
- 📦 **Client-Agnostic** - Works with any ADT client; emit XML via `toAdtXml()` and parse back with `fromAdtXml()`
- 🔧 **Extensible** - Add new object types by updating the registry
- 🚀 **Modern Node** - ESM-only, clean imports, small footprint

## Why ADK

**Use ADK when you want:**

- Programmatic, type-safe ABAP object modeling
- Reliable ADT XML generation and parsing
- Integration with build tools, CLIs, or automation
- Modern TypeScript development experience

**Alternatives:**

- Manual XML crafting for each object type
- Ad-hoc REST wrappers per endpoint
- Using IDE tools only (no programmatic modeling)

## Quick Start

Install:

```bash
npm install @abapify/adk
```

### Create and Serialize Objects

```typescript
import { Class, Interface, Domain, Package } from '@abapify/adk';
import { ClassAdtSchema, InterfaceAdtSchema } from '@abapify/adt-schemas';

// Create a class
const myClass = new Class({
  name: 'ZCL_HELLO',
  type: 'CLAS/OC',
  description: 'Hello World Class',
  // ... other ClassType properties
});

// Serialize to ADT XML
const xml = myClass.toAdtXml();
console.log(xml);
```

### Parse from ADT XML

```typescript
import { Class } from '@abapify/adk';

// Parse from existing ADT XML
const parsed = Class.fromAdtXml(xmlString);
console.log(parsed.name); // "ZCL_HELLO"
console.log(parsed.type); // "CLAS/OC"
```

### Auto-Detect Object Type

```typescript
import { fromAdtXml } from '@abapify/adk';

// Automatically detects object type and creates appropriate instance
const obj = fromAdtXml(xmlString);
console.log(obj.kind); // "Class", "Interface", "Domain", etc.
```

## Architecture

ADK is organized into three main layers:

### 1. Registry (`src/registry/`)

Centralized object type management:

- **`kinds.ts`** - Kind enum and ADT type mappings
- **`type-mapping.ts`** - XML parsing and type detection
- **`object-registry.ts`** - Kind→Constructor registry
- **Auto-registration** - All object types registered on import

```typescript
import { Kind, ADT_TYPE_TO_KIND, KIND_TO_ADT_TYPE } from '@abapify/adk';

// Kind enum
Kind.Class      // 'Class'
Kind.Interface  // 'Interface'
Kind.Domain     // 'Domain'
Kind.Package    // 'Package'

// Type mappings
ADT_TYPE_TO_KIND['CLAS/OC']  // Kind.Class
KIND_TO_ADT_TYPE[Kind.Class] // 'CLAS/OC'
```

### 2. Objects (`src/objects/`)

Organized by ADT type prefix:

```
objects/
├── clas/    # ABAP Classes (CLAS/OC, CLAS/OI)
├── intf/    # ABAP Interfaces (INTF/OI)
├── doma/    # ABAP Domains (DOMA/DD)
├── devc/    # ABAP Packages (DEVC/K)
└── generic.ts  # Generic fallback for unknown types
```

Each object provides:
- Constructor taking adt-schemas type
- `toAdtXml()` - Serialize to XML
- `static fromAdtXml()` - Parse from XML
- `getData()` - Access underlying data

### 3. Factories (`src/base/`)

- **`class-factory.ts`** - `createAdkObject()` generates class definitions
- **`instance-factory.ts`** - `fromAdtXml()` creates instances from XML

## Supported Object Types

| Kind | ADT Types | Object Class |
|------|-----------|-------------|
| Class | CLAS/OC, CLAS/OI | `Class` |
| Interface | INTF/OI | `Interface` |
| Domain | DOMA/DD | `Domain` |
| Package | DEVC/K | `Package` |

To add new object types, edit `src/registry/kinds.ts`.

## API Reference

### Core Interfaces

```typescript
interface AdkObject {
  readonly kind: string;
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  toAdtXml(): string;
}

interface AdkObjectConstructor<T> {
  fromAdtXml(xml: string): T;
}
```

### Object Classes

All object classes follow this pattern:

```typescript
import { Class } from '@abapify/adk';

// Constructor
const obj = new Class(data);

// Methods
obj.name           // Get object name
obj.type           // Get ADT type
obj.description    // Get description
obj.kind           // Get Kind enum value
obj.getData()      // Get underlying adt-schemas data
obj.toAdtXml()     // Serialize to XML

// Static method
Class.fromAdtXml(xml)  // Parse from XML
```

### Registry

```typescript
import { ObjectRegistry, Kind } from '@abapify/adk';

// Get constructor by kind
const ctor = ObjectRegistry.getConstructor(Kind.Class);

// Check if registered
ObjectRegistry.isRegistered(Kind.Class); // true

// Get all registered kinds
ObjectRegistry.getRegisteredKinds(); // ['Class', 'Interface', ...]
```

### Type Detection

```typescript
import { extractTypeFromXml, mapTypeToKind } from '@abapify/adk';

// Extract ADT type from XML
const type = extractTypeFromXml(xml); // 'CLAS/OC'

// Map ADT type to Kind
const kind = mapTypeToKind('CLAS/OC'); // Kind.Class
```

## Integration with adt-schemas

ADK is a thin layer over [@abapify/adt-schemas](../adt-schemas). All XML serialization/deserialization is delegated to adt-schemas:

```typescript
import { ClassAdtSchema, type ClassType } from '@abapify/adt-schemas';
import { Class } from '@abapify/adk';

// Direct schema usage
const xml = ClassAdtSchema.toAdtXml(data, { xmlDecl: true });
const data = ClassAdtSchema.fromAdtXml(xml);

// ADK wrapper
const obj = new Class(data);
const xml = obj.toAdtXml(); // Uses ClassAdtSchema internally
```

## Development

```bash
# Install dependencies
bun install

# Build
npx nx build adk

# Test
npx vitest

# Type check
npx tsc --noEmit
```

## License

MIT
