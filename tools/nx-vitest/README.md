# nx-vitest

NX plugin that automatically adds test targets to packages with vitest.config.ts files.

## Features

- Automatically detects `vitest.config.ts` files in packages
- Adds `test` target using `npx vitest run --reporter=default`
- Configures proper caching and dependencies
- Follows the same pattern as nx-tsdown plugin

## Usage

The plugin is automatically registered in nx.json and will detect any package with a vitest.config.ts file.
