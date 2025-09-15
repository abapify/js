import nx from '@nx/eslint-plugin';
import jsoncParser from 'jsonc-eslint-parser';

export default [
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
    },
    languageOptions: {
      parser: jsoncParser,
    },
  },

  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
