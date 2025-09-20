import { defineConfig } from 'vitest/config';
import rootConfig from '../../vitest.config.js';

// Remove projects from root config for individual packages
const { projects, ...rootTestConfig } = rootConfig.test || {};

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootTestConfig,
    // Package-specific overrides
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    projects: ['.'],
  },
});
