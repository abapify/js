/**
 * Fixture registry - lives with the fixtures
 * 
 * Add new fixtures here as simple path strings.
 * The proxy in src/fixtures.ts will auto-generate loaders.
 */

export const registry = {
  transport: {
    single: 'transport/single.xml',
    singleTask: 'transport/single-task.xml',
    create: 'transport/create.xml',
  },
  atc: {
    worklist: 'atc/worklist.xml',
    result: 'atc/result.xml',
  },
  packages: {
    tmp: 'packages/tmp.xml',
  },
} as const;
