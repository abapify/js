/**
 * Tool: get_badi – read-only BAdI information for any flavour.
 */

import { z } from 'zod';
import { BadiService } from '@abapify/adt-cli';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

export function registerGetBadiTool(server: McpServer, ctx: ToolContext): void {
  server.tool(
    'get_badi',
    'Read BAdI information (classic SXSD/SXCI definition or implementation, or ENHO/XHH). Kind is auto-detected. Use includeImplementations on a definition to list its classic implementations.',
    {
      ...sessionOrConnectionShape,
      badiName: z
        .string()
        .describe(
          'BAdI name — definition, implementation (SXCI/XI), or ENHO container',
        ),
      includeSource: z
        .boolean()
        .optional()
        .describe('Include ENHO/XHH source text when kind is enhancement'),
      includeImplementations: z
        .boolean()
        .optional()
        .describe(
          'When badiName is a classic definition (SXSD/XD), include its SXCI/XI implementations',
        ),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const result = await new BadiService(client).get({
          name: args.badiName,
          options: {
            includeSource: args.includeSource,
            includeImplementations: args.includeImplementations,
          },
        });
        if (args.includeImplementations && result.kind !== 'definition') {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: 'includeImplementations is only valid for classic BAdI definitions (SXSD/XD)',
              },
            ],
          };
        }
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
              text: `Get BAdI failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
