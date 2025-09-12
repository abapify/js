import { createVitestConfig } from '../../vitest.base.config.mjs';

export default createVitestConfig({
  test: {
    globals: true,
    coverage: {
      reportsDirectory: '../../coverage/packages/asjson-parser',
      provider: 'v8',
    },
  },
});
