# ADT Codegen E2E Test

End-to-end test for the hook-based codegen framework.

## Structure

```
e2e/adt-codegen/
├── adt.config.ts              # Default config (with filters)
├── full.adt.config.ts         # Full example with all features
├── generated/                 # Generated output (gitignored)
└── README.md                  # This file
```

## Running

```bash
# Default config (adt.config.ts)
npm run codegen

# Full config with all features
npm run codegen:full

# Filtered config (only Message collections)
npm run codegen:filtered

# Or use CLI directly with --config flag
adt-codegen --config full.adt.config.ts
adt-codegen --config=adt.config.ts

# Or positional argument
adt-codegen full.adt.config.ts
```

## Plugin Patterns

### Static Plugin (no configuration)

```typescript
import { workspaceSplitterPlugin } from '@abapify/adt-codegen/plugins';

plugins: [
  workspaceSplitterPlugin, // Use as-is
];
```

### Factory Plugin (with configuration)

```typescript
import { extractCollections } from '@abapify/adt-codegen/plugins';

plugins: [
  extractCollections({
    output: 'collections.json', // Customize output
  }),
];
```

### Backward Compatibility

```typescript
import { extractCollectionsPlugin } from '@abapify/adt-codegen/plugins';

plugins: [
  extractCollectionsPlugin, // Default instance
];
```

## Output

Generates:

- `generated/workspaces/*/workspace.xml` - Split workspace files
- `generated/workspaces/*/collections.json` - Collection metadata
- `generated/workspaces/*/*.types.ts` - TypeScript type definitions

## Clean

```bash
rm -rf e2e/adt-codegen/generated
```
