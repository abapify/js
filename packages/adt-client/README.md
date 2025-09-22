# @abapify/adt-client

Node.js client library for SAP ABAP Development Tools (ADT) REST APIs. Connect to SAP systems, manage transports, run ATC checks, and work with ABAP objects programmatically.

## Why Use This?

- **CLI-First Design**: Purpose-built as the core engine for the [ADT CLI](../adt-cli/README.md) with unique command-line features
- **Monorepo Integration**: Seamlessly integrates with other abapify-js packages (ADK, parsers, generators)
- **Modern Toolchain**: Built for modern TypeScript/Node.js development workflows and CI/CD automation
- **SAP BTP Optimized**: Specifically optimized for SAP Business Technology Platform ABAP Environment

## Comparison with Existing Solutions

This client complements the excellent [abap-adt-api](https://github.com/marcellourbani/abap-adt-api) by Marcello Urbani, which offers comprehensive ADT API coverage and mature features.

**Key Differences:**

| Feature             | @abapify/adt-client                                       | abap-adt-api                   |
| ------------------- | --------------------------------------------------------- | ------------------------------ |
| **Maturity**        | PoC phase, actively developing                            | Mature, production-ready       |
| **Scope**           | CLI-focused core component                                | Comprehensive ADT library      |
| **Architecture**    | Monorepo part, integrates with ADK/parsers                | Standalone package             |
| **CLI Integration** | Native CLI commands ([see ADT CLI](../adt-cli/README.md)) | Programmatic API only          |
| **Unique Features** | Source deployment, object scaffolding, Git integration    | Broader ADT operation coverage |

**When to use this client:**

- You want CLI-based ABAP development workflows
- You need integration with the abapify-js ecosystem (ADK, code generators)
- You're building modern TypeScript-first automation tools

**When to use abap-adt-api:**

- You need comprehensive, battle-tested ADT API coverage
- You're building standalone applications without CLI requirements
- You want maximum feature completeness and stability

## Key Features

- 🔐 **Secure Authentication** - OAuth 2.0 with PKCE flow for SAP BTP
- 🚀 **High Performance** - Optimized HTTP headers and CSRF token caching
- 📦 **Complete API Coverage** - Transport system, ATC, repository, and discovery services
- 🔧 **TypeScript Native** - Full type definitions and IntelliSense support
- 📊 **Built-in Logging** - Structured logging with configurable components

## Installation

```bash
npm install @abapify/adt-client
```

## Quick Start

```typescript
import { AdtClientImpl } from '@abapify/adt-client';

const client = new AdtClientImpl();

// Connect using SAP BTP service key
await client.connect({
  serviceKeyPath: './service-key.json',
});

// Create a transport request
const transport = await client.cts.createTransport({
  type: 'K',
  description: 'My Development Changes',
});

// Run quality checks
const atcResults = await client.atc.runAtcCheck({
  objectType: 'CLAS',
  objectName: 'ZCL_MY_CLASS',
});

// Search for objects
const objects = await client.repository.searchObjects({
  query: 'ZCL_*',
  objectTypes: ['CLAS', 'INTF'],
});
```

## Configuration

### Authentication

Get your SAP BTP service key from your ABAP Environment:

1. In SAP BTP Cockpit, navigate to your ABAP Environment
2. Go to Service Keys and create a new key
3. Save the JSON content as `service-key.json`

```typescript
await client.connect({
  serviceKeyPath: './service-key.json',
});
```

### Logging (Optional)

Configure logging for debugging and monitoring:

```bash
# Set log level for development
export ADT_LOG_LEVEL=debug

# Enable specific components
export ADT_LOG_COMPONENTS=auth,cts,atc

# Pretty print logs in development
export NODE_ENV=development
```

## Use Cases

### CI/CD Integration

```typescript
// Automated quality checks in your pipeline
const atcResults = await client.atc.runAtcCheck({
  objectType: 'CLAS',
  objectName: 'ZCL_MY_CLASS',
});

if (atcResults.some((r) => r.priority === 1)) {
  throw new Error('Critical ATC findings detected');
}
```

### Transport Automation

```typescript
// Create and manage transports programmatically
const transport = await client.cts.createTransport({
  type: 'K',
  description: 'Automated deployment',
});

await client.cts.addObjectToTransport(transport.number, {
  objectType: 'CLAS',
  objectName: 'ZCL_MY_CLASS',
});

await client.cts.releaseTransport(transport.number);
```

### Object Discovery

```typescript
// Find and analyze ABAP objects
const objects = await client.repository.searchObjects({
  query: 'Z*',
  objectTypes: ['CLAS', 'INTF', 'PROG'],
});

for (const obj of objects) {
  const metadata = await client.repository.getObject(obj.type, obj.name);
  console.log(`${obj.name}: ${metadata.description}`);
}
```

## Contributing

This package is part of the [abapify-js monorepo](https://github.com/your-org/abapify-js).

For development setup, issues, and pull requests, please visit the main repository.

## Roadmap

- 🔄 **Streaming Support** - Large object handling with streams
- 📊 **Enhanced Metrics** - Built-in performance monitoring
- 🔌 **Plugin System** - Extensible middleware architecture
- 📱 **Browser Support** - Client-side usage capabilities
- 🌐 **Multi-System** - Connect to multiple SAP systems simultaneously

## License

MIT
