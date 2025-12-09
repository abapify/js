# AI Agent Guidelines for adt-plugin-abapgit

## Quick Reference

**Package purpose:** Serialize ABAP objects to abapGit-compatible XML/ABAP files.

**Key constraint:** This plugin does NOT implement ADT client features. It only consumes ADK objects.

## Architecture Rules (CRITICAL)

### 1. XSD Schemas Are Mandatory

**NEVER** create XML handling without XSD schema:

```bash
# Correct workflow for new object type
1. Create xsd/{type}.xsd
2. Run: npx nx codegen adt-plugin-abapgit
3. Import generated schema in handler
```

**Why:** XSD enables external validation with `xmllint`, provides formal contract, generates type-safe parser/builder.

### 2. Handlers Only Define Mappings

Handlers should contain:
- ✅ `toAbapGit()` - data mapping
- ✅ `getSource()` / `getSources()` - source file definitions
- ✅ `xmlFileName` - custom filename (if needed)

Handlers should NOT contain:
- ❌ File system operations
- ❌ ADT client calls
- ❌ XML string building
- ❌ Promise handling for sources (factory does this)

### 3. Import Conventions

**Internal imports (within package):** Use extensionless paths
```typescript
import { createHandler } from '../base';
import { intf } from '../schemas';
```

**ADK imports:** Use local re-export module
```typescript
// Correct
import { AdkClass, type ClassIncludeType } from '../adk';

// Wrong - don't import directly from @abapify/adk in handlers
import { AdkClass } from '@abapify/adk';
```

### 4. Test File Imports

Test files (`tests/**/*.test.ts`) need `.ts` extensions for Node.js native runner:
```typescript
import { createHandler } from '../../src/lib/handlers/base.ts';
```

## File Locations

| Purpose | Location |
|---------|----------|
| XSD schemas | `xsd/*.xsd` |
| Generated types | `src/schemas/generated/` |
| Handler base | `src/lib/handlers/base.ts` |
| Object handlers | `src/lib/handlers/objects/*.ts` |
| ADK re-exports | `src/lib/handlers/adk.ts` |
| Handler registry | `src/lib/handlers/registry.ts` |
| Schema tests | `tests/schemas/*.test.ts` |
| Handler tests | `tests/handlers/*.test.ts` |
| XML fixtures | `tests/fixtures/` |

## Common Tasks

### Adding New Object Type

1. Create `xsd/{type}.xsd`
2. Add to `ts-xsd.config.ts`
3. Run `npx nx codegen adt-plugin-abapgit`
4. Create `src/lib/handlers/objects/{type}.ts`
5. Add export to `src/lib/handlers/registry.ts`
6. Add ADK type to `src/lib/handlers/adk.ts` if needed
7. Add test fixtures and schema test

### Modifying Handler

1. Check if change affects `toAbapGit()` mapping
2. If XML structure changes, update XSD first, then regenerate
3. Run tests: `npx nx test adt-plugin-abapgit`
4. Run build: `npx nx build adt-plugin-abapgit`

### Debugging XML Issues

```bash
# Validate XML against schema
xmllint --schema xsd/intf.xsd tests/fixtures/intf/example.intf.xml --noout

# Check generated types match XSD
npx nx codegen adt-plugin-abapgit
```

## Known Issues / TODOs

- **ADK ClassIncludeType**: Missing some include types (`testclasses`, `localtypes`). Needs fix in `@abapify/adk`.
- **Integration tests**: Can't directly import handlers in Node.js tests due to bundler import style. Use mock schemas in `base.test.ts`.
- **Export direction**: Only SAP → Git implemented. Git → SAP would need ADK write operations.

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Manual XML strings | Use schema `.build()` |
| `fs.writeFile` in handler | Return from `ctx.createFile()` |
| `adtClient.getSource()` | Use `obj.getSource()` from ADK |
| Skip XSD for "simple" types | Always create XSD first |
| `as any` type assertions | Fix types at source |

## Build Commands

```bash
npx nx build adt-plugin-abapgit   # Build package
npx nx test adt-plugin-abapgit    # Run tests
npx nx codegen adt-plugin-abapgit # Regenerate from XSD
```
