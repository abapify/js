import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CtsTransportLifecycleService } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

export function registerCtsCreateTaskTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'cts_create_task',
    'Create and verify a modifiable task under an existing transport request.',
    {
      ...sessionOrConnectionShape,
      transport: z.string().describe('Parent transport request number'),
      owner: z.string().describe('SAP user who should own the task'),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const result = await new CtsTransportLifecycleService(
          client,
        ).createTask({ transport: args.transport, owner: args.owner });
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Create transport task failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
