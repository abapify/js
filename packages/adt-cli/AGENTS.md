# AGENTS.md - ADT CLI Development Guide

This file provides guidance to AI coding assistants when working with the `adt-cli` package.

## Package Overview

**adt-cli** - Command-line interface for SAP ABAP Development Tools (ADT). Provides commands for authenticating, searching objects, fetching data, and managing ABAP development workflows.

## Architecture

### Command Structure

Commands are organized in `src/lib/commands/`:
```
commands/
├── auth/           # Authentication commands (login, logout)
├── import/         # Import commands (transport import)
├── discovery.ts    # Service discovery
├── fetch.ts        # Generic HTTP requests
├── search.ts       # Object search
├── info.ts         # System/session information
└── ...             # Other commands
```

### Client Initialization Pattern

**CRITICAL: Always use the shared client helper for v2 commands**

#### ❌ WRONG - Duplicated Code
```typescript
import { createAdtClient } from '@abapify/adt-client-v2';
import { AuthManager } from '@abapify/adt-client';

// DON'T do this in every command!
const authManager = new AuthManager();
const session = authManager.loadSession();

if (!session || !session.basicAuth) {
  console.error('❌ Not authenticated');
  console.error('💡 Run "npx adt auth login" to authenticate first');
  process.exit(1);
}

const adtClient = createAdtClient({
  baseUrl: session.basicAuth.host,
  username: session.basicAuth.username,
  password: session.basicAuth.password,
  client: session.basicAuth.client,
});
```

#### ✅ CORRECT - Use Shared Helper
```typescript
import { getAdtClientV2 } from '../utils/adt-client-v2';

// Simple usage
const adtClient = getAdtClientV2();
```

#### With Plugins
```typescript
import { getAdtClientV2 } from '../utils/adt-client-v2';
import type { ResponseContext } from '@abapify/adt-client-v2';

// For commands that need to capture raw responses
const adtClient = getAdtClientV2({
  plugins: [
    {
      name: 'capture',
      process: (context: ResponseContext) => {
        // Custom processing
        return context.parsedData;
      },
    },
  ],
});
```

**Location:** `src/lib/utils/adt-client-v2.ts`

**Why?**
- **DRY**: Eliminates 15-20 lines of boilerplate per command
- **Consistency**: Same error messages across all commands
- **Maintainability**: Changes to auth/client logic in one place
- **Tested**: Helper is battle-tested across multiple commands

## Command Implementation Guidelines

### 1. Use V2 Client for New Commands

When creating new commands that need ADT API access:

```typescript
import { Command } from 'commander';
import { getAdtClientV2 } from '../utils/adt-client-v2';

export const myCommand = new Command('mycommand')
  .description('My new command')
  .action(async (options) => {
    try {
      // Get authenticated client (handles auth check & error)
      const adtClient = getAdtClientV2();

      // Use the client
      const data = await adtClient.adt.some.endpoint.method();

      // Display results
      console.log('✅ Done!');
    } catch (error) {
      console.error('❌ Failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
```

### 2. Error Handling Pattern

**Standard pattern:**
```typescript
try {
  // Command logic
} catch (error) {
  console.error('❌ Command failed:', error instanceof Error ? error.message : String(error));
  if (error instanceof Error && error.stack) {
    console.error('\nStack trace:', error.stack);
  }
  process.exit(1);
}
```

### 3. Output Formatting

**Use consistent emoji indicators:**
- 🔄 - Loading/in progress
- 🔍 - Searching
- 📋 - Listing results
- ✅ - Success
- ❌ - Error
- 💡 - Hint/tip
- 💾 - File saved

**Example:**
```typescript
console.log('🔍 Searching for objects...');
const results = await adtClient.adt.repository.informationsystem.search.quickSearch({ query });
console.log(`📋 Found ${results.length} objects`);
console.log('✅ Search complete!');
```

### 4. JSON Output Option

For machine-readable output, add `--json` flag:

```typescript
.option('--json', 'Output results as JSON')
.action(async (options) => {
  const data = await getData();

  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    // Human-readable format
    console.log('Results:');
    data.forEach(item => console.log(`  • ${item.name}`));
  }
});
```

## Migration: V1 to V2

### When to Use V1 vs V2

**Use V2 (`@abapify/adt-client-v2`) when:**
- Endpoint has a contract in v2
- Need type-safe responses
- Simple request/response operations
- Available contracts: discovery, sessions, systeminformation, search

**Use V1 (`@abapify/adt-client`) when:**
- Endpoint not yet migrated to v2
- Need handler-based object operations
- Need v1-specific features (searchObjectsDetailed with filters)

### Migration Checklist

When migrating a command from v1 to v2:

1. **Check if v2 contract exists:**
   ```bash
   ls packages/adt-client-v2/src/adt/**/*contract.ts
   ```

2. **Update imports:**
   ```typescript
   // Remove
   import { AdtClientImpl } from '@abapify/adt-client';

   // Add
   import { getAdtClientV2 } from '../utils/adt-client-v2';
   ```

3. **Replace client initialization:**
   ```typescript
   // Old: const client = new AdtClientImpl();
   // New:
   const adtClient = getAdtClientV2();
   ```

4. **Update API calls:**
   ```typescript
   // Old: await client.repository.searchObjects(...)
   // New: await adtClient.adt.repository.informationsystem.search.quickSearch(...)
   ```

5. **Test the command:**
   ```bash
   npx adt <command> [args]
   ```

6. **Update AGENTS.md:** Document the migration in adt-client-v2's migration status

## Testing Commands

### Manual Testing
```bash
# Authenticate first
npx adt auth login

# Test the command
npx adt <command> [args]

# Check output and behavior
```

### Common Test Cases
- ✅ Authentication check (should fail if not authenticated)
- ✅ Valid input (should succeed)
- ✅ Invalid input (should show error message)
- ✅ JSON output (should be valid JSON)
- ✅ File output (should create file with correct format)

## Utilities

### Available Helpers

**`utils/adt-client-v2.ts`**
- `getAdtClientV2(options?)` - Get authenticated v2 client

**`utils/command-helpers.ts`**
- `createComponentLogger()` - Create scoped logger
- `handleCommandError()` - Standard error handling

**`utils/format-loader.ts`**
- `loadFormatPlugin()` - Load format plugins (e.g., @abapify/oat)

**`utils/object-uri.ts`**
- URI parsing and construction utilities

## Common Mistakes

### Mistake 1: Duplicating Client Initialization
**Symptom:** 15-20 lines of auth code in every command
**Fix:** Use `getAdtClientV2()` helper

### Mistake 2: Inconsistent Error Messages
**Symptom:** Different error formats across commands
**Fix:** Use standard error handling pattern (see above)

### Mistake 3: Not Handling Authentication
**Symptom:** Command crashes when user not authenticated
**Fix:** Use `getAdtClientV2()` - it handles auth check automatically

### Mistake 4: Missing JSON Output
**Symptom:** Command only has human-readable output
**Fix:** Add `--json` flag for machine-readable output

### Mistake 5: Mixing V1 and V2 Unnecessarily
**Symptom:** Using v1 client when v2 contract exists
**Fix:** Check if v2 contract exists and use it

## Command Registration

After creating a command, register it in:

1. **`src/lib/commands/index.ts`:**
   ```typescript
   export { myCommand } from './mycommand';
   ```

2. **`src/lib/cli.ts`:**
   ```typescript
   import { myCommand } from './commands';
   program.addCommand(myCommand);
   ```

## Questions or Issues?

- Check `@abapify/adt-client-v2` AGENTS.md for contract documentation
- See existing commands in `src/lib/commands/` for examples
- Review `utils/` directory for available helpers
