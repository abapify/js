---
title: get_frozen_source
sidebar_label: get_frozen_source
description: 'Read one immutable source body from the signed frozen AI Review scope.'
---

# `get_frozen_source`

Read one immutable source body from the signed frozen AI Review scope.

Defined in [`packages/adt-mcp/src/lib/tools/get-frozen-source.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/get-frozen-source.ts).

## Input schema

```ts
{
  // Connection fields are rejected in shared-service/destination mode.
  // Supply a destination binding instead.
  baseUrl?: never;
  client?: never;
  username?: never;
  password?: never;
  systemId?: never;
  destination: string; // ADT-managed destination key; the caller must bind it via sap_connect/destination mode before calling this tool
  canonicalKey: string; // Canonical object key from the accepted Review scope
  componentId: string; // Immutable source component from the accepted Review scope
}
```

## Requirements

- `get_frozen_source` is only available when the MCP server is running in shared-service/destination mode.
- The caller must supply a `destination` binding (set up via `sap_connect` / destination mode) and include it in the tool call.
- An accepted signed Review scope that exposes `frozenSource` must be active; otherwise the tool returns `mcp_scope_denied`.

## Output

The tool returns a single text content item whose body is a JSON-serialised object (`content[0].text`). On error, the response has `isError: true` and a human-readable message. A missing scope or destination binding returns `mcp_scope_denied`.

```json
{
  "content": [{ "type": "text", "text": "<JSON.stringify(result, null, 2)>" }]
}
```

On success `result` contains `canonicalKey`, `componentId`, `bytes`, and `source`. See the source for field details.
