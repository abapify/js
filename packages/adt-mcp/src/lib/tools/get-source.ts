/**
 * Tool: get_source – fetch ABAP source code for an object
 *
 * CLI equivalent: `adt source get <objectName>`
 *
 * Returns the raw ABAP source code for programs, classes, interfaces, etc.
 * Enhanced for arc-1 SAPRead parity:
 *   - `version` (active/inactive)
 *   - `include` for class includes and source sections
 *   - `method` for method-level reads on classes
 *   - `grep` for token-efficient regex search within source
 *   - `format` (raw or structured) for class includes / method boundaries
 *
 * Implementation is delegated to the shared `GetSourceService` in
 * `@abapify/adt-cli` so the CLI and MCP surfaces stay in lock-step.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getSource, GetSourceTooLargeError } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

const DEFAULT_MAX_SOURCE_BYTES = 1024 * 1024;
const HARD_MAX_SOURCE_BYTES = 2 * 1024 * 1024;

const sourceToolInputSchema = {
  ...sessionOrConnectionShape,
  objectName: z.string().describe('ABAP object name'),
  objectType: z
    .string()
    .optional()
    .describe(
      'Object type (e.g. PROG, CLAS, INTF). Speeds up URI resolution when known.',
    ),
  version: z
    .enum(['active', 'inactive'])
    .optional()
    .default('active')
    .describe(
      'Source version: active (default, last activated) or inactive (unactivated draft).',
    ),
  include: z
    .string()
    .optional()
    .describe(
      'For CLAS: source include such as definitions, implementations, testclasses, macros, or main.',
    ),
  method: z
    .string()
    .optional()
    .describe('For CLAS: method name to read, or "*" to list all methods.'),
  grep: z
    .string()
    .optional()
    .describe(
      'Regex pattern; returns only matching source lines with context instead of full source.',
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
  format: z
    .enum(['raw', 'structured'])
    .optional()
    .default('raw')
    .describe(
      'Output format: raw source text, or structured JSON with class includes and method boundaries.',
    ),
};

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

function errorResult(message: string) {
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: message }],
  };
}

function successResult(payload: unknown) {
  return {
    content: [
      { type: 'text' as const, text: JSON.stringify(payload, null, 2) },
    ],
  };
}

export function registerGetSourceTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'get_source',
    'Fetch ABAP source code for an object (program, class, interface, etc.) with optional version, include, method-level, grep filtering, or structured output.',
    sourceToolInputSchema,
    async (args, extra) => {
      try {
        const { client } = await resolveClient(ctx, args, extra ?? {});

        const result = await getSource(client, {
          objectName: args.objectName,
          objectType: args.objectType,
          version: args.version,
          include: args.include,
          method: args.method,
          grep: args.grep,
          maxBytes: args.maxBytes,
          format: args.format,
        });

        return successResult(result);
      } catch (error) {
        if (error instanceof GetSourceTooLargeError) {
          return sourceTooLargeResult(error.maxBytes);
        }
        return errorResult(
          `Get source failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );
}
