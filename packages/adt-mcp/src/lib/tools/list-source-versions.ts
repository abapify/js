/**
 * Tool: list_source_versions — list immutable source-version metadata for an
 * ABAP object (optionally narrowed to one source component).
 *
 * Source bodies and SAP locators are intentionally excluded. A bounded
 * immutable read requires a capability from an exact transport manifest.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExactSourceHistoryService } from '@abapify/adt-cli';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';

type SourceVersionMetadata = {
  sourceUri: string;
  [key: string]: unknown;
};

type SourceVersionListing = {
  object: {
    name: string;
    type: string;
    packageName?: string;
  };
  components: readonly {
    id: string;
    sourceUri?: string;
    versionsUri?: string;
    versions?: readonly SourceVersionMetadata[];
    diagnostic?: unknown;
  }[];
};

/** Keep immutable source locators inside the sidecar, never in MCP metadata. */
export function toMcpSourceVersionListing(result: SourceVersionListing) {
  return {
    object: result.object,
    components: result.components.map((component) => ({
      id: component.id,
      ...(component.versions
        ? {
            versions: component.versions.map(
              ({ sourceUri: _sourceUri, ...metadata }) => metadata,
            ),
          }
        : {}),
      ...(component.diagnostic !== undefined
        ? { diagnostic: component.diagnostic }
        : {}),
    })),
  };
}

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
              text: JSON.stringify(
                toMcpSourceVersionListing(result as SourceVersionListing),
                null,
                2,
              ),
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
