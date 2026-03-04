/**
 * Tool: cts_create_transport – create a new transport request
 *
 * CLI equivalent: `adt cts tr create`
 *
 * Note: The service layer delegates to ADK for full create logic.
 * This tool wraps the service for structured JSON I/O.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types.js';
import { connectionShape } from './shared-schemas.js';

export function registerCtsCreateTransportTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'cts_create_transport',
    'Create a new transport request',
    {
      ...connectionShape,
      description: z.string().describe('Transport description'),
      type: z
        .enum(['K', 'W'])
        .optional()
        .describe(
          'Transport type: K (Workbench) or W (Customizing). Default: K',
        ),
      target: z.string().optional().describe('Target system (default: LOCAL)'),
      project: z.string().optional().describe('CTS project name'),
    },
    async (args) => {
      try {
        const client = ctx.getClient(args);
        const transport = await client.services.transports.create({
          description: args.description,
          type: args.type ?? 'K',
          target: args.target ?? 'LOCAL',
          project: args.project,
        });

        return {
          content: [
            { type: 'text' as const, text: JSON.stringify(transport, null, 2) },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Create transport failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
