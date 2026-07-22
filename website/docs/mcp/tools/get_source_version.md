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
  destination?: string; // ADT-managed destination key; supply it in shared-service/destination mode (set up via sap_connect); when set, baseUrl/username/password/systemId are rejected
  sourceCapability?: string; // Opaque capability returned by cts_transport_source_manifest (session-scoped)
  uri?: string; // Direct server-relative ADT URI; must start with /sap/bc/adt/ and is not allowed in destination mode
  maxBytes?: number; // Maximum UTF-8 response size in bytes (default 1 MiB, hard cap 2 MiB)
}
```

- `sourceCapability` and `uri` are mutually exclusive.
- In shared-service/destination mode, the caller must supply `destination` (bound via `sap_connect`) and use `sourceCapability`; `uri` is rejected with an error.

## Output

The tool returns a single text content item whose body is a JSON-serialised object (`content[0].text`). On error, the response has `isError: true` and a human-readable message.

```json
{
  "content": [{ "type": "text", "text": "<JSON.stringify(result, null, 2)>" }]
}
```

On success `result` contains `bytes` and `source`. See the source for field details.
