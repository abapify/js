import { createVitestConfig } from '../../vitest.base.config.mjs';

export default createVitestConfig({
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      reportsDirectory: '../../coverage/packages/adt-cli',
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.ts',
        'src/testing/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
