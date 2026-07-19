/**
 * Tool: cts_transport_source_manifest — build a component-granular, metadata-
 * only source manifest for one or more CTS transports.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExactSourceHistoryService } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

const selectorValue = z.union([
  z.string().trim().min(1),
  z.array(z.string().trim().min(1)).min(1),
]);

export function registerCtsTransportSourceManifestTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'cts_transport_source_manifest',
    'Build an exactness-gated, component-granular source manifest for one or more CTS transports. Returns metadata and immutable references only.',
    {
      ...sessionOrConnectionShape,
      transports: z
        .array(z.string().trim().min(1))
        .min(1)
        .describe('Non-empty ordered list of CTS request or task numbers'),
      selector: z
        .object({
          objFunc: selectorValue
            .optional()
            .describe('CTS object-function filter'),
          pgmid: selectorValue.optional().describe('CTS program-id filter'),
          type: selectorValue.optional().describe('ABAP object-type filter'),
        })
        .strict()
        .optional()
        .describe('Optional CTS object selector; dimensions are ANDed'),
      concurrency: z
        .number()
        .int()
        .positive()
        .max(32)
        .optional()
        .describe('Maximum concurrent metadata/feed requests (hard cap 32)'),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const service = new ExactSourceHistoryService(client);
        const manifest = await service.buildTransportManifest({
          transports: args.transports,
          selector: args.selector,
          concurrency: args.concurrency,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(manifest, null, 2),
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
                    code: 'TRANSPORT_SOURCE_MANIFEST_FAILED',
                    message:
                      'Could not build the requested transport source manifest.',
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
