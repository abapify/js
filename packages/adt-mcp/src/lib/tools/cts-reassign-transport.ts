/**
 * Tool: cts_reassign_transport – change owner of a transport request
 *
 * CLI equivalent: `adt cts tr reassign <TR> <new-owner> [--recursive]`
 *
 * Delegates to the shared CLI lifecycle service.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CtsTransportLifecycleService } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

export function registerCtsReassignTransportTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'cts_reassign_transport',
    'Change the owner of a transport request (optionally cascading to modifiable tasks).',
    {
      ...sessionOrConnectionShape,
      transportNumber: z
        .string()
        .describe('Transport number (e.g. TRLK900123)'),
      targetUser: z.string().describe('SAP username of the new owner'),
      recursive: z
        .boolean()
        .optional()
        .describe('Also reassign all modifiable tasks (default: false)'),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const result = await new CtsTransportLifecycleService(client).reassign({
          transport: args.transportNumber,
          newOwner: args.targetUser,
          recursive: args.recursive,
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
              text: `Reassign transport failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
