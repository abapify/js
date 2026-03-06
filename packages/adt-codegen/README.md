# @abapify/adt-codegen

[![version](https://img.shields.io/github/package-json/v/abapify/adt-cli?filename=packages/adt-codegen/package.json)](https://github.com/abapify/adt-cli/pkgs/npm/%40abapify%2Fadt-codegen)

Hook-based code generation toolkit for SAP ADT APIs.

## Overview

The `adt-codegen` framework uses a **hook-based architecture** inspired by unplugin.

## Key Concepts

### 1. **Plugins Declare Hooks**

```typescript
export const myPlugin = definePlugin({
  name: 'my-plugin',

  hooks: {
    workspace(ws) {
      // Called for each workspace
    },

    collection(coll) {
      // Called for each collection
    },

    finalize(ctx) {
      // Called once at the end
    },
  },
});
```

### 2. **Framework Orchestrates**

The framework:

- Checks which hooks are registered
- Only iterates if hooks exist
- Calls hooks in order: `discovery` → `workspace` → `collection` → `templateLink` → `finalize`

### 3. **Simple Configuration**

```typescript
export default {
  discovery: {
    path: './discovery.xml',
  },
  output: {
    baseDir: './generated',
  },
  plugins: [
    workspaceSplitterPlugin,
    extractCollectionsPlugin,
    generateTypesPlugin,
  ],
};
```

## Available Hooks

| Hook           | Called            | Context                            |
| -------------- | ----------------- | ---------------------------------- |
| `discovery`    | Once at start     | Parsed discovery XML               |
| `workspace`    | Per workspace     | Workspace data + helpers           |
| `collection`   | Per collection    | Collection data + parent workspace |
| `templateLink` | Per template link | Link data + parent collection      |
| `finalize`     | Once at end       | All workspaces + global data       |

## Context Objects

### WorkspaceContext

```typescript
{
  title: string;
  folderName: string;
  dir: string;
  xml: any;
  data: Record<string, any>;  // Shared between plugins
  artifacts: Artifact[];       // Files to write
  logger: Logger;
  writeFile(name, content): Promise<void>;
}
```

### CollectionContext

```typescript
{
  href: string;
  title: string;
  accepts: string[];
  category: { term: string; scheme: string };
  templateLinks: TemplateLink[];
  workspace: WorkspaceContext;  // Parent
  data: Record<string, any>;
  logger: Logger;
}
```

## Built-in Plugins

### 1. workspace-splitter

Writes `workspace.xml` for each workspace.

**Hook:** `workspace`

### 2. extract-collections

Extracts collection metadata and writes `collections.json`.

**Hooks:** `workspace`, `collection`, `finalize`

### 3. generate-types

Generates TypeScript types from collections.

**Hook:** `collection`, `finalize`

## Example Output

```
generated/workspaces/
├── abap-cross-trace/
│   ├── workspace.xml           # From workspace-splitter
│   ├── collections.json        # From extract-collections
│   ├── traces.types.ts         # From generate-types
│   ├── activations.types.ts
│   └── components.types.ts
├── dictionary/
│   ├── workspace.xml
│   ├── collections.json
│   └── *.types.ts
└── ...
```

## Creating Custom Plugins

```typescript
import { definePlugin } from '@abapify/adt-codegen';

export const myCustomPlugin = definePlugin({
  name: 'my-custom-plugin',

  hooks: {
    collection(coll) {
      // Access parent workspace
      const ws = coll.workspace;

      // Store data for other plugins
      ws.data.myData = { ... };

      // Add artifacts to write
      ws.artifacts.push({
        file: 'my-file.ts',
        content: '...'
      });

      // Log progress
      coll.logger.info('Processing collection');
    }
  }
});
```

## Benefits

✅ **Simple config** - Just list plugins  
✅ **Automatic orchestration** - Framework handles iteration  
✅ **Composable** - Plugins share data via context  
✅ **Efficient** - Only iterates if hooks exist  
✅ **Type-safe** - Full TypeScript support  
✅ **Extensible** - Easy to add new plugins

## Usage

```bash
# Run codegen
npx tsx src/cli.ts ./adt-codegen.config.ts

# Or programmatically
import { CodegenFramework } from '@abapify/adt-codegen';
import config from './adt-codegen.config';

const framework = new CodegenFramework(config);
await framework.run();
```

## Next Steps

Potential new plugins:

- `generate-openapi` - Convert to OpenAPI specs
- `generate-client` - Generate TypeScript client
- `validate-endpoints` - Validate against live SAP system
- `generate-docs` - Generate documentation
