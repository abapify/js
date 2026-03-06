# ADK Facade Usage Example

This example demonstrates the new registry-based ADK facade that eliminates branching logic in the ADT client.

## Architecture Overview

- **ADK Package**: Pure object modeling with auto-registration
- **ADT Client**: Registry-based facade with no hardcoded object types
- **Zero Circular Dependencies**: Clean separation of concerns

## Basic Usage

```typescript
import { createAdtClient } from '@abapify/adt-client';

// Create ADT client with ADK facade
const client = createAdtClient();
await client.connect(config);

// Fetch objects from SAP using registry (no branching logic!)
const myClass = await client.adk.getClass('ZCL_MY_CLASS', 'ZMYPACKAGE');
const myInterface = await client.adk.getInterface('ZIF_MY_INTERFACE');

// Work with pure ADK objects (client-agnostic)
console.log(`Class: ${myClass.name} - ${myClass.description}`);
console.log(`Interface: ${myInterface.name} - ${myInterface.description}`);

// Generate XML for deployment
const classXml = myClass.toAdtXml();
const interfaceXml = myInterface.toAdtXml();
```

## Dynamic Object Type Support

```typescript
// Check supported object types dynamically
const supportedTypes = client.adk.getSupportedObjectTypes();
console.log('Supported object types:', supportedTypes);
// Output: ['CLAS', 'INTF', ...] (auto-discovered from ADK registry)

// Check if type is supported
if (client.adk.isObjectTypeSupported('CLAS')) {
  const obj = await client.adk.getObject('CLAS', 'ZCL_EXAMPLE');
}

// Get registry info for debugging
const registryInfo = client.adk.getRegistryInfo();
console.log('Registry info:', registryInfo);
```

## Batch Operations

```typescript
// Fetch multiple objects efficiently
const objects = await client.adk.getObjects([
  { objectType: 'CLAS', objectName: 'ZCL_CLASS1', packageName: 'ZPACKAGE' },
  { objectType: 'INTF', objectName: 'ZIF_INTERFACE1' },
  { objectType: 'CLAS', objectName: 'ZCL_CLASS2' },
]);

objects.forEach((obj) => {
  console.log(`${obj.kind}: ${obj.name} - ${obj.description}`);
});
```

## Adding New Object Types

To add support for a new object type, only the ADK package needs to be updated:

```typescript
// In ADK package - packages/adk/src/adt/dictionary/domain.ts
import { AdtObject } from '../../base/adt-object.js';
import { objectRegistry } from '../../base/object-registry.js';

export class Domain extends AdtObject {
  static readonly sapType = 'DOMA';

  static fromAdtXml(xml: string): Domain {
    // Implementation for parsing domain XML
  }

  toAdtXml(): string {
    // Implementation for generating domain XML
  }
}

// Auto-register (no client changes needed!)
objectRegistry.register(Domain.sapType, Domain);
```

Now the ADT client automatically supports domains:

```typescript
// This works immediately without any client code changes!
const domain = await client.adk.getObject('DOMA', 'ZDOMAIN_NAME');
console.log(client.adk.getSupportedObjectTypes()); // Now includes 'DOMA'
```

## Key Benefits

### ✅ **Zero Branching Logic**

- No switch/case statements in ADT client
- Registry handles all object type mapping
- Adding new types requires zero client changes

### ✅ **Type Safety**

- Full TypeScript support with generics
- Compile-time checking for object interfaces
- IntelliSense support for all methods

### ✅ **Extensibility**

- Self-registering objects via import side effects
- Clean plugin architecture for new object types
- Registry provides runtime discovery

### ✅ **Performance**

- Single API call per object (no double calls)
- Efficient batch operations
- NX build caching works correctly

### ✅ **Architecture**

- Perfect separation: ADK = modeling, Client = transport
- No circular dependencies
- Client-agnostic ADK objects

## Error Handling

```typescript
try {
  const obj = await client.adk.getObject('UNSUPPORTED', 'TEST');
} catch (error) {
  console.error(error.message);
  // Output: "Unsupported object type: UNSUPPORTED. Supported types: CLAS, INTF"
}
```

## Migration from Old Factory

**Before (with hardcoded factory):**

```typescript
// Old approach - hardcoded branching logic
switch (objectType) {
  case 'CLAS':
    return Class.fromAdtXml(xml);
  case 'INTF':
    return Interface.fromAdtXml(xml);
  // Adding new types required client code changes
}
```

**After (with registry facade):**

```typescript
// New approach - registry-based
const obj = await client.adk.getObject(objectType, objectName);
// Works with ANY registered object type, no branching logic!
```

This architecture scales to support hundreds of ABAP object types without any client-side code changes.
