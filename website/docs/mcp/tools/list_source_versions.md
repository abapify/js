---
title: list_source_versions
sidebar_label: list_source_versions
description: 'List immutable ADT source-version metadata and transport provenance for an ABAP object. Source bodies are never returned.'
---

# `list_source_versions`

List immutable ADT source-version metadata and transport provenance for an ABAP object. Source bodies are never returned.

Defined in [`packages/adt-mcp/src/lib/tools/list-source-versions.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/list-source-versions.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  objectName: string; // ABAP object name
  objectType: string; // ABAP object type (for example PROG, CLAS, or INTF)
  component?: string;
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
