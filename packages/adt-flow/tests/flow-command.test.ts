import { describe, expect, it, vi } from 'vitest';
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
      sapCalls: { manifest: 1, metadata: 1, source: 1 },
      fastPath: 'none' as const,
    }));
    const command = createFlowCommand({
      getFormat: vi.fn(() => format),
      createService: vi.fn(() => ({ checkout })),
    });
    const info = vi.fn();
    const ctx = {
      cwd: '/workspace',
      config: {
        flow: {
          format: { id: 'abapgit' },
          include: { objectTypes: ['CLAS'] },
        },
      },
      logger: { debug: vi.fn(), info, warn: vi.fn(), error: vi.fn() },
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
      config: ctx.config.flow,
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining('1 changed, 0 moved, 0 removed'),
    );
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
});
