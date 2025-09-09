# @abapify/adt-client

Modern ADT (ABAP Development Tools) client library for Node.js with comprehensive logging and testing support.

## Features

- 🔐 **OAuth 2.0 Authentication** with PKCE flow
- 🏗️ **Service-based Architecture** with modular design
- 📊 **Structured Logging** with Pino
- 🧪 **Comprehensive Testing** with Vitest and mock client
- 🔧 **TypeScript Support** with full type definitions
- 🌐 **HTTP/REST** ADT protocol implementation

## Installation

```bash
npm install @abapify/adt-client
```

## Quick Start

```typescript
import { AdtClientImpl, createLogger } from '@abapify/adt-client';

// Optional: Configure logging
process.env.ADT_LOG_LEVEL = 'debug';
process.env.ADT_LOG_COMPONENTS = 'auth,cts,atc';

const client = new AdtClientImpl();

// Connect using service key
await client.connect({
  serviceKeyPath: './service-key.json',
});

// Use services
const transports = await client.cts.listTransports();
const atcResults = await client.atc.runAtcCheck({
  objectType: 'CLAS',
  objectName: 'ZCL_MY_CLASS',
});
```

## Logging Configuration

The client uses [Pino](https://getpino.io/) for structured logging with component-based filtering:

### Environment Variables

```bash
# Log level (trace|debug|info|warn|error)
ADT_LOG_LEVEL=debug

# Enable specific components (comma-separated)
ADT_LOG_COMPONENTS=auth,cts,atc,http

# Development mode (enables pretty printing)
NODE_ENV=development
```

### Available Components

- `auth` - Authentication and OAuth flows
- `cts` - Change and Transport System operations
- `atc` - ABAP Test Cockpit checks
- `repository` - Object repository operations
- `discovery` - System discovery and metadata
- `http` - HTTP request/response details
- `connection` - Connection management
- `client` - Main client operations

### Custom Logger

```typescript
import { createLogger } from '@abapify/adt-client';

const logger = createLogger('my-component');
logger.info('Custom log message', { data: 'example' });
```

## Services

### Transport Service (CTS)

```typescript
// List transport requests
const transports = await client.cts.listTransports({
  user: 'DEVELOPER',
  status: 'modifiable',
});

// Create new transport
const transport = await client.cts.createTransport({
  type: 'K',
  description: 'My Development Transport',
});

// Add object to transport
await client.cts.addObjectToTransport('DEVK123456', {
  objectType: 'CLAS',
  objectName: 'ZCL_MY_CLASS',
});
```

### ATC Service

```typescript
// Run ATC check
const results = await client.atc.runAtcCheck({
  objectType: 'CLAS',
  objectName: 'ZCL_MY_CLASS',
  checkVariant: 'DEFAULT',
});

console.log(`Found ${results.length} findings`);
```

### Repository Service

```typescript
// Get object metadata
const object = await client.repository.getObject('CLAS', 'ZCL_MY_CLASS');

// Search objects
const results = await client.repository.searchObjects({
  query: 'ZCL_*',
  objectTypes: ['CLAS', 'INTF'],
});
```

## Testing

The package includes a comprehensive mock client for testing:

```typescript
import { MockAdtClient } from '@abapify/adt-client/tests/utils/mock-adt-client';

const mockClient = new MockAdtClient();

// Add mock data
mockClient.addMockObject({
  objectType: 'CLAS',
  objectName: 'ZCL_TEST',
  packageName: 'ZTEST',
});

// Use in tests
const objects = await mockClient.repository.searchObjects({
  query: 'ZCL_*',
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Architecture

The client follows a service-based architecture:

```
AdtClient
├── auth: AuthManager          # OAuth 2.0 authentication
├── connection: ConnectionManager  # HTTP connection management
├── cts: TransportService      # Change & Transport System
├── atc: AtcService           # ABAP Test Cockpit
├── repository: RepositoryService  # Object repository
└── discovery: DiscoveryService    # System discovery
```

Each service is independently testable and has colocated types for better maintainability.

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run watch

# Run tests
npm test
```

## License

MIT
