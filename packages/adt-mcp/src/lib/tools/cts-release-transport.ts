/**
 * Tool: cts_release_transport – release a transport request
 *
 * CLI equivalent: `adt cts tr release <transport>`
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types.js';
import { connectionShape } from './shared-schemas.js';

export function registerCtsReleaseTransportTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'cts_release_transport',
    'Release a transport request',
    {
      ...connectionShape,
      transport: z
        .string()
        .describe('Transport number to release (e.g. S0DK900001)'),
    },
    async (args) => {
      try {
        const client = ctx.getClient(args);
        await client.services.transports.release(args.transport);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { transport: args.transport, status: 'released' },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Release transport failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
