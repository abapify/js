# ADK Decorators Specification v1.0

## Problem Statement

The ADK (ABAP Development Kit) needs to generate XML files that conform to SAP ADT (ABAP Development Tools) format. These XML files have complex structures with:

- **Mixed namespaces** (intf, adtcore, abapoo, abapsource, atom)
- **Attributes and elements** mixed within the same parent
- **Hierarchical relationships** between elements
- **Namespace declarations** (xmlns) on root elements

### Example Target XML:

```xml
<intf:abapInterface
  adtcore:name="ZIF_TEST"
  adtcore:type="INTF/OI"
  abapoo:modeled="false"
  xmlns:intf="http://www.sap.com/adt/oo/interfaces"
  xmlns:adtcore="http://www.sap.com/adt/core"
  xmlns:abapoo="http://www.sap.com/adt/oo">

  <adtcore:packageRef adtcore:name="TEST"/>
  <atom:link atom:href="source/main"/>
  <atom:link atom:href="versions"/>
</intf:abapInterface>
```

### The Challenge

Creating this XML manually is error-prone and hard to maintain. We need a **declarative system** that:

1. **Maps TypeScript classes to XML structures**
2. **Handles namespace management automatically**
3. **Distinguishes between attributes and elements**
4. **Validates structure at development time**
5. **Generates fast-xml-parser compatible format**

## Solution: Decorator-Based XML Generation

This specification defines a decorator system that allows developers to **declare XML structure directly on TypeScript classes**, making XML generation:

- **Type-safe** - Compile-time validation
- **Declarative** - Clear intent in code
- **Maintainable** - Changes to class automatically update XML
- **Validated** - Catch errors at decoration time

### Example Usage:

```typescript
@xml
class InterfaceDocument {
  @root
  @namespace('intf')
  @name('abapInterface')
  interface: InterfaceData;

  @parent('intf:abapInterface')
  @namespace('adtcore')
  @attributes
  core: { name: string; type: string };

  @parent('intf:abapInterface')
  @namespace('adtcore')
  @name('packageRef')
  packageReference: PackageData;
}
```

This generates the exact XML structure shown above, with proper namespaces, attributes, and hierarchy.

## Overview

This specification defines the decorator system for the ADK (ABAP Development Kit) package. The decorators provide a declarative way to define XML serialization behavior for TypeScript classes.

## Design Principles

1. **Single Responsibility**: Each decorator has one clear purpose
2. **Composability**: Decorators can be combined to achieve complex behavior
3. **Validation**: Decorators validate their usage at decoration time
4. **Type Safety**: Full TypeScript support with compile-time checking
5. **Domain Agnostic**: Core decorator system knows nothing about SAP/ABAP specifics
6. **Namespace Separation**: No default namespace registrations - all namespaces come from `/namespaces/` folder

## Core Decorators

### `@xml` (Class Decorator)

**Purpose**: Marks a class as XML-serializable and activates XML-based logic.

**Rules**:

- Applied to the class itself, not properties
- Enables XML serialization capabilities for the class
- Required for `toXML()` functionality to work
- Can include configuration options

**Usage**:

```typescript
@xml
class InterfaceDocument {
  @root
  @namespace('intf')
  abapInterface: InterfaceData;
}

// Or with options
@xml({ validateOnCreate: true, strictMode: true })
class StrictDocument {
  @root
  data: SomeData;
}
```

## Property Decorators

### `@root`

**Purpose**: Marks a class property as the root element of the XML document.

**Rules**:

- Only ONE property per class can have `@root`
- `@root` implies `@element` (root is always an element, never attributes)
- `@namespace` is optional - elements can exist without namespace
- The property name becomes the XML element name (unless overridden by `@name`)
- Validation: Throws error if multiple `@root` decorators in same class
- Validation: Throws error if combined with `@attributes` (conflict!)

**Usage**:

```typescript
class Document {
  @root
  @namespace('intf')
  abapInterface: InterfaceData; // Becomes <intf:abapInterface>

  // Or without namespace
  @root
  simpleRoot: SimpleData; // Becomes <simpleRoot>

  // Or with custom name
  @root
  @name('customName')
  uglyPropertyName: Data; // Becomes <customName>
}
```

### `@namespace(name: string)`

**Purpose**: Assigns an XML namespace to an element or attributes.

**Parameters**:

- `name`: The namespace prefix (e.g., 'intf', 'adtcore', 'atom')

**Rules**:

- Must provide namespace URI mapping (via registry or metadata)
- Can be combined with `@element` or `@attributes`
- Validation: Ensures namespace name is valid XML namespace

**Usage**:

```typescript
@namespace('intf') @element
myProperty: SomeType;  // Becomes <intf:myProperty>

@namespace('adtcore') @attributes
coreData: CoreType;    // Becomes adtcore:name="..." adtcore:type="..."
```

### `@element`

**Purpose**: Marks a property to be serialized as an XML element.

**Rules**:

- Property value becomes element content
- Can be combined with `@namespace` and `@parent`
- For objects: properties become child elements
- For primitives: value becomes text content
- For arrays: multiple elements with same name

**Usage**:

```typescript
@namespace('test') @element
myData: { name: string; value: number };
// Becomes: <test:myData><name>...</name><value>...</value></test:myData>
```

### `@name(elementName: string)`

**Purpose**: Overrides the property name for the XML element name.

**Parameters**:

- `elementName`: The desired XML element name

**Rules**:

- Can be combined with any other decorator
- Useful when property names don't match desired XML element names
- Element name must be valid XML name

**Usage**:

```typescript
@namespace('adtcore') @name('core-data') @element
coreInfo: CoreType;  // Becomes <adtcore:core-data> instead of <adtcore:coreInfo>

@root @name('abapInterface')
uglyName: InterfaceData;  // Becomes <abapInterface> instead of <uglyName>
```

### `@attributes`

**Purpose**: Marks a property to be serialized as XML attributes on the parent element.

**Rules**:

- Property must be an object with primitive values
- Each object property becomes an XML attribute
- Must be combined with `@namespace`
- Cannot be combined with `@element`

**Usage**:

```typescript
@namespace('adtcore') @attributes
core: { name: string; type: string; version: string };
// Becomes: adtcore:name="..." adtcore:type="..." adtcore:version="..."
```

### `@parent(parentElementName: string)`

**Purpose**: Specifies that this element is a child of the named parent element.

**Parameters**:

- `parentElementName`: Full element name including namespace (e.g., 'intf:abapInterface')

**Rules**:

- **Optional**: If omitted, defaults to the root element (dynamic resolution)
- Parent element must exist in the same class (marked with `@root` or another `@element`)
- Creates explicit parent-child hierarchy
- Validation: Ensures parent element exists when specified
- **Enables inheritance**: Base classes can be reused with different root elements

**Usage**:

```typescript
class Document {
  @root
  @namespace('intf')
  @element
  abapInterface: InterfaceData;

  @parent('intf:abapInterface')
  @namespace('adtcore')
  @element
  core: CoreData; // Child of <intf:abapInterface>
}
```

## Decorator Combinations

### Valid Combinations

```typescript
// Root element
@root @namespace('intf') @element
rootProp: RootType;

// Child element
@parent('intf:root') @namespace('child') @element
childProp: ChildType;

// Attributes on parent
@parent('intf:root') @namespace('attr') @attributes
attrProp: { name: string; value: string };

// Standalone element (no parent specified = root level)
@namespace('meta') @element
metadata: MetaType;
```

### Invalid Combinations

```typescript
// ❌ Cannot combine @element and @attributes
@namespace('test') @element @attributes
invalid: SomeType;

// ❌ Cannot have multiple @root in same class
@root @namespace('a') @element
first: TypeA;
@root @namespace('b') @element  // ERROR!
second: TypeB;

// ❌ @parent must reference existing element
@parent('nonexistent:element') @element
orphan: SomeType;  // ERROR: parent doesn't exist
```

## Dynamic Parent Resolution & Inheritance

### Reusable Base Classes

The `@parent` decorator is **optional**. When omitted, properties automatically attach to the root element, enabling reusable base classes:

```typescript
// ✅ Reusable base class - no hardcoded parents!
class BaseADTDocument {
  @namespace('adtcore')
  @attributes // No @parent - attaches to root dynamically
  core: {
    name: string;
    type: string;
    version: string;
  };

  @namespace('atom')
  @name('link') // No @parent - attaches to root dynamically
  links: Array<{
    href: string;
    rel: string;
  }>;
}

// ✅ Interface document using base class
@xml()
class InterfaceDocument extends BaseADTDocument {
  @root
  @namespace('intf')
  @name('abapInterface')
  interface: any;
}

// ✅ Class document using same base class
@xml()
class ClassDocument extends BaseADTDocument {
  @root
  @namespace('class')
  @name('abapClass')
  classData: any;
}
```

### Generated XML Examples

**Interface Document:**

```xml
<intf:abapInterface
  adtcore:name="ZIF_TEST"
  adtcore:type="INTF/OI"
  adtcore:version="inactive">
  <atom:link atom:href="source/main" atom:rel="source"/>
</intf:abapInterface>
```

**Class Document:**

```xml
<class:abapClass
  adtcore:name="ZCL_TEST"
  adtcore:type="CLAS/OC"
  adtcore:version="inactive">
  <atom:link atom:href="source/main" atom:rel="source"/>
</class:abapClass>
```

### Mixed Content Solution

This approach elegantly solves the **mixed content problem** where namespaces like `adtcore` have both attributes and elements:

```typescript
@xml()
class InterfaceDocument {
  @root
  @namespace('intf')
  @name('abapInterface')
  interface: any;

  // adtcore ATTRIBUTES - no @parent needed, attaches to root
  @namespace('adtcore')
  @attributes
  coreAttrs: {
    name: string;
    type: string;
    version: string;
  };

  // adtcore ELEMENTS - no @parent needed, attaches to root
  @namespace('adtcore')
  @name('packageRef')
  packageReference: {
    name: string;
    type: string;
  };
}
```

**Generated XML:**

```xml
<intf:abapInterface
  adtcore:name="ZIF_TEST"
  adtcore:type="INTF/OI"
  adtcore:version="inactive">
  <adtcore:packageRef adtcore:name="TEST" adtcore:type="DEVC/K"/>
</intf:abapInterface>
```

## XML Generation Rules

### Hierarchy Construction

1. Find the `@root` element - this becomes the XML document root
2. Process all properties with explicit `@parent` pointing to root
3. **Process all properties without `@parent` - they automatically attach to root**
4. Recursively process children based on `@parent` relationships
5. **Inheritance support**: Walk prototype chain to find decorator metadata

### Namespace Handling

1. Collect all `@namespace` declarations
2. Generate `xmlns:prefix="uri"` declarations on root element
3. Use namespace prefixes on all elements and attributes

### Attribute vs Element Decision

- `@attributes` → XML attributes on the parent element
- `@element` → XML child elements

## Example: Complete Interface Document

```typescript
@xml
class InterfaceDocument {
  // Root element (no @element needed - @root implies it)
  @root
  @namespace('intf')
  @name('abapInterface')
  interface: {
    // Will contain all child elements
  };

  // Core attributes on root element
  @parent('intf:abapInterface')
  @namespace('adtcore')
  @attributes
  core: {
    name: string;
    type: string;
    description: string;
    version: 'active' | 'inactive';
  };

  // OO attributes on root element
  @parent('intf:abapInterface')
  @namespace('abapoo')
  @attributes
  oo: {
    modeled: boolean;
  };

  // Source attributes on root element
  @parent('intf:abapInterface')
  @namespace('abapsource')
  @attributes
  source: {
    sourceUri: string;
    fixPointArithmetic: boolean;
  };

  // Package reference as child element
  @parent('intf:abapInterface')
  @namespace('adtcore')
  @name('packageRef')
  packageReference: {
    uri: string;
    type: 'DEVC/K';
    name: string;
  };

  // Atom links as child elements (no namespace - optional!)
  @parent('intf:abapInterface')
  @name('link')
  atomLinks: Array<{
    href: string;
    rel: string;
    type?: string;
  }>;
}
```

### Generated XML:

```xml
<intf:abapInterface
  adtcore:name="ZIF_TEST"
  adtcore:type="INTF/OI"
  adtcore:description="Test Interface"
  adtcore:version="inactive"
  abapoo:modeled="false"
  abapsource:sourceUri="source/main"
  abapsource:fixPointArithmetic="false"
  xmlns:intf="http://www.sap.com/adt/oo/interfaces"
  xmlns:adtcore="http://www.sap.com/adt/core"
  xmlns:abapoo="http://www.sap.com/adt/oo"
  xmlns:abapsource="http://www.sap.com/adt/abapsource"
  xmlns:atom="http://www.w3.org/2005/Atom">

  <adtcore:packageRef adtcore:uri="/sap/bc/adt/packages/test" adtcore:type="DEVC/K" adtcore:name="TEST"/>

  <atom:link atom:href="source/main" atom:rel="http://www.sap.com/adt/relations/source"/>
  <atom:link atom:href="versions" atom:rel="http://www.sap.com/adt/relations/versions"/>
</intf:abapInterface>
```

## Namespace Architecture

### Domain Separation

The decorator system is **completely domain-agnostic**. It provides generic XML serialization capabilities without any knowledge of specific domains (SAP, ABAP, etc.).

**❌ FORBIDDEN in decorator system:**

- Hardcoded namespace URIs
- SAP-specific logic
- Domain-specific defaults
- Predefined namespace registrations

**✅ REQUIRED approach:**

- All namespaces defined in `/namespaces/` folder
- Domain-specific packages register their own namespaces
- Generic decorator system only provides registration mechanism

### Namespace Registration Pattern

```typescript
// /namespaces/sap-adt.ts - Domain-specific namespace definitions
import { registerNamespace, type Namespace } from '../decorators/decorators-v2';

// Option 1: Simple registration (most common)
registerNamespace('intf', 'http://www.sap.com/adt/oo/interfaces');
registerNamespace('adtcore', 'http://www.sap.com/adt/core');
registerNamespace('abapoo', 'http://www.sap.com/adt/oo');

// Option 2: Type-safe objects (useful for programmatic scenarios)
const sapNamespaces: Namespace[] = [
  { prefix: 'abapsource', uri: 'http://www.sap.com/adt/abapsource' },
  { prefix: 'atom', uri: 'http://www.w3.org/2005/Atom' },
];

sapNamespaces.forEach((ns) => registerNamespace(ns));
```

```typescript
// /namespaces/custom-domain.ts - Custom domain namespaces
import { registerNamespace } from '../decorators/decorators-v2';

// Register custom namespaces
registerNamespace('myapp', 'http://example.com/myapp');
registerNamespace('config', 'http://example.com/config');
```

### Usage Pattern

```typescript
// Import domain-specific namespaces to register them
import '../namespaces/sap-adt'; // Registers SAP namespaces

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

### Benefits

1. **True Separation**: Decorator system can be extracted as standalone npm package
2. **Extensibility**: New domains just add their namespace files
3. **No Conflicts**: Different domains can't interfere with each other
4. **Clear Dependencies**: Import statements show which namespaces are used
5. **Testability**: Can test decorator system with mock namespaces

## Smart Namespace Factory Pattern

### Creating Custom Domain Decorators

The decorator system provides a **factory function** for creating domain-specific namespace decorators with automatic mixed content handling:

```typescript
// Generic factory function
export function createNamespace<E, A>(config: { name: string; uri: string }) {
  return function (target: any, propertyKey: string) {
    registerNamespace(config.name, config.uri);
    setMetadata(target, `${propertyKey}__namespace`, config.name);
    setMetadata(target, `${propertyKey}__type`, 'smart-namespace');
  };
}
```

### Domain-Specific Decorator Creation

```typescript
// /src/namespaces/adtcore.ts
import { createNamespace } from '../decorators/decorators-v2';

// Define separate interfaces for attributes and elements
export interface AdtCoreAttributes {
  name: string;
  type: string;
  version?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface AdtCoreElements {
  packageRef?: PackageRefType;
  syntaxConfiguration?: SyntaxConfigType;
}

// Combined type for usage
export type AdtCoreType = AdtCoreAttributes & AdtCoreElements;

// ✅ Create domain decorator with factory function
export const adtcore = createNamespace<AdtCoreElements, AdtCoreAttributes>({
  name: 'adtcore',
  uri: 'http://www.sap.com/adt/core',
});
```

### Smart Content Detection

The smart namespace automatically determines attributes vs elements using **intelligent heuristics**:

- **Simple values** (`string`, `number`, `boolean`) → **XML Attributes**
- **Complex values** (`objects`, `arrays`) → **XML Elements**

```typescript
@xml()
class InterfaceDocument {
  @root
  @namespace('intf')
  @name('abapInterface')
  interface: any;

  @adtcore // ← Smart namespace decorator
  core: AdtCoreType;
}

// Usage
const doc = new InterfaceDocument();
doc.core = {
  // Simple values → attributes
  name: 'ZIF_TEST',
  type: 'INTF/OI',
  version: 'inactive',

  // Complex values → elements
  packageRef: { name: 'TEST', type: 'DEVC/K' },
  syntaxConfiguration: { language: 'ABAP', version: '7.5' },
};
```

### Generated XML

```xml
<intf:abapInterface
  adtcore:name="ZIF_TEST"
  adtcore:type="INTF/OI"
  adtcore:version="inactive">
  <adtcore:packageRef adtcore:name="TEST" adtcore:type="DEVC/K"/>
  <adtcore:syntaxConfiguration adtcore:language="ABAP" adtcore:version="7.5"/>
</intf:abapInterface>
```

### Benefits of Smart Namespace Pattern

1. **Type Safety** - Full TypeScript support with generic parameters
2. **Automatic Detection** - No manual attribute/element configuration
3. **Clean Syntax** - `createNamespace<Elements, Attributes>({ name, uri })`
4. **Domain Separation** - Core system remains generic
5. **Reusable Pattern** - Same approach for all domain namespaces
6. **No Symbols** - Clean interfaces without technical metadata
7. **Intelligent Processing** - Heuristic-based content type detection

## Array Handling Specification

### Core Principle: Arrays Create Multiple XML Elements

When a property decorated with `@element` contains an array, each array item becomes a separate XML element with the **same element name**.

### Basic Array Behavior

```typescript
@namespace('atom') @element
link: AtomLinkType[];  // Array of objects

// Input:
link = [
  { href: 'source/main', rel: 'source' },
  { href: 'versions', rel: 'versions' }
];

// Output XML:
<atom:link href="source/main" rel="source"/>
<atom:link href="versions" rel="versions"/>
```

### Smart Namespace Arrays

Smart namespaces automatically detect arrays and create multiple elements:

```typescript
@atom  // Smart namespace decorator
link: AtomLinkType[];

// Same result as above - multiple <atom:link> elements
```

### Array Processing Rules

1. **Element Name**: All array items use the **same element name** (property name or `@name` override)
2. **Object Arrays**: Each object becomes a separate XML element with its properties as attributes/child elements
3. **Primitive Arrays**: Each primitive value becomes a separate element with text content
4. **Empty Arrays**: No XML elements are generated
5. **Nested Arrays**: Arrays within objects are processed recursively

### Examples

#### Object Arrays (Most Common)

```typescript
@namespace('item') @element
items: { id: string; name: string }[];

// Input:
items = [
  { id: '1', name: 'First' },
  { id: '2', name: 'Second' }
];

// Output:
<item id="1" name="First"/>
<item id="2" name="Second"/>
```

#### Primitive Arrays

```typescript
@namespace('tag') @element
tags: string[];

// Input:
tags = ['typescript', 'xml', 'decorators'];

// Output:
<tag>typescript</tag>
<tag>xml</tag>
<tag>decorators</tag>
```

#### Mixed Content Arrays

```typescript
@namespace('entry') @element
entries: { type: string; items: string[] }[];

// Input:
entries = [
  { type: 'category', items: ['dev', 'test'] },
  { type: 'priority', items: ['high'] }
];

// Output:
<entry type="category">
  <items>dev</items>
  <items>test</items>
</entry>
<entry type="priority">
  <items>high</items>
</entry>
```

### Array vs Single Element

The decorator system automatically handles both single elements and arrays:

```typescript
@namespace('atom') @element
link: AtomLinkType | AtomLinkType[];  // Union type

// Single element:
link = { href: 'source', rel: 'source' };
// Output: <atom:link href="source" rel="source"/>

// Array:
link = [{ href: 'source', rel: 'source' }, { href: 'versions', rel: 'versions' }];
// Output: <atom:link href="source" rel="source"/>
//         <atom:link href="versions" rel="versions"/>
```

### Implementation Notes

1. **Fast-XML-Parser Format**: Arrays are represented as arrays in the generated object structure
2. **Parsing**: When parsing XML back to objects, multiple elements with the same name become an array
3. **Type Safety**: TypeScript array types are preserved and validated
4. **Performance**: Array processing is optimized for large collections

## Implementation Requirements

### Validation Rules

1. **Single Root**: Only one `@root` per class
2. **Parent Exists**: All `@parent` references must point to existing elements
3. **Namespace Registry**: All namespaces must have URI mappings
4. **Type Compatibility**: `@attributes` only on objects with primitive values
5. **Combination Rules**: Enforce valid decorator combinations

### Error Messages

- Clear, actionable error messages for validation failures
- Include property name and class name in errors
- Suggest corrections where possible

### Performance

- Metadata collection at decoration time (not runtime)
- Efficient XML generation with minimal object creation
- Caching of namespace URI lookups

## Migration from Current Implementation

1. **Phase 1**: Implement new decorators alongside existing ones
2. **Phase 2**: Create migration utilities to convert existing classes
3. **Phase 3**: Update all ADK classes to use new decorator system
4. **Phase 4**: Remove old decorator implementation

---

**Status**: Draft v1.0  
**Next Steps**: Review and align on specification before implementation
