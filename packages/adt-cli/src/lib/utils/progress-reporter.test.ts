import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProgressReporter } from './progress-reporter';

describe('createProgressReporter', () => {
  const stdout = vi
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);
  const stderr = vi
    .spyOn(process.stderr, 'write')
    .mockImplementation(() => true);

  afterEach(() => {
    stdout.mockClear();
    stderr.mockClear();
  });

  it('keeps stdout clean when reporting compact progress', () => {
    const reporter = createProgressReporter({ compact: true });

    reporter.step('Reading source...');
    reporter.done();

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalled();
  });
});
