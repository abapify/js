---
title: lint_abap
sidebar_label: lint_abap
description: 'Run local ABAP lint checks using @abaplint/core. Supports lint, lint_and_fix, and list_rules.'
---

# `lint_abap`

Run local ABAP lint checks using @abaplint/core. Supports lint, lint_and_fix, and list_rules.

Defined in [`packages/adt-mcp/src/lib/tools/lint-abap.ts`](https://github.com/abapify/adt-cli/blob/main/packages/adt-mcp/src/lib/tools/lint-abap.ts).

## Input schema

```ts
{
  baseUrl?: string; // SAP system base URL (e.g. https://host:8000)
  client?: string; // SAP client number
  username?: string; // Username for basic auth
  password?: string; // Password for basic auth
  systemId?: string;
  action?: 'lint' | 'lint_and_fix' | 'list_rules'; // Defaults to 'lint'
  source?: string; // ABAP source code to lint (required for 'lint' and 'lint_and_fix')
  objectName?: string; // Optional object name used for issue filename context
  lintPreset?: 'btp' | 'onpremise'; // Lint preset to apply (defaults to onpremise)
  ruleOverrides?: Record<string, unknown>; // Optional per-rule override config passed to abaplint
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
