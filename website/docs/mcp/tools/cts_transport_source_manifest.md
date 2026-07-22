---
title: cts_transport_source_manifest
sidebar_label: cts_transport_source_manifest
description: 'Build an exactness-gated, component-granular source manifest for one or more CTS transports. Returns metadata and opaque immutable source capabilities only.'
---

# `cts_transport_source_manifest`

Build an exactness-gated, component-granular source manifest for one or more CTS transports. Returns metadata and opaque immutable source capabilities only.

Defined in [`packages/adt-mcp/src/lib/tools/cts-transport-source-manifest.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/cts-transport-source-manifest.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  transports: string[]; // Non-empty ordered list of CTS request or task numbers
  selector?: {
    objFunc?: string | string[]; // CTS object-function filter
    pgmid?: string | string[]; // CTS program-id filter
    type?: string | string[]; // ABAP object-type filter
  }; // Optional CTS object selector; dimensions are ANDed
  concurrency?: number; // Maximum concurrent metadata/feed requests (hard cap 32)
}
```

## Output

The tool returns a single text content item whose body is a JSON-serialised object (`content[0].text`). On error, the response has `isError: true` and a human-readable message.

```json
{
  "content": [{ "type": "text", "text": "<JSON.stringify(result, null, 2)>" }]
}
```

The exact shape of `result` is an object with `requestedTransports`, `scopeTransports`, and `entries` (each entry contains `component`, optional `base`/`head` source versions, and extra metadata). See the source for field details.
