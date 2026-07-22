---
title: get_context
sidebar_label: get_context
description: 'Fetch compressed dependency context for an ABAP object by stripping dependencies to their public API surface.'
---

# `get_context`

Fetch compressed dependency context for an ABAP object by stripping dependencies to their public API surface.

Defined in [`packages/adt-mcp/src/lib/tools/get-context.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/get-context.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  objectName: string; // ABAP object name
  objectType?: string; // Object type (CLAS, INTF, PROG, DDLS, FUNC)
  depth?: number; // Dependency traversal depth (1..3)
  maxDeps?: number; // Maximum dependencies to include
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
