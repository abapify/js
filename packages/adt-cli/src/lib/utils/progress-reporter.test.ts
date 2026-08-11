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

  it('keeps stdout clean and writes compact step/done to stderr', () => {
    const reporter = createProgressReporter({ compact: true });

    reporter.step('Reading source...');
    reporter.done();

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledTimes(3);
    expect(stderr).toHaveBeenNthCalledWith(1, 'Reading source...');
    expect(stderr).toHaveBeenNthCalledWith(2, '\r\x1b[K');
    expect(stderr).toHaveBeenNthCalledWith(3, 'Reading source...\n');
  });

  it('writes compact persist messages to stderr without touching stdout', () => {
    const reporter = createProgressReporter({ compact: true });

    reporter.step('Reading source...');
    reporter.persist('Persisted source');

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledTimes(3);
    expect(stderr).toHaveBeenNthCalledWith(1, 'Reading source...');
    expect(stderr).toHaveBeenNthCalledWith(2, '\r\x1b[K');
    expect(stderr).toHaveBeenNthCalledWith(3, 'Persisted source\n');
  });

  it('writes compact done(finalMessage) to stderr without touching stdout', () => {
    const reporter = createProgressReporter({ compact: true });

    reporter.step('Reading source...');
    reporter.done('Finished');

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledTimes(3);
    expect(stderr).toHaveBeenNthCalledWith(1, 'Reading source...');
    expect(stderr).toHaveBeenNthCalledWith(2, '\r\x1b[K');
    expect(stderr).toHaveBeenNthCalledWith(3, 'Finished\n');
  });
});
