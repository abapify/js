/**
 * Tool: get_source_version — explicitly retrieve one immutable historical
 * source body selected from ADT source-version metadata.
 */

import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExactSourceHistoryService } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

const DEFAULT_MAX_SOURCE_BYTES = 1024 * 1024;
const HARD_MAX_SOURCE_BYTES = 4 * 1024 * 1024;

export function registerGetSourceVersionTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'get_source_version',
    'Explicitly read one immutable ADT source version. The UTF-8 response is bounded and is never silently truncated.',
    {
      ...sessionOrConnectionShape,
      uri: z
        .string()
        .min(1)
        .describe('Immutable server-relative SAP ADT source URI'),
      maxBytes: z
        .number()
        .int()
        .positive()
        .max(HARD_MAX_SOURCE_BYTES)
        .optional()
        .describe(
          `Maximum UTF-8 response size in bytes (default ${DEFAULT_MAX_SOURCE_BYTES}, hard cap ${HARD_MAX_SOURCE_BYTES})`,
        ),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const service = new ExactSourceHistoryService(client);
        const source = await service.getVersionSource({ uri: args.uri });
        const bytes = Buffer.byteLength(source, 'utf8');
        const maxBytes = args.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;

        if (bytes > maxBytes) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    error: {
                      code: 'SOURCE_VERSION_TOO_LARGE',
                      message:
                        'The immutable source version exceeds the requested MCP response limit.',
                      actualBytes: bytes,
                      maxBytes,
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ bytes, source }, null, 2),
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
                    code: 'SOURCE_VERSION_READ_FAILED',
                    message:
                      'Could not read the requested immutable source version.',
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
