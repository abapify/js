# @abapify/btp-service-key-parser

Simple parser for SAP BTP (Business Technology Platform) service keys with OAuth token fetching using native fetch.

## Installation

```bash
npm install @abapify/btp-service-key-parser
```

## Usage

```typescript
import {
  ServiceKeyParser,
  fetchOAuthToken,
} from '@abapify/btp-service-key-parser';

// Parse and validate service key
const serviceKey = ServiceKeyParser.parse(serviceKeyJson);

// Fetch OAuth token for ADT calls
const token = await fetchOAuthToken(serviceKey);

// Use token in API calls
const response = await fetch(
  `${serviceKey.url}/sap/bc/adt/repository/informationsystem/objecttypes`,
  {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: 'application/xml',
    },
  }
);
```

## API

### `ServiceKeyParser.parse(input: string | object): BTPServiceKey`

Parses and validates a BTP service key from JSON string or object. Throws ZodError on validation failure.

### `ServiceKeyParser.safeParse(input: string | object): SafeParseResult`

Safely parses and validates without throwing. Returns `{ success: true, data: BTPServiceKey }` or `{ success: false, error: ZodError }`.

### `fetchOAuthToken(serviceKey: BTPServiceKey): Promise<OAuthToken>`

Fetches an OAuth access token using native fetch with the service key's UAA credentials.

```typescript
const token = await fetchOAuthToken(serviceKey);
// Returns: { access_token, token_type, expires_in, scope, expires_at }
```

## Property Access

Access parsed service key properties directly:

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

// Catalogs
serviceKey.catalogs['abap']?.path;
```

## Features

- ✅ **Zod validation** - Robust schema validation with detailed error messages
- ✅ **TypeScript support** - Full type safety for all service key components
- ✅ **Native OAuth** - Simple OAuth 2.0 client credentials flow using native fetch
- ✅ **Simple API** - Parse service keys and fetch tokens with minimal code
- ✅ **Standards compliant** - Follows OAuth 2.0 and OpenID Connect specifications

## Types

- `BTPServiceKey` - Main service key interface
- `UAACredentials` - OAuth/UAA authentication details
- `OAuthToken` - OAuth token response with expiration data
- `Catalog` - Service catalog information
- `Binding` - Service binding metadata
