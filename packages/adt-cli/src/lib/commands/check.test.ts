import type { AdtClient } from '@abapify/adt-client';
import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import type { CheckResult, CheckServiceInput } from '../services/check/service';
import { createCheckCommand, type CheckCommandDependencies } from './check';

function createCommandState(result: CheckResult): {
  dependencies: Partial<CheckCommandDependencies>;
  run: ReturnType<typeof vi.fn>;
  lines: string[];
  errors: string[];
  exitCodes: number[];
} {
  const client = {} as AdtClient;
  const run = vi.fn(async (_input: CheckServiceInput) => result);
  const lines: string[] = [];
  const errors: string[] = [];
  const exitCodes: number[] = [];

  return {
    dependencies: {
      getClient: vi.fn(async () => client),
      createService: vi.fn(() => ({ run })),
      writeLine: (line) => lines.push(line),
      writeError: (line) => errors.push(line),
      setExitCode: (code) => exitCodes.push(code),
    },
    run,
    lines,
    errors,
    exitCodes,
  };
}

function createRootCommand(dependencies: Partial<CheckCommandDependencies>) {
  return new Command('adt')
    .version('1.0.0')
    .exitOverride()
    .addCommand(createCheckCommand(dependencies));
}

describe('check command', () => {
  it('accepts a non-colliding --source-version option under a versioned root command', async () => {
    const state = createCommandState({
      reports: [],
      hasErrors: false,
      hasWarnings: false,
    });

    await createRootCommand(state.dependencies).parseAsync(
      [
        'node',
        'adt',
        'check',
        'ZCL_TEST',
        '--type',
        'CLAS',
        '--source-version',
        'active',
        '--json',
      ],
      { from: 'node' },
    );

    expect(state.run).toHaveBeenCalledWith({
      objects: [{ uri: '/sap/bc/adt/oo/classes/zcl_test' }],
      sourceVersion: 'active',
    });
  });

  it('uses inactive source when no source version is provided', async () => {
    const state = createCommandState({
      reports: [],
      hasErrors: false,
      hasWarnings: false,
    });

    await createRootCommand(state.dependencies).parseAsync(
      ['node', 'adt', 'check', 'ZCL_TEST', '--type', 'CLAS', '--json'],
      { from: 'node' },
    );

    expect(state.run).toHaveBeenCalledWith({
      objects: [{ uri: '/sap/bc/adt/oo/classes/zcl_test' }],
      sourceVersion: 'inactive',
    });
  });

  it('prints valid JSON and sets a failing exit status for SAP errors', async () => {
    const reports = [
      {
        triggeringUri: '/sap/bc/adt/oo/classes/zcl_test',
        checkMessageList: {
          checkMessage: [{ type: 'E', shortText: 'Syntax error' }],
        },
      },
    ];
    const state = createCommandState({
      reports,
      hasErrors: true,
      hasWarnings: false,
    });

    await createRootCommand(state.dependencies).parseAsync(
      ['node', 'adt', 'check', 'ZCL_TEST', '--type', 'CLAS', '--json'],
      { from: 'node' },
    );

    expect(state.lines).toHaveLength(1);
    expect(JSON.parse(state.lines[0] ?? 'null')).toEqual(reports);
    expect(state.errors).toEqual([]);
    expect(state.exitCodes).toEqual([1]);
  });
});
