---
title: get_short_dumps
sidebar_label: get_short_dumps
description: 'List ABAP runtime short dumps or fetch details for a specific dump id.'
---

# `get_short_dumps`

List ABAP runtime short dumps or fetch details for a specific dump id.

Defined in [`packages/adt-mcp/src/lib/tools/get-short-dumps.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/get-short-dumps.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  id?: string; // Short dump id for details lookup
  user?: string; // Optional SAP user filter
  maxResults?: number; // Maximum dumps to return
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
