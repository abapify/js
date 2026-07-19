/**
 * Tool: list_source_versions — list immutable source-version metadata for an
 * ABAP object (optionally narrowed to one source component).
 *
 * Source bodies are intentionally excluded. Fetch one explicitly with
 * `get_source_version` after selecting an immutable source URI.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExactSourceHistoryService } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

export function registerListSourceVersionsTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'list_source_versions',
    'List immutable ADT source-version metadata and transport provenance for an ABAP object. Source bodies are never returned.',
    {
      ...sessionOrConnectionShape,
      objectName: z.string().trim().min(1).describe('ABAP object name'),
      objectType: z
        .string()
        .trim()
        .min(1)
        .describe('ABAP object type (for example PROG, CLAS, or INTF)'),
      component: z
        .string()
        .trim()
        .min(1)
        .optional()
        .describe(
          'Optional source component id (for example main, definitions, or testclasses)',
        ),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const service = new ExactSourceHistoryService(client);
        const result = await service.listObjectVersions({
          objectName: args.objectName,
          objectType: args.objectType,
          component: args.component,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  error: {
                    code: 'SOURCE_VERSION_LIST_FAILED',
                    message:
                      'Could not list source versions for the requested object.',
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      }
    },
  );
}
