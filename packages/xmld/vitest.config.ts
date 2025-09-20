import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    // Package-specific test configuration
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    environment: 'node',
    // Silent by default - use --reporter=verbose to see console logs when needed
    silent: true,
  },
});
