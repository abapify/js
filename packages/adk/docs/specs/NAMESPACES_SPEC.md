# ADK Namespaces Specification v1.0

## Overview

This specification defines how XML namespaces are organized and managed in the ADK (ABAP Development Kit) package. Namespaces provide domain-specific XML vocabulary while keeping the core decorator system completely generic.

## Architecture Principles

### 1. **Domain Separation**

- **Core decorator system**: Generic, domain-agnostic XML serialization
- **Namespace packages**: Domain-specific XML vocabulary and URIs
- **Clear boundaries**: No domain knowledge leaks into core system

### 2. **Registration Pattern**

- Namespaces are **registered**, not hardcoded
- Each domain creates its own namespace registration file
- Import-based activation: importing a namespace file registers its namespaces

### 3. **Extensibility**

- New domains can add namespaces without modifying core system
- Multiple domains can coexist without conflicts
- Custom applications can define their own namespaces

## Namespace File Structure

### Location

All namespace files are located in `/src/namespaces/` directory:

```
/src/namespaces/
├── sap-adt.ts          # SAP ADT namespaces
├── custom-app.ts       # Custom application namespaces
├── industry-std.ts     # Industry standard namespaces
└── README.md           # Documentation
```

### Namespace Interface

All namespaces follow a simple, clean interface:

```typescript
export interface Namespace {
  readonly prefix: string;
  readonly uri: string;
}
```

### File Template

```typescript
/**
 * [Domain Name] XML Namespaces
 *
 * Registers XML namespaces for [domain description].
 * Import this file to register these namespaces with the decorator system.
 */

import { registerNamespace } from '../decorators/decorators-v2';

// Option 1: Simple parameters (recommended for most cases)
registerNamespace('prefix1', 'http://example.com/namespace1');
registerNamespace('prefix2', 'http://example.com/namespace2');

// Option 2: Type-safe objects (useful for complex scenarios)
registerNamespace({
  prefix: 'prefix3',
  uri: 'http://example.com/namespace3',
});
```

## Domain-Specific Namespace Files

### SAP ADT Namespaces (`/namespaces/sap-adt.ts`)

```typescript
/**
 * SAP ABAP Development Tools (ADT) XML Namespaces
 *
 * Registers XML namespaces used by SAP ADT for ABAP development artifacts.
 * Import this file to enable SAP ADT XML generation.
 */

import { registerNamespace } from '../decorators/decorators-v2';

// Register SAP ADT namespaces
registerNamespace('intf', 'http://www.sap.com/adt/oo/interfaces');
registerNamespace('class', 'http://www.sap.com/adt/oo/classes');
registerNamespace('adtcore', 'http://www.sap.com/adt/core');
registerNamespace('abapoo', 'http://www.sap.com/adt/oo');
registerNamespace('abapsource', 'http://www.sap.com/adt/abapsource');
registerNamespace('atom', 'http://www.w3.org/2005/Atom');
registerNamespace('app', 'http://www.w3.org/2007/app');
```

### Custom Application Namespaces (`/namespaces/custom-app.ts`)

```typescript
/**
 * Custom Application XML Namespaces
 *
 * Example of how to define namespaces for a custom application.
 */

import { registerNamespace } from '../decorators/decorators-v2';

// Custom application namespaces
registerNamespace('myapp', 'http://mycompany.com/myapp/v1');
registerNamespace('config', 'http://mycompany.com/config/v1');
registerNamespace('data', 'http://mycompany.com/data/v1');

export const CUSTOM_NAMESPACES = {
  APP: 'myapp',
  CONFIG: 'config',
  DATA: 'data',
} as const;
```

## Usage Patterns

### Basic Usage

```typescript
// Import namespace registrations (registers namespaces as side effect)
import '../namespaces/sap-adt';

// Use registered namespaces in decorators
@xml()
class InterfaceDocument {
  @root
  @namespace('intf')
  @name('abapInterface')
  interface: InterfaceData;

  @parent('intf:abapInterface')
  @namespace('adtcore')
  @attributes
  core: CoreData;
}
```

### Registration API

```typescript
// Simple parameter approach (most common)
registerNamespace('intf', 'http://www.sap.com/adt/oo/interfaces');

// Object approach (type-safe, good for programmatic use)
const namespaces: Namespace[] = [
  { prefix: 'intf', uri: 'http://www.sap.com/adt/oo/interfaces' },
  { prefix: 'adtcore', uri: 'http://www.sap.com/adt/core' },
];

namespaces.forEach((ns) => registerNamespace(ns));
```

## Smart Namespace Factory Pattern

### The Problem with Manual Configuration

Traditional namespace handling requires **manual specification** of which properties become attributes vs elements:

```typescript
// ❌ Manual and error-prone
@namespace('adtcore') @attributes
coreAttrs: { name: string; type: string; };

@namespace('adtcore') @element @name('packageRef')
packageRef: { name: string; type: string; };

@namespace('adtcore') @element @name('syntaxConfiguration')
syntaxConfig: { language: string; version: string; };
```

**Problems:**

- **Verbose**: Each property needs separate decoration
- **Error-prone**: Easy to forget decorators or use wrong types
- **Maintenance**: Adding new properties requires manual decorator updates
- **Duplication**: Namespace repeated for every property

### The Solution: Smart Namespace Factory

The **factory function pattern** creates domain-specific decorators that automatically handle mixed content:

```typescript
// /src/decorators/decorators-v2.ts
export function createNamespace<E, A>(config: { name: string; uri: string }) {
  return function (target: any, propertyKey: string) {
    registerNamespace(config.name, config.uri);
    setMetadata(target, `${propertyKey}__namespace`, config.name);
    setMetadata(target, `${propertyKey}__type`, 'smart-namespace');
  };
}
```

### Creating Domain-Specific Decorators

```typescript
// /src/namespaces/adtcore.ts
import { createNamespace } from '../decorators/decorators-v2';

// Define clean interfaces
export interface AdtCoreAttributes {
  name: string;
  type: string;
  version?: string;
  responsible?: string;
  masterLanguage?: string;
  description?: string;
}

export interface AdtCoreElements {
  packageRef?: {
    name: string;
    type: string;
    uri?: string;
  };
  syntaxConfiguration?: {
    language: string;
    version: string;
  };
}

// Combined type for usage
export type AdtCoreType = AdtCoreAttributes & AdtCoreElements;

// ✅ Create smart decorator with factory function
export const adtcore = createNamespace<AdtCoreElements, AdtCoreAttributes>({
  name: 'adtcore',
  uri: 'http://www.sap.com/adt/core',
});
```

### Intelligent Content Detection

The smart namespace uses **heuristics** to automatically determine content type:

| Value Type | XML Output | Example                                        |
| ---------- | ---------- | ---------------------------------------------- |
| `string`   | Attribute  | `name: 'ZIF_TEST'` → `adtcore:name="ZIF_TEST"` |
| `number`   | Attribute  | `version: 1` → `adtcore:version="1"`           |
| `boolean`  | Attribute  | `active: true` → `adtcore:active="true"`       |
| `object`   | Element    | `packageRef: {...}` → `<adtcore:packageRef>`   |
| `array`    | Element    | `items: [...]` → `<adtcore:items>`             |

### Clean Usage

```typescript
@xml()
class InterfaceDocument {
  @root
  @namespace('intf')
  @name('abapInterface')
  interface: any;

  @adtcore // ← Single decorator handles everything!
  core: AdtCoreType;
}

// Usage - simple object assignment
const doc = new InterfaceDocument();
doc.core = {
  // Simple values automatically become attributes
  name: 'ZIF_TEST',
  type: 'INTF/OI',
  version: 'inactive',
  responsible: 'DEVELOPER',

  // Complex values automatically become elements
  packageRef: {
    name: 'TEST',
    type: 'DEVC/K',
    uri: '/sap/bc/adt/packages/test',
  },
  syntaxConfiguration: {
    language: 'ABAP',
    version: '7.5',
  },
};
```

### Generated XML

```xml
<intf:abapInterface
  adtcore:name="ZIF_TEST"
  adtcore:type="INTF/OI"
  adtcore:version="inactive"
  adtcore:responsible="DEVELOPER">

  <adtcore:packageRef
    adtcore:name="TEST"
    adtcore:type="DEVC/K"
    adtcore:uri="/sap/bc/adt/packages/test"/>

  <adtcore:syntaxConfiguration
    adtcore:language="ABAP"
    adtcore:version="7.5"/>
</intf:abapInterface>
```

### Benefits of Smart Namespace Pattern

#### 1. **Dramatic Code Reduction**

```typescript
// Before: 15+ lines of decorators
@namespace('adtcore') @attributes coreAttrs: ...;
@namespace('adtcore') @element @name('packageRef') packageRef: ...;
@namespace('adtcore') @element @name('syntaxConfiguration') syntaxConfig: ...;

// After: 1 line
@adtcore core: AdtCoreType;
```

#### 2. **Type Safety & IntelliSense**

- **Full TypeScript support** with generic parameters
- **Perfect autocomplete** for all properties
- **Compile-time validation** of property types
- **Refactoring support** - rename properties safely

#### 3. **Automatic Maintenance**

- **Add new properties** → Just update the interface
- **No decorator updates** → Smart detection handles everything
- **Consistent behavior** → Same rules apply to all properties

#### 4. **Domain Expertise Encapsulation**

- **Domain knowledge** encoded in the decorator factory
- **Generic system** remains completely domain-agnostic
- **Reusable pattern** for all namespace domains

#### 5. **Clean Architecture**

```
┌─────────────────────────────────────┐
│  Domain Decorators (@adtcore)       │  ← Smart, domain-specific
│  /src/namespaces/                   │
├─────────────────────────────────────┤
│  Factory Function (createNamespace) │  ← Generic, reusable
│  /src/decorators/decorators-v2.ts   │
├─────────────────────────────────────┤
│  Core Decorator System              │  ← Domain-agnostic
│  (@xml, @root, @namespace, etc.)    │
└─────────────────────────────────────┘
```

### Creating Additional Domain Decorators

The same pattern works for **any domain**:

```typescript
// /src/namespaces/abapoo.ts
export const abapoo = createNamespace<AbapOOElements, AbapOOAttributes>({
  name: 'abapoo',
  uri: 'http://www.sap.com/adt/oo',
});

// /src/namespaces/atom.ts
export const atom = createNamespace<AtomElements, AtomAttributes>({
  name: 'atom',
  uri: 'http://www.w3.org/2005/Atom',
});

// /src/namespaces/custom-domain.ts
export const myapp = createNamespace<MyAppElements, MyAppAttributes>({
  name: 'myapp',
  uri: 'http://example.com/myapp',
});
```

### Multiple Domain Usage

```typescript
// Import multiple namespace domains
import '../namespaces/sap-adt';
import '../namespaces/custom-app';

@xml()
class HybridDocument {
  @root
  @namespace('myapp')
  @name('document')
  document: DocumentData;

  // Mix SAP and custom namespaces
  @parent('myapp:document')
  @namespace('adtcore')
  @attributes
  sapMetadata: SapMetadata;

  @parent('myapp:document')
  @namespace('config')
  @element
  appConfig: AppConfig;
}
```

## Validation and Error Handling

### Missing Namespace Registration

```typescript
@xml()
class BadDocument {
  @root
  @namespace('unregistered') // ❌ Will generate empty xmlns
  root: any;
}

// Generated XML will have empty namespace URI:
// <unregistered:root xmlns:unregistered="">
```

### Best Practices

1. **Always import namespace files** before using namespaces
2. **Use constants** for type safety and refactoring
3. **Document namespace purposes** in namespace files
4. **Group related namespaces** in same file
5. **Version namespace URIs** for breaking changes

## Testing Namespaces

### Mock Namespaces for Testing

```typescript
// test-utils/mock-namespaces.ts
import { registerNamespace } from '../decorators/decorators-v2';

export function registerTestNamespaces() {
  registerNamespace('test', 'http://test.example.com/v1');
  registerNamespace('mock', 'http://mock.example.com/v1');
}

// In tests
import { registerTestNamespaces } from './test-utils/mock-namespaces';

beforeEach(() => {
  registerTestNamespaces();
});
```

### Namespace Registry Testing

```typescript
import {
  getNamespaceUri,
  registerNamespace,
} from '../decorators/decorators-v2';

describe('Namespace Registry', () => {
  it('should register and retrieve namespace URIs', () => {
    registerNamespace('test', 'http://example.com/test');
    expect(getNamespaceUri('test')).toBe('http://example.com/test');
  });

  it('should return empty string for unregistered namespaces', () => {
    expect(getNamespaceUri('nonexistent')).toBe('');
  });
});
```

## Migration Guide

### From Hardcoded to Registered Namespaces

**Before (❌ Hardcoded):**

```typescript
// In decorator system - BAD!
const HARDCODED_NAMESPACES = {
  intf: 'http://www.sap.com/adt/oo/interfaces',
};
```

**After (✅ Registered):**

```typescript
// In /namespaces/sap-adt.ts - GOOD!
import { registerNamespace } from '../decorators/decorators-v2';
registerNamespace('intf', 'http://www.sap.com/adt/oo/interfaces');
```

### Updating Existing Code

1. **Create namespace file** for your domain
2. **Move namespace registrations** from core system to namespace file
3. **Import namespace file** in code that uses those namespaces
4. **Remove hardcoded namespaces** from core system

## Future Enhancements

### Potential Features

1. **Namespace validation**: Validate namespace URIs against schemas
2. **Namespace versioning**: Support multiple versions of same namespace
3. **Dynamic namespaces**: Runtime namespace registration
4. **Namespace conflicts**: Detection and resolution of prefix conflicts
5. **Namespace documentation**: Auto-generate namespace documentation

---

**Status**: Draft v1.0  
**Dependencies**: Requires ADK Decorators v2  
**Next Steps**: Implement SAP ADT namespace file and test integration
