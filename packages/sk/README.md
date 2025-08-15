# @abapify/btp-service-key-parser

Parser for SAP BTP (Business Technology Platform) service keys with Zod validation and TypeScript types.

## Installation

```bash
npm install @abapify/btp-service-key-parser
```

## Usage

```typescript
import { ServiceKeyParser } from '@abapify/btp-service-key-parser';

// Parse from JSON string (throws on validation error)
const serviceKey = ServiceKeyParser.parse(jsonString);

// Parse from object (throws on validation error)
const serviceKey = ServiceKeyParser.parse(serviceKeyObject);

// Safe parsing with result object
const result = ServiceKeyParser.safeParse(serviceKeyObject);
if (result.success) {
  console.log(result.data); // Validated BTPServiceKey
} else {
  console.log(result.error.issues); // Zod validation errors
}

// Access parsed properties directly
const abapEndpoint = serviceKey.endpoints['abap'] || serviceKey.url;
const uaaCredentials = serviceKey.uaa;
const systemId = serviceKey.systemid;
const catalogPath = serviceKey.catalogs['abap']?.path;
```

## API

### `ServiceKeyParser.parse(input: string | object): BTPServiceKey`

Parses and validates a BTP service key from JSON string or object. Throws ZodError on validation failure.

### `ServiceKeyParser.safeParse(input: string | object): SafeParseResult`

Safely parses and validates without throwing. Returns `{ success: true, data: BTPServiceKey }` or `{ success: false, error: ZodError }`.

### Property Access

Once parsed, access service key properties directly:

```typescript
const serviceKey = ServiceKeyParser.parse(jsonInput);

// UAA credentials
serviceKey.uaa.clientid;
serviceKey.uaa.clientsecret;
serviceKey.uaa.url;

// System information
serviceKey.systemid;
serviceKey.url;

// Endpoints
serviceKey.endpoints['abap'];
serviceKey.endpoints['other-service'];

// Catalogs
serviceKey.catalogs['abap']?.path;
serviceKey.catalogs['abap']?.type;
```

## Validation

Built with [Zod](https://zod.dev/) for robust schema validation including:

- ✅ URL format validation for endpoints
- ✅ Required field validation
- ✅ Type checking for all properties
- ✅ Detailed error messages with field paths

## TypeScript Support

Full TypeScript definitions are included for all service key components:

- `BTPServiceKey` - Main service key interface
- `UAACredentials` - OAuth/UAA authentication details
- `Catalog` - Service catalog information
- `Binding` - Service binding metadata

Types are automatically inferred from Zod schemas for perfect type safety.
