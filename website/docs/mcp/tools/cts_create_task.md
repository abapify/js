---
title: cts_create_task
sidebar_label: cts_create_task
description: 'Create a modifiable task under an existing transport request'
---

# `cts_create_task`

Create and verify a modifiable task under an existing transport request.

Defined in [`packages/adt-mcp/src/lib/tools/cts-create-task.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/cts-create-task.ts).

## Input schema

```ts
{
  baseUrl: string;   // SAP system base URL
  client?: string;   // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  transport: string; // Parent transport request number
  owner: string;     // SAP user who should own the task
}
```

## Output

The tool returns a single text content item whose body is a JSON-serialised object (`content[0].text`). On error, the response has `isError: true` and a human-readable message.

```json
{
  "content": [{ "type": "text", "text": "<JSON.stringify(result, null, 2)>" }]
}
```

See the source for the exact shape of `result`.

## Example invocation

```json
{
  "name": "cts_create_task",
  "arguments": {
    "baseUrl": "https://sap.example.com:44300",
    "username": "DEVELOPER",
    "password": "***",
    "client": "100",
    "transport": "DEVK900001",
    "owner": "DEVELOPER"
  }
}
```

## Underlying contract

- `client.adt.cts.transportrequests.createTask`

## See also

- [MCP overview](../overview.md)
