# AGENT.md

## Commands

- `nx test` - Run all tests with coverage
- `nx test [project-name]` - Run tests for a specific package (e.g., `nx test adk`)
- `nx run-many --target=test` - Run all tests
- `nx lint` - Lint and fix all projects
- `nx build` - Build all packages
- `nx build [project-name]` - Build specific package
- `nx typecheck` - Type check all TypeScript code

## Architecture

- **Monorepo**: NX-managed workspace with packages in `packages/` and samples in `samples/`
- **Core packages**: ADK (ABAP Development Kit), CDS2ABAP converter, Components library, SK service key parser
- **Languages**: TypeScript with ES2015 target, decorators enabled
- **Build tools**: NX, Rollup for bundling, SWC for transpilation
- **Testing**: Jest with coverage, Vitest for some packages
- **Path aliases**: Use `@abapify/[package-name]` for internal imports

## Code Style

- **Imports**: Relative imports (`../`) for internal files, path aliases for cross-package imports
- **Types**: Generic constraints with `extends`, utility types, interface-based design
- **Classes**: Abstract base classes, private properties, getter methods
- **Naming**: PascalCase for types/classes, camelCase for variables/methods
- **Formatting**: Prettier with 2-space indents, ESLint with NX rules
- **Error handling**: TypeScript strict mode enabled

## NX guidelines

- As a template for a new library please use `sample-tsdown` package located in `packages/sample-tsdown` folder
- Use a command like `npx nx g @nx/node:library --directory=packages/sample-tsdown --no-interactive`
- We will use a custom build using `tsdown`. For that purpose we'll need a `tsdown.config.ts` to be copied from a sample package
- Please note that script must be adjusted too `"build": "tsdown"` in `package.json`
- Please check that `skipNodeModulesBundle: true` is used in a config - we don't want too much dependencies

## AMP

- Always propose a plan and confirm it with me before executing

# Documentation

- Do not forget to update README.md not only for a main repo but also for subpackages if you make some essential changes

# Experiments and temporary data

- all temporary files, outputs of commands and etc should be placed in `tmp` directory that's how we don't mess the git tree and won't commit them accidentally
