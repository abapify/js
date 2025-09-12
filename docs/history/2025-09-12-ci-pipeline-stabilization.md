# CI/CD Pipeline Stabilization - September 12, 2025

## Overview

This document chronicles the comprehensive effort to stabilize the GitHub Actions CI/CD pipeline for the abapify-js monorepo, addressing multiple critical issues that were causing pipeline failures.

## Issues Identified

### 1. EventEmitter Memory Leak (MaxListenersExceededWarning)

**Problem**: CI pipeline was failing with Node.js EventEmitter memory leak warnings due to too many parallel processes exceeding the default limit of 10 listeners for SIGINT/SIGTERM/SIGHUP signals.

**Root Cause**: NX was attempting to run more than 10 concurrent tasks simultaneously, causing Node.js to exceed its EventEmitter listener limits.

**Solution**: Added `--parallel=3` flag to the CI workflow to limit concurrent task execution.

### 2. ESLint Configuration Issues

**Problem**: Inconsistent ESLint configurations across packages, with dependency-checks rule causing false positives for config files.

**Root Cause**:

- Individual packages had redundant ESLint configurations
- Config files were being analyzed by `@nx/dependency-checks` rule, causing unnecessary dependency bloat warnings

**Solution**:

- Centralized ESLint configuration in base `eslint.config.js`
- Added `ignoredFiles` to `@nx/dependency-checks` rule to exclude config files
- Simplified individual package ESLint configs to extend base configuration only

### 3. Test Configuration Problems

**Problem**: Packages without test files were failing CI pipeline instead of passing gracefully.

**Root Cause**: Vitest wasn't configured to pass when no test files were found.

**Solution**: Configured `passWithNoTests: true` in `vitest.base.config.mts` to allow packages without tests to pass.

### 4. Build Dependency Chain Issues

**Problem**: CLI tests were failing because ADK dependency wasn't built before CLI tests ran.

**Root Cause**: Missing dependency chain configuration in NX.

**Solution**:

- Added `"build": { "dependsOn": ["^build"] }` to ensure upstream dependencies are built first
- Initially added `"dependsOn": ["build"]` to test targets (later removed per user preference)

### 5. Package Export Mismatches

**Problem**: ADK package exports didn't match actual build output, causing module resolution failures.

**Root Cause**:

- ADK `tsconfig.lib.json` was building to `../../dist/out-tsc` instead of `./dist`
- Package.json exports pointed to `.mjs` files but build produced `.js` files

**Solution**:

- Updated ADK `tsconfig.lib.json` to match standard pattern used by other packages
- Fixed package.json exports to match actual build output locations

### 6. Redundant Test Scripts

**Problem**: Package.json files contained redundant test scripts that conflicted with NX plugin inference.

**Root Cause**: NX Vite plugin automatically infers test targets from vitest configs, making package.json test scripts redundant.

**Solution**: Removed test scripts from all package.json files, allowing NX plugin to manage test targets automatically.

### 7. Overcomplicated Vitest Configurations

**Problem**: Individual vitest configs had unnecessary timeouts, path aliases, and custom configurations.

**Root Cause**: Copy-paste configurations with unused options that could cause conflicts.

**Solution**: Simplified all vitest configs to use base configuration only: `export default createVitestConfig();`

## Commits Involved

The following commits were part of this stabilization effort:

1. **ad7e308** - `refactor: update tsconfig.lib.json to extend base configuration and streamline compiler options`
2. **57920dc** - `feat: update adk package and nx target defaults`
3. **2b087c6** - `refactor: simplify vitest configurations in multiple packages`
4. **af5b8f7** - `feat: add parallel flag to affected tasks in CI`
5. **3f38fd3** - `refactor: rename adt-cli and adt-client projects and remove root vitest config`
6. **0551d7a** - `refactor: simplify eslint configurations and update dependencies`
7. **3cc0001** - `fix: mark optional dependencies as devOptional in package-lock.json`
8. **e52acef** - `refactor: consolidate test configuration and remove redundant vite configs`
9. **9029be0** - `ci: add nx-cloud fix-ci step to handle failed builds`
10. **da96092** - `fix: resolve CI pipeline failures`

## Final Configuration

### CI Workflow (`.github/workflows/ci.yml`)

```yaml
- run: npx nx affected -t lint test build e2e-ci --verbose=false --parallel=3
```

### NX Configuration (`nx.json`)

```json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"]
    },
    "@nx/vite:test": {
      "cache": true,
      "inputs": ["default", "^default"],
      "options": {
        "run": true
      }
    }
  }
}
```

### Base ESLint Configuration (`eslint.config.js`)

```javascript
{
  files: ['**/*.json'],
  rules: {
    '@nx/dependency-checks': [
      'error',
      {
        ignoredFiles: [
          '{projectRoot}/*.config.{js,ts,mjs,mts,cjs,cts}',
          '{projectRoot}/**/eslint.config.{js,ts,mjs,mts,cjs,cts}',
          '{projectRoot}/**/vitest.config.{js,ts,mjs,mts,cjs,cts}',
          '{projectRoot}/**/vite.config.{js,ts,mjs,mts,cjs,cts}',
        ],
      },
    ],
  }
}
```

### Base Vitest Configuration (`vitest.base.config.mts`)

```typescript
export function createVitestConfig(config: any = {}) {
  return defineConfig({
    test: {
      watch: false,
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules/**', 'dist/**'],
      reporters: ['default'],
      passWithNoTests: true, // Key configuration for packages without tests
      coverage: {
        enabled: false,
      },
      ...config.test,
    },
    ...config,
  });
}
```

## Results

- ✅ All 9 packages pass lint with 0 errors
- ✅ All 8 packages pass tests successfully
- ✅ Build dependency chain works correctly (`^build` → `build` → `test`)
- ✅ No more EventEmitter memory leak warnings
- ✅ Packages without test files pass gracefully
- ✅ Consistent configuration across all packages
- ✅ CI pipeline runs reliably without hanging

## Key Learnings

1. **Parallelism Control**: In CI environments, limiting parallelism prevents resource exhaustion and EventEmitter issues
2. **Configuration Centralization**: Centralized configurations reduce maintenance overhead and inconsistencies
3. **NX Plugin Inference**: Trust NX plugins to infer targets automatically rather than duplicating configuration
4. **Build Dependencies**: Proper dependency chains are crucial for monorepos with inter-package dependencies
5. **Test Configuration**: `passWithNoTests: true` is essential for packages in development that don't have tests yet

## Maintenance Notes

- Monitor CI pipeline performance with `--parallel=3` setting
- Keep vitest configs simple and rely on base configuration
- Ensure new packages follow the established patterns
- Package exports must match actual build output locations
- Let NX plugins manage target inference rather than manual configuration
