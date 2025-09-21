# ADT XML Architecture Specification

## Overview

This specification defines how to create XML types in the ADK package using inheritance-based architecture to avoid duplication of common namespaces.

## Base Class Hierarchy

### BaseXML

Foundation for ALL ADT XML objects.

**Provides**:

- `@adtcore` namespace (used by every ADT object)
- `@atom` namespace for links
- Common XML parsing/serialization utilities

### OoXML (extends BaseXML)

Foundation for Object-Oriented ADT objects (classes, interfaces).

**Adds**:

- `@abapsource` namespace
- OO-specific parsing utilities

## Rules

### 1. Never Duplicate Common Namespaces

Don't reimplement `@adtcore`, `@atom`, `@abapsource`, or `@abapoo` in your XML class.

These are provided by base classes:

- `@adtcore` + `@atom` → BaseXML
- `@abapsource` + `@abapoo` → OoXML

### 2. Smart Namespace Pattern

Use smart namespace decorators that auto-detect attributes vs elements:

```typescript
@yourNamespace
data: YourType;  // Simple values → attributes, complex values → elements
```

### 3. Reuse Base Class Parsers

Always reuse parsing methods from base classes:

```typescript
// Correct
const core = BaseXML.parseAdtCoreAttributes(root);
const atomLinks = BaseXML.parseAtomLinks(root);

// Wrong - don't reimplement
const core = { name: root['@_adtcore:name'], ... };
```

### 4. Constructor Pattern

Constructor takes typed data, calls super() with base class data:

```typescript
constructor(data: {
  core: AdtCoreType;           // Base class requirement
  atomLinks?: AtomLinkType[];  // Base class requirement
  yourData?: YourType;         // Your specific data
}) {
  super({ core: data.core, atomLinks: data.atomLinks });
  this.yourData = data.yourData;
}
```

## Creating a New XML Type

### Step 1: Choose Base Class

- **General ADT objects** → extend `BaseXML`
- **OO objects (classes, interfaces)** → extend `OoXML`

### Step 2: Define XML Class

```typescript
import { xml, root, namespace, name } from '../decorators/decorators';
import { yourNamespace } from '../namespaces/your-namespace';

@xml()
export class YourObjectXML extends BaseXML {
  // or OoXML
  // 1. Define root element
  @root
  @namespace('your-ns')
  @name('yourElement')
  rootElement: any = {};

  // 2. Add object-specific namespaces (only if needed)
  @yourNamespace
  specificData?: YourSpecificType;

  // 3. Constructor
  constructor(data: {
    core: AdtCoreType; // From BaseXML
    atomLinks?: AtomLinkType[]; // From BaseXML
    specificData?: YourSpecificType;
  }) {
    super({ core: data.core, atomLinks: data.atomLinks });
    this.specificData = data.specificData;
  }

  // 4. Static parsing method
  static fromXMLString(xml: string): YourObjectXML {
    const parsed = BaseXML.parseXMLString(xml);
    const root = parsed['your-ns:yourElement'];

    // Reuse base class parsers
    const core = BaseXML.parseAdtCoreAttributes(root);
    const atomLinks = BaseXML.parseAtomLinks(root);

    // Parse your specific data
    const specificData = this.parseYourSpecificData(root);

    return new YourObjectXML({ core, atomLinks, specificData });
  }

  // 5. Specific parsing helpers
  private static parseYourSpecificData(root: any): YourSpecificType {
    // Your parsing logic here
  }
}
```

## Key Architectural Decisions

### 1. Inheritance vs Composition

**Decision**: Use inheritance for XML classes to avoid duplication.

**Rationale**:

- BaseXML implements `@adtcore` and `@atom` - these are used by ALL ADT objects
- OoXML adds `@abapsource` and `@abapoo` - these are used by classes and interfaces
- Specific classes only add their unique namespaces
- Avoids duplicating common namespace decorators in every class

### 2. Root Element Handling

**Decision**: Each XML class defines its own root element.

**Pattern**:

```typescript
// In InterfaceXML
@root @namespace('intf') @name('abapInterface')
interface: any = {};

// In ClassXML
@root @namespace('class') @name('abapClass')
class: any = {};

// In DomainXML
@root @namespace('ddic') @name('domain')
domain: any = {};
```

### 3. Namespace Decorator Usage

**Decision**: Use smart namespace decorators that automatically detect attributes vs elements.

**Pattern**:

```typescript
// Smart namespace - automatically determines attributes vs elements
@adtcore
core: AdtCoreType;  // Simple values become attributes, complex become elements

@ddic
ddicData: DdicType; // All properties become child elements
```

### 4. Method Inheritance

**Decision**: Base classes provide static parsing methods that can be reused.

**Pattern**:

```typescript
// In BaseXML
static parseAdtCoreAttributes(root: any): AdtCoreType { ... }
static parseAtomLinks(root: any): AtomLinkType[] { ... }

// In OoXML
static parseAbapSourceAttributes(root: any): AbapSourceType { ... }
static parseAbapOOAttributes(root: any): AbapOOType { ... }

// In InterfaceXML
static fromXMLString(xml: string): InterfaceXML {
  const parsed = BaseXML.parseXMLString(xml);
  const root = parsed['intf:abapInterface'];

  // Reuse base class parsing methods
  const core = BaseXML.parseAdtCoreAttributes(root);
  const source = OoXML.parseAbapSourceAttributes(root);
  const oo = OoXML.parseAbapOOAttributes(root);
  const atomLinks = BaseXML.parseAtomLinks(root);

  return new InterfaceXML({ core, source, oo, atomLinks });
}
```

## Implementation Guidelines

### 1. Decorator Conflicts Resolution

**Issue**: How to handle conflicts between v2 decorator spec and current implementation?

**Current Conflicts Identified**:

- v2 spec uses `@root @namespace @name` pattern
- Current implementation uses `@XMLRoot('intf:abapInterface')` pattern
- v2 spec uses smart namespace decorators (`@adtcore`)
- Current implementation uses explicit decorators (`@attributes`, `@element`)

**Resolution**:

- Migrate to v2 spec pattern completely
- Use inheritance to avoid duplicating common decorators
- Update all XML classes to follow the new pattern

### 2. Parsing Strategy

**Pattern**: Each XML class provides:

1. Constructor that takes typed data
2. Static `fromXMLString()` method for parsing
3. Instance `toXMLString()` method for serialization
4. Static helper methods for parsing specific sections

### 3. Type Safety

**Requirement**: All XML classes must provide:

- Full TypeScript type safety
- Automatic type inference where possible
- Compile-time validation of XML structure

## Migration Plan

### Phase 1: Update Base Classes

1. Migrate BaseXML to v2 decorators
2. Migrate OoXML to v2 decorators
3. Ensure all common namespaces work correctly

### Phase 2: Update Specific Classes

1. Migrate InterfaceXML to extend OoXML with v2 decorators
2. Migrate ClassXML to extend OoXML with v2 decorators
3. Migrate DomainXML to extend BaseXML with v2 decorators

### Phase 3: Remove Legacy Code

1. Remove old v1 decorator imports
2. Remove duplicate namespace implementations
3. Update all tests to use new architecture

## Benefits of This Architecture

1. **No Duplication**: Common namespaces implemented once in base classes
2. **Reusability**: OoXML can be extended by any OO object type
3. **Type Safety**: Full TypeScript support with inheritance
4. **Maintainability**: Changes to common namespaces update all classes
5. **Extensibility**: Easy to add new object types by extending appropriate base class
6. **Consistency**: All XML classes follow the same pattern

## Example Usage

```typescript
// Create an interface XML object
const interfaceXML = new InterfaceXML({
  core: { name: 'ZIF_TEST', type: 'INTF/OI' },
  source: { sourceUri: 'source/main' },
  oo: { modeled: false },
  atomLinks: [{ href: 'source/main', rel: 'source' }],
});

// Serialize to XML
const xml = interfaceXML.toXMLString();

// Parse from XML
const parsed = InterfaceXML.fromXMLString(xml);
```

This architecture provides a clean, maintainable, and extensible foundation for ADT XML handling while avoiding duplication and maintaining full type safety.
