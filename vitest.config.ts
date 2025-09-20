import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global test configuration - these apply to all projects
    globals: true,
    environment: 'node',
    // Silent by default - prevents context window pollution in AI agents
    // Use --silent=false flag to show console output when debugging
    silent: true,
    passWithNoTests: true,
    // Use glob patterns to automatically detect all packages as projects
    // Includes both direct packages and nested plugin packages
    projects: [
      'packages/*/vitest.config.{ts,js,mts,mjs}', // Direct packages: adk, adt-client, adt-cli, asjson-parser
      'packages/plugins/*/vitest.config.{ts,js,mts,mjs}', // Nested plugin packages: abapgit, gcts, oat
      'e2e/*/vitest.config.{ts,js,mts,mjs}',
    ],
  },
});
