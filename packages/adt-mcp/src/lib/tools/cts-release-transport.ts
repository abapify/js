/**
 * Tool: cts_release_transport – release a transport request
 *
 * CLI equivalent: `adt cts tr release <transport>`
 *
 * Delegates to the shared CLI lifecycle service.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CtsTransportLifecycleService } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

export function registerCtsReleaseTransportTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'cts_release_transport',
    'Release a transport request',
    {
      ...sessionOrConnectionShape,
      transport: z
        .string()
        .describe('Transport number to release (e.g. TRLK900001)'),
      releaseAll: z
        .boolean()
        .optional()
        .describe('Release all modifiable tasks before the request'),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const result = await new CtsTransportLifecycleService(client).release({
          transport: args.transport,
          releaseAll: args.releaseAll,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
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
