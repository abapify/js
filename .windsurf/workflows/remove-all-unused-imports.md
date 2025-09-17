---
description: Remove all unsued imports
auto_execution_mode: 3
---

When we lint - we may have findings like this:

workspaces/abapify-js/packages/adk/src/adt/base/adt-object.ts
102:5 warning 'xml' is defined but never used @typescript-eslint/no-unused-vars
103:5 warning 'kind' is defined but never used @typescript-eslint/no-unused-vars

What I want - is to remove all unused imports ( currently exclusive feature of vscode ) which has no alternative in eslint.
