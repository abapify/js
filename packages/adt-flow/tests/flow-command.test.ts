import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { AdtClient } from '@abapify/adt-client';
import type {
  CliCommandPlugin,
  CliContext,
  FormatPlugin,
} from '@abapify/adt-plugin';
import { createFlowCommand } from '../src/commands/flow';

function leaf(command: CliCommandPlugin): CliCommandPlugin {
  return command.subcommands?.[0]?.subcommands?.[0] as CliCommandPlugin;
}

const format = {
  id: 'abapgit',
  description: 'test',
  supportedTypes: ['CLAS'],
  getHandler: vi.fn(),
} satisfies FormatPlugin;

describe('flow CLI command', () => {
  it('exposes an explicit flow checkout tr hierarchy and applies base mode', async () => {
    const checkout = vi.fn(async () => ({
      mode: 'base' as const,
      requestedTransports: ['DEVK900001', 'DEVK900002'],
      scopeTransports: ['DEVK900001', 'DEVK900002'],
      changed: ['src/zcl_sample.clas.abap'],
      moved: [],
      removed: [],
      unchanged: [],
      descriptors: [],
      skipped: [
        {
          object: 'TABD/PAYHX01',
          component: 'object',
          diagnostic: 'OBJECT_TYPE_UNSUPPORTED',
        },
      ],
      sapCalls: { manifest: 1, metadata: 1, source: 1 },
      fastPath: 'none' as const,
    }));
    const command = createFlowCommand({
      getFormat: vi.fn(() => format),
      createService: vi.fn(() => ({ checkout })),
    });
    const info = vi.fn();
    const warn = vi.fn();
    const ctx = {
      cwd: '/workspace',
      config: {
        flow: {
          format: { id: 'abapgit' },
          include: { objectTypes: ['CLAS'] },
        },
      },
      logger: { debug: vi.fn(), info, warn, error: vi.fn() },
      getAdtClient: vi.fn(async () => ({}) as AdtClient),
    } satisfies CliContext;

    expect(command.name).toBe('flow');
    expect(command.subcommands?.[0]?.name).toBe('checkout');
    expect(leaf(command).name).toBe('tr');
    await leaf(command).execute?.(
      { transport: 'DEVK900002, DEVK900001', base: true },
      ctx,
    );

    expect(checkout).toHaveBeenCalledWith({
      root: '/workspace',
      transports: ['DEVK900002', 'DEVK900001'],
      mode: 'base',
      partial: false,
      config: ctx.config.flow,
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining('1 changed, 0 moved, 0 removed'),
    );
    expect(warn).toHaveBeenCalledWith(
      'Skipped object TABD/PAYHX01 (object; OBJECT_TYPE_UNSUPPORTED).',
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('rejects a missing flow config before requesting an ADT client', async () => {
    const getAdtClient = vi.fn(async () => ({}) as AdtClient);
    const command = createFlowCommand();
    const ctx = {
      cwd: '/workspace',
      config: {},
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      getAdtClient,
    } satisfies CliContext;

    await expect(
      leaf(command).execute?.({ transport: 'DEVK900001' }, ctx),
    ).rejects.toMatchObject({ code: 'configuration_invalid' });
    expect(getAdtClient).not.toHaveBeenCalled();
  });

  it('writes a deterministic partial report only after a successful partial checkout', async () => {
    const root = await mkdtemp(join(tmpdir(), 'adt-flow-command-'));
    const report = join(root, 'tmp', 'analysis', 'import-gaps.json');
    const checkout = vi.fn(async () => ({
      mode: 'head' as const,
      requestedTransports: ['DEVK900001'],
      scopeTransports: ['DEVK900001'],
      changed: ['src/zcl_sample.clas.abap'],
      moved: [],
      removed: [],
      unchanged: [],
      descriptors: [],
      skipped: [
        {
          object: 'CLAS/ZCL_INEXACT',
          component: 'main',
          diagnostic: 'SOURCE_HISTORY_INTERVENING_VERSION',
          sourceTransport: 'DEVK900001',
        },
      ],
      sapCalls: { manifest: 1, metadata: 1, source: 1 },
      fastPath: 'none' as const,
    }));
    const command = createFlowCommand({
      getFormat: vi.fn(() => format),
      createService: vi.fn(() => ({ checkout })),
    });
    const ctx = {
      cwd: root,
      config: { flow: { format: { id: 'abapgit' } } },
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      getAdtClient: vi.fn(async () => ({}) as AdtClient),
    } satisfies CliContext;

    try {
      await leaf(command).execute?.(
        { transport: 'DEVK900001', partial: true, 'partial-report': report },
        ctx,
      );

      expect(checkout).toHaveBeenCalledWith(
        expect.objectContaining({ partial: true }),
      );
      expect(JSON.parse(await readFile(report, 'utf8'))).toEqual({
        schemaVersion: 1,
        requestedTransports: ['DEVK900001'],
        skipped: [
          {
            object: 'CLAS/ZCL_INEXACT',
            component: 'main',
            diagnostic: 'SOURCE_HISTORY_INTERVENING_VERSION',
            sourceTransport: 'DEVK900001',
          },
        ],
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
