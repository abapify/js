import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  AdtFlowError,
  createAdtFlowDependencies,
  createAdtFlowService,
  flowConfigSchema,
  type AdtFlowService,
} from '@abapify/adt-flow';
import { type FlowConfig } from '@abapify/adt-config';
import { getFormatPlugin, type FormatPlugin } from '@abapify/adt-plugin';
import type { AdtClient } from '@abapify/adt-client';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';
import { resolveFlowWorkspaceRoot } from '../flow-workspace';

interface FlowMcpDependencies {
  loadFlowConfig(root: string, context: ToolContext): Promise<FlowConfig>;
  getFormat(id: string): FormatPlugin | undefined;
  createService(client: AdtClient, format: FormatPlugin): AdtFlowService;
}

const DEFAULT_DEPENDENCIES: FlowMcpDependencies = {
  async loadFlowConfig(root, context) {
    if (context.flowConfig) return context.flowConfig;
    const configPath = join(root, 'adt.config.json');
    let raw: string;
    try {
      raw = await readFile(configPath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('Flow configuration is unavailable in this context.', {
          cause: error,
        });
      }
      throw error;
    }
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch (error) {
      throw new Error('Flow configuration file contains invalid JSON.', {
        cause: error,
      });
    }
    try {
      return flowConfigSchema.parse(value);
    } catch (error) {
      throw new Error('Flow configuration is invalid.', { cause: error });
    }
  },
  getFormat: getFormatPlugin,
  createService: (client, format) =>
    createAdtFlowService(createAdtFlowDependencies(client, format)),
};

export function registerFlowCheckoutTrTool(
  server: McpServer,
  ctx: ToolContext,
  overrides: Partial<FlowMcpDependencies> = {},
): void {
  const dependencies = { ...DEFAULT_DEPENDENCIES, ...overrides };
  server.tool(
    'flow_checkout_tr',
    'Reconcile a confined workspace to the exact base or head source boundary of one or more transports.',
    {
      ...sessionOrConnectionShape,
      transports: z.array(z.string().trim().min(1)).min(1),
      base: z.boolean().optional(),
      workspaceRoot: z
        .string()
        .min(1)
        .describe('Absolute target directory within a server-owned root'),
    },
    {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    async (args, extra) => {
      try {
        const root = await resolveFlowWorkspaceRoot(
          args.workspaceRoot,
          ctx.workspaceRoots,
        );
        const config = await dependencies.loadFlowConfig(root, ctx);
        const format = dependencies.getFormat(config.format.id);
        if (!format) throw new Error('Configured format is not registered.');
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const result = await dependencies
          .createService(client, format)
          .checkout({
            root,
            transports: args.transports,
            mode: args.base ? 'base' : 'head',
            config,
          });
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify(result, null, 2) },
          ],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error) {
        const isFlowError = error instanceof AdtFlowError;
        const code = isFlowError ? error.code : 'FLOW_CHECKOUT_FAILED';
        const message = isFlowError
          ? error.message
          : 'Could not materialize the requested transport boundary.';
        const cause = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                error: {
                  code,
                  message,
                  details: isFlowError
                    ? (error.details ?? { cause })
                    : { cause },
                },
              }),
            },
          ],
        };
      }
    },
  );
}
