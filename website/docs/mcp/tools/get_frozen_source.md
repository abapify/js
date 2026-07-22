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
  canonicalKey: string; // Canonical object key from the accepted Review scope
  componentId: string; // Immutable source component from the accepted Review scope
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
