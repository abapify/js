# Nx Monorepo Setup Rules

## Core Nx Commands

**Always use `npx nx` - never global nx installation**

- `npx nx g` - Generate new packages/components
- `npx nx build` - Build packages
- `npx nx test` - Run tests
- `npx nx typecheck` - Type checking

## Package Creation Workflow

### 1. Generate Base Package

```bash
npx nx g @nx/js:lib --name=[library-name] --directory=[path] --importPath=@abapify/[library-name] --bundler=none --unitTestRunner=vitest --linter=eslint
```

**Key Parameters:**

- `--name`: Library name (e.g., `oat`, `abapgit`, `gcts`)
- `--directory`: Path relative to workspace root (e.g., `packages/plugins/oat`)
- `--importPath`: Full npm package name (e.g., `@abapify/oat`)
- `--bundler=none`: We use tsdown instead of default tsc
- `--unitTestRunner=vitest`: Use Vitest for testing
- `--linter=eslint`: Enable ESLint

### 2. Configure tsdown Build System

Copy configuration from `packages/sample-tsdown/`:

- `tsdown.config.ts`
- Update `package.json` build script to `"build": "tsdown"`
- Ensure `skipNodeModulesBundle: true` in tsdown config

### 3. Standard Package Structure

```
packages/[name]/
├── src/
│   ├── lib/
│   └── index.ts
├── package.json
├── tsconfig.json
├── tsconfig.lib.json
└── tsdown.config.ts
```

## Technology Stack

- **Language**: TypeScript only (ES2015, strict mode)
- **Linting**: ESLint (configured via nx)
- **Testing**: Vitest (not Jest)
- **Build**: tsdown (not nx default tsc builder)
- **Package Manager**: npm workspaces (NOT pnpm)

## Plugin Package Creation

For creating plugin packages in `packages/plugins/`:

```bash
# Create plugin directory structure
mkdir -p packages/plugins

# Generate OAT plugin
npx nx g @nx/js:lib --name=oat --directory=packages/plugins/oat --importPath=@abapify/oat --bundler=none --unitTestRunner=vitest --linter=eslint

# Generate abapGit plugin
npx nx g @nx/js:lib --name=abapgit --directory=packages/plugins/abapgit --importPath=@abapify/abapgit --bundler=none --unitTestRunner=vitest --linter=eslint

# Generate GCTS plugin
npx nx g @nx/js:lib --name=gcts --directory=packages/plugins/gcts --importPath=@abapify/gcts --bundler=none --unitTestRunner=vitest --linter=eslint
```

## Package Configuration Template

### package.json

```json
{
  "name": "@abapify/[plugin-name]",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsdown"
  },
  "dependencies": {
    "@abapify/adk": "*"
  }
}
```

### tsdown.config.ts

```typescript
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  skipNodeModulesBundle: true,
});
```

## Development Workflow

1. **Generate package**: `npx nx g @nx/js:lib --name=[name] --directory=[path] --importPath=@abapify/[name] --bundler=none --unitTestRunner=vitest --linter=eslint`
2. **Configure tsdown**: Copy from sample-tsdown
3. **Build**: `npx nx build [library-name]`
4. **Test**: `npx nx test [library-name]`
5. **Typecheck**: `npx nx typecheck`

## Import Rules

- **Cross-package**: `@abapify/[package-name]`
- **Internal files**: `../relative/path`
- **No workspace:\* dependencies** (use `*` instead)

## File Organization

- **Source code**: `packages/[name]/src/`
- **Temporary files**: `tmp/` (never commit)
- **Build output**: `packages/[name]/dist/`
