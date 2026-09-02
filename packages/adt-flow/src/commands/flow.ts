import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import type { AdtClient } from '@abapify/adt-client';
import type { FlowConfig } from '@abapify/adt-config';
import {
  getFormatPlugin,
  type CliCommandPlugin,
  type CliContext,
  type FormatPlugin,
} from '@abapify/adt-plugin';
import { createAdtFlowDependencies } from '../adt-client-adapter';
import { createAdtFlowService, type AdtFlowService } from '../service';
import { flowConfigSchema } from '../schemas';
import { AdtFlowError } from '../types';

export interface FlowCommandDependencies {
  getFormat(id: string): FormatPlugin | undefined;
  createService(client: AdtClient, format: FormatPlugin): AdtFlowService;
}

const DEFAULT_DEPENDENCIES: FlowCommandDependencies = {
  getFormat: getFormatPlugin,
  createService: (client, format) =>
    createAdtFlowService(createAdtFlowDependencies(client, format)),
};

function transports(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function flowConfig(ctx: CliContext): FlowConfig {
  const value = ctx.config['flow'];
  if (!value || typeof value !== 'object') {
    throw new AdtFlowError(
      'configuration_invalid',
      'adt.config.ts must define a flow section.',
    );
  }
  try {
    return flowConfigSchema.parse(value);
  } catch (error) {
    throw new AdtFlowError(
      'configuration_invalid',
      'Flow configuration is invalid.',
      { cause: error instanceof Error ? error.message : String(error) },
    );
  }
}

function partialReportPath(value: unknown, root: string): string | undefined {
  if (value === undefined || value === false) return undefined;
  if (typeof value !== 'string' || !value.trim()) {
    throw new AdtFlowError(
      'invalid_input',
      '--partial-report requires a non-empty repository-relative file path.',
    );
  }
  const target = resolve(root, value);
  const fromRoot = relative(root, target);
  if (
    fromRoot === '..' ||
    fromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
  ) {
    throw new AdtFlowError(
      'invalid_input',
      '--partial-report must remain inside the checkout root.',
    );
  }
  return target;
}

async function writePartialReport(
  output: string,
  result: Awaited<ReturnType<AdtFlowService['checkout']>>,
): Promise<void> {
  const payload = `${JSON.stringify(
    {
      schemaVersion: 1,
      requestedTransports: result.requestedTransports,
      skipped: result.skipped,
    },
    null,
    2,
  )}\n`;
  await mkdir(dirname(output), { recursive: true });
  const temporary = `${output}.${process.pid}.tmp`;
  await writeFile(temporary, payload, 'utf8');
  await rename(temporary, output);
}

function checkoutTrCommand(
  dependencies: FlowCommandDependencies,
): CliCommandPlugin {
  return {
    name: 'tr',
    description: 'Checkout the exact source-tree boundary for transports',
    arguments: [
      {
        name: '<transport>',
        description: 'Transport number or comma-separated transport scope',
      },
    ],
    options: [
      {
        flags: '--base',
        description: 'Checkout the version immediately before the scope',
      },
      {
        flags: '--partial',
        description:
          'Materialize only objects with exact source-history boundaries',
      },
      {
        flags: '--partial-report <file>',
        description:
          'Write skipped-object JSON after a successful partial checkout',
      },
    ],
    async execute(args, ctx) {
      if (!ctx.getAdtClient) {
        throw new AdtFlowError(
          'sap_operation_failed',
          'An authenticated ADT client is required.',
        );
      }
      const config = flowConfig(ctx);
      const format = dependencies.getFormat(config.format?.id);
      if (!format) {
        throw new AdtFlowError(
          'format_unsupported',
          `Format plugin "${config.format?.id ?? ''}" is not registered.`,
        );
      }
      const client = (await ctx.getAdtClient()) as AdtClient;
      // Commander normalizes --partial-report to partialReport at runtime;
      // retain the dashed spelling for direct plugin callers and tests.
      const report = partialReportPath(
        args.partialReport ?? args['partial-report'],
        ctx.cwd,
      );
      if (report && args['partial'] !== true) {
        throw new AdtFlowError(
          'invalid_input',
          '--partial-report requires the explicit --partial opt-in.',
        );
      }
      const result = await dependencies.createService(client, format).checkout({
        root: ctx.cwd,
        transports: transports(args['transport']),
        mode: args['base'] === true ? 'base' : 'head',
        partial: args['partial'] === true,
        config,
      });
      if (report) await writePartialReport(report, result);
      ctx.logger.info(
        `Checked out ${result.mode} for ${result.requestedTransports.join(', ')}: ` +
          `${result.changed.length} changed, ${result.moved.length} moved, ` +
          `${result.removed.length} removed, ${result.unchanged.length} unchanged.`,
      );
      for (const skipped of result.skipped) {
        ctx.logger.warn(
          `Skipped object ${skipped.object} (${skipped.component}; ${skipped.diagnostic}).`,
        );
      }
      ctx.logger.info(
        `SAP calls: manifest=${result.sapCalls.manifest}, metadata=${result.sapCalls.metadata}, ` +
          `source=${result.sapCalls.source}; fast-path=${result.fastPath}.`,
      );
    },
  };
}

export function createFlowCommand(
  overrides: Partial<FlowCommandDependencies> = {},
): CliCommandPlugin {
  const dependencies = { ...DEFAULT_DEPENDENCIES, ...overrides };
  return {
    name: 'flow',
    description: 'Materialize incremental ADT source-tree boundaries',
    subcommands: [
      {
        name: 'checkout',
        description: 'Reconcile a source tree to an ADT boundary',
        subcommands: [checkoutTrCommand(dependencies)],
      },
    ],
  };
}

export const flowCommand = createFlowCommand();
export default flowCommand;
