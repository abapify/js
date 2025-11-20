# @abapify/adt-schemas-v2

Next-generation ADT schemas with content-type registry and clean API types.

## Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: XML Schema (schema.ts)                     │
│ - ts-xml schemas matching SAP XML structure         │
│ - Technical types (nested, XML-focused)             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: Clean API (types.ts + adapter.ts)          │
│ - Developer-friendly types (flat, TypeScript-focused)│
│ - Transformation functions (XML ↔ Clean)            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: Content-Type Registry                      │
│ - Query schemas by content-type                     │
│ - Automatic schema selection                        │
│ - Version management                                │
└─────────────────────────────────────────────────────┘
```

## Features

### 1. Content-Type Registry

Query schemas by SAP content-type:

```typescript
import { getSchemaByContentType } from '@abapify/adt-schemas-v2/registry';

// Get schema by content-type
const schema = getSchemaByContentType(
  'application/vnd.sap.adt.packages.v1+xml'
);

// Parse XML
const pkg = schema.fromXml(xmlString);

// Build XML
const xml = schema.toXml(pkg);
```

### 2. Clean API Types

Flat, developer-friendly types:

```typescript
import { Package } from '@abapify/adt-schemas-v2';

const pkg: Package = {
  name: 'ZTEST',
  description: 'My package', // ← Flat, not nested
  isEncapsulated: true, // ← Boolean, not string
};
```

### 3. Automatic Transformation

Adapters handle XML ↔ Clean API conversion:

```typescript
import { PackageAdapter } from '@abapify/adt-schemas-v2';

// Parse XML → Clean API
const pkg = PackageAdapter.fromXml(xmlString);

// Build XML ← Clean API
const xml = PackageAdapter.toXml(pkg);
```

## Usage

### Basic Usage

```typescript
import { Package, PackageAdapter } from '@abapify/adt-schemas-v2';

// Parse XML
const pkg: Package = PackageAdapter.fromXml(xmlString);

console.log(pkg.name); // "ZTEST"
console.log(pkg.description); // "My package" (flat, not nested)
console.log(pkg.isEncapsulated); // true (boolean, not string)

// Build XML
const xml = PackageAdapter.toXml(pkg);
```

### Content-Type Registry

```typescript
import {
  getSchemaByContentType,
  getAllContentTypes,
} from '@abapify/adt-schemas-v2/registry';

// Get schema by content-type
const schema = getSchemaByContentType(
  'application/vnd.sap.adt.packages.v1+xml'
);
const pkg = schema.fromXml(xmlString);

// List all supported content-types
const contentTypes = getAllContentTypes();
console.log(contentTypes);
// [
//   'application/vnd.sap.adt.packages.v1+xml',
//   'application/vnd.sap.adt.oo.classes.v1+xml',
//   ...
// ]
```

### Advanced: Direct Schema Access

```typescript
import { PackageSchema } from '@abapify/adt-schemas-v2';
import { parse, build } from 'ts-xml';

// Use technical types (nested, matches XML structure)
const technicalData = parse(PackageSchema, xmlString);
console.log(technicalData.content?.typeInformation?.datatype);
```

## Package Structure

```
adt-schemas-v2/
├── src/
│   ├── base/
│   │   ├── namespace.ts       # Namespace utilities
│   │   └── adapters.ts        # Shared adapter utilities
│   ├── namespaces/
│   │   ├── adt/
│   │   │   ├── core/
│   │   │   │   ├── schema.ts  # XML schemas
│   │   │   │   ├── types.ts   # Clean API types
│   │   │   │   ├── adapter.ts # Transformations
│   │   │   │   └── index.ts   # Public exports
│   │   │   ├── packages/
│   │   │   ├── oo/
│   │   │   └── ddic/
│   │   └── atom/
│   ├── registry/
│   │   ├── content-types.ts   # Content-type constants
│   │   ├── registry.ts        # Schema registry
│   │   └── index.ts           # Public exports
│   └── index.ts               # Main exports
└── package.json
```

## Migration from v1

### Before (v1)

```typescript
import { PackageAdtSchema, type PackagesType } from '@abapify/adt-schemas';

const pkg: PackagesType = PackageAdtSchema.fromAdtXml(xml);
console.log(pkg.attributes?.isEncapsulated); // "true" (string, nested)
```

### After (v2)

```typescript
import { PackageAdapter, type Package } from '@abapify/adt-schemas-v2';

const pkg: Package = PackageAdapter.fromXml(xml);
console.log(pkg.isEncapsulated); // true (boolean, flat)
```

## Design Principles

1. **Content-Type as Schema Identity** - `application/vnd.sap.adt.*.v1+xml` identifies the schema
2. **Clean API First** - Developer-friendly types, not XML-focused
3. **Automatic Transformation** - Adapters handle complexity
4. **Type Safety** - Full TypeScript support end-to-end
5. **Extensibility** - Easy to add new endpoints

## Contributing

When adding a new endpoint:

1. Create schema in `namespaces/{namespace}/schema.ts`
2. Define clean types in `types.ts`
3. Implement adapter in `adapter.ts`
4. Register content-type in `registry/content-types.ts`
5. Add to registry in `registry/registry.ts`

See existing namespaces for examples.
