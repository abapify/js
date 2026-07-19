/**
 * Tool: get_source – fetch ABAP source code for an object
 *
 * CLI equivalent: `adt source get <objectName>`
 *
 * Returns the raw ABAP source code for programs, classes, interfaces, etc.
 */

import { Buffer } from 'node:buffer';
import { AdtResponseTooLargeError } from '@abapify/adt-client';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';
import { resolveObjectUri } from './utils';

const DEFAULT_MAX_SOURCE_BYTES = 1024 * 1024;
const HARD_MAX_SOURCE_BYTES = 2 * 1024 * 1024;

function sourceTooLargeResult(maxBytes: number) {
  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          error: {
            code: 'SOURCE_TOO_LARGE',
            message: 'The source exceeds the requested MCP response limit.',
            maxBytes,
          },
        }),
      },
    ],
  };
}

export function registerGetSourceTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'get_source',
    'Fetch ABAP source code for an object (program, class, interface, etc.)',
    {
      ...sessionOrConnectionShape,
      objectName: z.string().describe('ABAP object name'),
      objectType: z
        .string()
        .optional()
        .describe(
          'Object type (e.g. PROG, CLAS, INTF). Speeds up URI resolution when known.',
        ),
      maxBytes: z
        .number()
        .int()
        .positive()
        .max(HARD_MAX_SOURCE_BYTES)
        .optional()
        .describe(
          `Maximum UTF-8 response size in bytes (default ${DEFAULT_MAX_SOURCE_BYTES}, hard cap ${HARD_MAX_SOURCE_BYTES}). Oversized source is rejected, never truncated.`,
        ),
    },
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});

        const objectUri = await resolveObjectUri(
          client,
          args.objectName,
          args.objectType,
        );
        if (!objectUri) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Object '${args.objectName}' not found`,
              },
            ],
          };
        }

        const maxBytes = args.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;
        let source: string;
        try {
          source = await client.readTextBounded(
            `${objectUri}/source/main`,
            maxBytes,
            { headers: { Accept: 'text/plain' } },
          );
        } catch (error) {
          if (error instanceof AdtResponseTooLargeError) {
            return sourceTooLargeResult(maxBytes);
          }
          throw error;
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                bytes: Buffer.byteLength(source, 'utf8'),
                source,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Get source failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
