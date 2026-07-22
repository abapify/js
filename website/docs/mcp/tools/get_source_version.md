---
title: get_source_version
sidebar_label: get_source_version
description: 'Read one manifest-authorised immutable ADT source version. The UTF-8 response is bounded and is never silently truncated.'
---

# `get_source_version`

Read one manifest-authorised immutable ADT source version. The UTF-8 response is bounded and is never silently truncated.

Defined in [`packages/adt-mcp/src/lib/tools/get-source-version.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/get-source-version.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  sourceCapability?: string;
  uri?: string;
  maxBytes?: number;
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
