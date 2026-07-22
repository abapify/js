---
title: get_completions
sidebar_label: get_completions
description: 'Get ABAP code-completion proposals at a specific cursor position.'
---

# `get_completions`

Get ABAP code-completion proposals at a specific cursor position.

Defined in [`packages/adt-mcp/src/lib/tools/get-completions.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/get-completions.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  objectName: string; // ABAP object name
  objectType: string; // ABAP object type (e.g. CLAS, PROG)
  line: number; // 1-based cursor line
  column: number; // 1-based cursor column
  sourceCode?: string; // Optional source override; fetched from SAP if omitted
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
