# @abapify/adt-client-v2

**Minimalistic speci-inspired ADT client for ABAP classes**

A clean, type-safe client for SAP ABAP Development Tools (ADT) REST API, focusing on class operations with zero dependencies.

## Features

- ✅ **Zero dependencies** - Only uses native fetch API
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Minimalistic** - Focused on ABAP classes only
- ✅ **Clean API** - Inspired by speci's design principles
- ✅ **Promise-based** - Modern async/await API

## Installation

```bash
bun add @abapify/adt-client-v2
```

## Quick Start

```typescript
import { createAdtClient } from '@abapify/adt-client-v2';

// Create client
const client = createAdtClient({
  baseUrl: 'https://sap-system.com:8000',
  username: 'YOUR_USER',
  password: 'YOUR_PASS',
  client: '100',
  language: 'EN',
});

// Get complete class with all includes
const classObj = await client.getClass('ZCL_MY_CLASS');
console.log(classObj.metadata.description);
console.log(classObj.includes.main);
console.log(classObj.includes.definitions);
console.log(classObj.includes.implementations);

// Update main source
await client.updateMainSource('ZCL_MY_CLASS', newSource);
```

## API Reference

### Client Creation

```typescript
createAdtClient(config: AdtConnectionConfig): AdtClient
```

**Config:**

- `baseUrl` - SAP system URL (e.g., `https://sap-system.com:8000`)
- `username` - SAP username
- `password` - SAP password
- `client` - SAP client (optional, e.g., `'100'`)
- `language` - SAP language (optional, e.g., `'EN'`)

### Class Operations

#### Get Complete Class

```typescript
getClass(className: string): Promise<ClassObject>
```

Returns class metadata and all includes (main, definitions, implementations, macros, testclasses).

#### Get Metadata Only

```typescript
getMetadata(className: string): Promise<ClassMetadata>
```

Returns class metadata (name, description, package, etc.).

#### Get All Includes

```typescript
getIncludes(className: string): Promise<ClassIncludes>
```

Returns all class source includes.

#### Get Specific Include

```typescript
getInclude(className: string, includeType: 'main' | 'definitions' | 'implementations' | 'macros' | 'testclasses'): Promise<string>
```

Returns specific include source code.

#### Update Main Source

```typescript
updateMainSource(className: string, source: string): Promise<OperationResult>
```

Updates the main class source code.

#### Create Class

```typescript
createClass(className: string, metadata: Partial<ClassMetadata>): Promise<OperationResult>
```

Creates a new class with specified metadata.

#### Delete Class

```typescript
deleteClass(className: string): Promise<OperationResult>
```

Deletes a class.

#### Lock/Unlock

```typescript
lockClass(className: string): Promise<string>
unlockClass(className: string, lockHandle: string): Promise<OperationResult>
```

Lock and unlock class for editing.

## Types

### ClassMetadata

```typescript
interface ClassMetadata {
  name: string;
  description?: string;
  packageName?: string;
  responsible?: string;
  createdBy?: string;
  createdAt?: string;
  changedBy?: string;
  changedAt?: string;
  final?: boolean;
  abstract?: boolean;
  visibility?: 'public' | 'protected' | 'private';
}
```

### ClassIncludes

```typescript
interface ClassIncludes {
  main?: string;
  definitions?: string;
  implementations?: string;
  macros?: string;
  testclasses?: string;
}
```

### ClassObject

```typescript
interface ClassObject {
  metadata: ClassMetadata;
  includes: ClassIncludes;
}
```

## Examples

### Read and Modify Class

```typescript
// Get class
const classObj = await client.getClass('ZCL_MY_CLASS');

// Modify source
const newSource = classObj.includes.main?.replace('OLD_TEXT', 'NEW_TEXT');

// Update
if (newSource) {
  await client.updateMainSource('ZCL_MY_CLASS', newSource);
}
```

### Create New Class

```typescript
await client.createClass('ZCL_NEW_CLASS', {
  description: 'My new class',
  packageName: 'ZPACKAGE',
  visibility: 'public',
  final: false,
  abstract: false,
});
```

### Lock, Edit, Unlock Pattern

```typescript
// Lock class
const lockHandle = await client.lockClass('ZCL_MY_CLASS');

try {
  // Edit class
  await client.updateMainSource('ZCL_MY_CLASS', newSource);
} finally {
  // Always unlock
  await client.unlockClass('ZCL_MY_CLASS', lockHandle);
}
```

## Design Philosophy

This client is inspired by [speci](../speci)'s design principles:

- **Arrow functions as contracts** - Clean, type-safe API definitions
- **Zero decorators** - No magic, just TypeScript
- **Minimal dependencies** - Only what's absolutely necessary
- **Protocol-specific** - Focused on ADT REST API for classes

## Comparison with adt-client v1

| Feature          | v1            | v2             |
| ---------------- | ------------- | -------------- |
| **Dependencies** | Many          | Zero           |
| **Object Types** | All           | Classes only   |
| **API Style**    | Service-based | Direct methods |
| **Size**         | Large         | Minimal        |
| **Complexity**   | High          | Low            |

## License

MIT
