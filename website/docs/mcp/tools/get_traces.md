---
title: get_traces
sidebar_label: get_traces
description: 'List ABAP runtime traces or fetch trace details (hitlist/db accesses).'
---

# `get_traces`

List ABAP runtime traces or fetch trace details (hitlist/db accesses).

Defined in [`packages/adt-mcp/src/lib/tools/get-traces.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/get-traces.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  action?: 'list' | 'hitlist' | 'dbAccesses'; // Trace operation to execute (defaults to 'list')
  id?: string; // Trace id for hitlist/dbAccesses actions
}
```

## Output

The tool returns a single text content item whose body is a JSON-serialised object (`content[0].text`). On error, the response has `isError: true` and a human-readable message.

```json
{
  "content": [
    {
      "type": "text",
      "text": "<JSON.stringify({ action, id, result }, null, 2)>"
    }
  ]
}
```

The response wraps the trace result in an object with `action`, `id`, and `result` fields; trace data itself lives under `result`. See the source for details.
