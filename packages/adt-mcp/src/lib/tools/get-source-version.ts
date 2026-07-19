/**
 * Tool: get_source_version — explicitly retrieve one immutable historical
 * source body selected from ADT source-version metadata.
 */

import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SourceVersionTooLargeError } from '@abapify/adt-client';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';
import { SourceCapabilityError } from '../source-capabilities.js';

const DEFAULT_MAX_SOURCE_BYTES = 1024 * 1024;
const HARD_MAX_SOURCE_BYTES = 2 * 1024 * 1024;

export function registerGetSourceVersionTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'get_source_version',
    'Read one manifest-authorised immutable ADT source version. The UTF-8 response is bounded and is never silently truncated.',
    {
      ...sessionOrConnectionShape,
      sourceCapability: z
        .string()
        .min(1)
        .max(256)
        .describe(
          'Opaque capability returned by cts_transport_source_manifest',
        ),
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
        const destination = (args as { destination?: string }).destination;
        const sourceReference = ctx.sourceCapabilities?.resolve({
          sourceCapability: args.sourceCapability,
          sessionId: extra?.sessionId,
          ...(destination !== undefined ? { destination } : {}),
        });
        if (!sourceReference) throw new SourceCapabilityError();
        const { client } = await resolveClient(ctx, args, extra ?? {});
        const maxBytes = args.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;
        const source =
          await client.services.sourceHistory.readVersionSourceBounded(
            sourceReference.sourceUri,
            maxBytes,
          );

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { bytes: Buffer.byteLength(source, 'utf8'), source },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        if (error instanceof SourceVersionTooLargeError) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  error: {
                    code: 'SOURCE_VERSION_TOO_LARGE',
                    message:
                      'The immutable source version exceeds the requested MCP response limit.',
                    maxBytes: error.maxBytes,
                  },
                }),
              },
            ],
          };
        }
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  error: {
                    code:
                      error instanceof SourceCapabilityError
                        ? 'SOURCE_CAPABILITY_UNAVAILABLE'
                        : 'SOURCE_VERSION_READ_FAILED',
                    message:
                      error instanceof SourceCapabilityError
                        ? 'The immutable source capability is unavailable.'
                        : 'Could not read the requested immutable source version.',
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
