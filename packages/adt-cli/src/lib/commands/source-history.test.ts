import { describe, expect, it, vi } from 'vitest';
import type { AdtClient } from '@abapify/adt-client';
import {
  createSourceVersionCommand,
  createSourceVersionsCommand,
  type SourceHistoryCommandDependencies,
} from './source';
import type {
  GetVersionSourceInput,
  ListObjectVersionsInput,
  ListObjectVersionsResult,
} from '../services/source-history';

const client = {} as AdtClient;

function createDependencies(service: {
  listObjectVersions: (
    input: ListObjectVersionsInput,
  ) => Promise<ListObjectVersionsResult>;
  getVersionSource: (input: GetVersionSourceInput) => Promise<string>;
}): {
  dependencies: Partial<SourceHistoryCommandDependencies>;
  lines: string[];
  errors: string[];
  stdout: string[];
  files: Array<{ path: string; content: string }>;
  exitCodes: number[];
} {
  const lines: string[] = [];
  const errors: string[] = [];
  const stdout: string[] = [];
  const files: Array<{ path: string; content: string }> = [];
  const exitCodes: number[] = [];

  return {
    dependencies: {
      getClient: vi.fn(async () => client),
      createService: vi.fn(() => service),
      writeStdout: (content) => stdout.push(content),
      writeFile: vi.fn(async (path, content) => {
        files.push({ path, content });
      }),
      writeLine: (content) => lines.push(content),
      writeError: (content) => errors.push(content),
      setExitCode: (code) => exitCodes.push(code),
    },
    lines,
    errors,
    stdout,
    files,
    exitCodes,
  };
}

describe('source-history commands', () => {
  it('prints version metadata as JSON and forwards exact component filtering', async () => {
    const listObjectVersions = vi.fn(async () => ({
      object: { name: 'ZCL_TEST', type: 'CLAS', packageName: 'ZPKG' },
      components: [
        {
          id: 'implementations',
          sourceUri: '/sap/bc/adt/oo/classes/zcl_test/source/implementations',
          versionsUri:
            '/sap/bc/adt/oo/classes/zcl_test/source/implementations/versions',
          versions: [
            {
              id: 'version-2',
              ordinal: 0,
              sourceUri:
                '/sap/bc/adt/oo/classes/zcl_test/source/implementations/versions/2',
              transports: ['DEVK900001'],
            },
          ],
        },
      ],
    }));
    const state = createDependencies({
      listObjectVersions,
      getVersionSource: vi.fn(async () => {
        throw new Error('Unexpected source read.');
      }),
    });

    await createSourceVersionsCommand(state.dependencies).parseAsync(
      [
        'ZCL_TEST',
        '--type',
        'CLAS',
        '--component',
        'implementations',
        '--json',
      ],
      { from: 'user' },
    );

    expect(listObjectVersions).toHaveBeenCalledWith({
      objectName: 'ZCL_TEST',
      objectType: 'CLAS',
      component: 'implementations',
    });
    expect(state.lines).toHaveLength(1);
    expect(JSON.parse(state.lines[0] ?? '{}')).toMatchObject({
      object: { name: 'ZCL_TEST', type: 'CLAS' },
      components: [{ id: 'implementations' }],
    });
    expect(state.stdout).toEqual([]);
    expect(state.errors).toEqual([]);
    expect(state.exitCodes).toEqual([]);
  });

  it('writes immutable source only to stdout when output is dash', async () => {
    const source = 'CLASS zcl_test IMPLEMENTATION.\nENDCLASS.\n';
    const getVersionSource = vi.fn(async () => source);
    const state = createDependencies({
      listObjectVersions: vi.fn(async () => {
        throw new Error('Unexpected version listing.');
      }),
      getVersionSource,
    });
    const uri = '/sap/bc/adt/oo/classes/zcl_test/source/main/versions/2';

    await createSourceVersionCommand(state.dependencies).parseAsync(
      ['get', '--uri', uri, '--output', '-'],
      { from: 'user' },
    );

    expect(getVersionSource).toHaveBeenCalledWith({ uri });
    expect(state.stdout).toEqual([source]);
    expect(state.files).toEqual([]);
    expect(state.lines).toEqual([]);
    expect(state.errors).toEqual([]);
  });

  it('writes immutable source only to the requested file', async () => {
    const source = 'REPORT ztest.\n';
    const state = createDependencies({
      listObjectVersions: vi.fn(async () => {
        throw new Error('Unexpected version listing.');
      }),
      getVersionSource: vi.fn(async () => source),
    });

    await createSourceVersionCommand(state.dependencies).parseAsync(
      [
        'get',
        '--uri',
        '/sap/bc/adt/programs/programs/ztest/source/main/versions/1',
        '--output',
        '/tmp/ztest-version.abap',
      ],
      { from: 'user' },
    );

    expect(state.files).toEqual([
      { path: '/tmp/ztest-version.abap', content: source },
    ]);
    expect(state.stdout).toEqual([]);
    expect(state.lines).toEqual([]);
    expect(state.errors).toEqual([]);
  });
});
