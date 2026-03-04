# @abapify/adt-mcp

MCP (Model Context Protocol) server that exposes SAP ADT operations as structured tools.
Provides the same capabilities as `adt-cli` in a machine-consumable format for AI assistants, IDE integrations, and automation.

## Quick Start

```bash
# Run the MCP server (stdio transport)
npx @abapify/adt-mcp
```

### Configure in an MCP client (e.g. Claude Desktop)

```json
{
  "mcpServers": {
    "adt": {
      "command": "npx",
      "args": ["@abapify/adt-mcp"]
    }
  }
}
```

## Tools

Every tool accepts connection parameters (`baseUrl`, `client`, `username`, `password`) and returns structured JSON.

| MCP Tool                | CLI Command               | Description                               |
| ----------------------- | ------------------------- | ----------------------------------------- |
| `discovery`             | `adt discovery`           | Discover available ADT services           |
| `system_info`           | `adt info`                | Get SAP system and/or session information |
| `search_objects`        | `adt search <query>`      | Search ABAP objects in repository         |
| `get_object`            | `adt get <name>`          | Get details about a specific ABAP object  |
| `cts_list_transports`   | `adt cts tr list`         | List transport requests                   |
| `cts_get_transport`     | `adt cts tr get <tr>`     | Get transport request details             |
| `cts_create_transport`  | `adt cts tr create`       | Create a new transport request            |
| `cts_release_transport` | `adt cts tr release <tr>` | Release a transport request               |
| `cts_delete_transport`  | `adt cts tr delete <tr>`  | Delete a transport request                |
| `atc_run`               | `adt atc run`             | Run ABAP Test Cockpit checks              |

## Architecture

```
┌──────────────┐    stdio/SSE     ┌──────────────┐
│  MCP Client  │ ◄──────────────► │  adt-mcp     │
│ (AI / IDE)   │                  │  McpServer   │
└──────────────┘                  └──────┬───────┘
                                         │ calls
                                  ┌──────▼───────┐
                                  │  adt-client  │
                                  │  (contracts) │
                                  └──────┬───────┘
                                         │ HTTP
                                  ┌──────▼───────┐
                                  │  SAP System  │
                                  │  ADT REST    │
                                  └──────────────┘
```

- **No logic duplication** – MCP tools call `@abapify/adt-client` services directly.
- **Structured JSON** – every tool returns JSON, never raw console output.
- **Zod schemas** – all tool inputs are validated with Zod.

## Programmatic Usage

```typescript
import { createMcpServer } from '@abapify/adt-mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = createMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Custom client factory (e.g. for testing)

```typescript
import { createMcpServer } from '@abapify/adt-mcp';

const server = createMcpServer({
  clientFactory: (params) =>
    createAdtClient({
      baseUrl: params.baseUrl,
      username: params.username ?? '',
      password: params.password ?? '',
      client: params.client,
    }),
});
```

## Testing

Integration tests use Node.js native test runner (`node:test`) and a built-in mock ADT server.

```bash
# Run integration tests
cd packages/adt-mcp
node --test --import tsx tests/integration.test.ts
```

### Mock ADT Server

The mock server (`src/lib/mock/server.ts`) provides fixture responses for all endpoints.
Use it in your own tests:

```typescript
import { createMockAdtServer } from '@abapify/adt-mcp/src/lib/mock/server.js';

const mock = createMockAdtServer();
const { port } = await mock.start();
// ... test against http://localhost:${port}
await mock.stop();
```

## Development

```bash
# Build
npx nx build adt-mcp

# Type check
npx nx typecheck adt-mcp

# Lint
npx nx lint adt-mcp
```

## Feature Parity Map

| CLI Command            | Source                                 | MCP Tool                | Status    |
| ---------------------- | -------------------------------------- | ----------------------- | --------- |
| `adt discovery`        | `adt-cli/commands/discovery.ts`        | `discovery`             | ✅        |
| `adt info`             | `adt-cli/commands/info.ts`             | `system_info`           | ✅        |
| `adt search`           | `adt-cli/commands/search.ts`           | `search_objects`        | ✅        |
| `adt get`              | `adt-cli/commands/get.ts`              | `get_object`            | ✅        |
| `adt cts tr list`      | `adt-cli/commands/cts/tr/list.ts`      | `cts_list_transports`   | ✅        |
| `adt cts tr get`       | `adt-cli/commands/cts/tr/get.ts`       | `cts_get_transport`     | ✅        |
| `adt cts tr create`    | `adt-cli/commands/cts/tr/create.ts`    | `cts_create_transport`  | ✅        |
| `adt cts tr release`   | `adt-cli/commands/cts/tr/release.ts`   | `cts_release_transport` | ✅        |
| `adt cts tr delete`    | `adt-cli/commands/cts/tr/delete.ts`    | `cts_delete_transport`  | ✅        |
| `adt atc run`          | `adt-atc/commands/atc.ts`              | `atc_run`               | ✅        |
| `adt import package`   | `adt-cli/commands/import/package.ts`   | —                       | 🔜 Future |
| `adt import transport` | `adt-cli/commands/import/transport.ts` | —                       | 🔜 Future |
| `adt ls`               | `adt-cli/commands/ls.ts`               | —                       | 🔜 Future |
| `adt cts search`       | `adt-cli/commands/cts/search.ts`       | —                       | 🔜 Future |
