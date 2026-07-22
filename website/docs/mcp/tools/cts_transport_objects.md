---
title: cts_transport_objects
sidebar_label: cts_transport_objects
---

# `cts_transport_objects`

Defined in [`packages/adt-mcp/src/lib/tools/cts-transport-objects.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/cts-transport-objects.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  transport: string; // Transport number (e.g. DEVK900001)
  objFunc?: string;
  pgmid?: string;
  type?: string;
  alsoTransports?: string[]; // Additional transport numbers to merge
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
