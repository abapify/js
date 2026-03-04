/**
 * Tool: search_objects – search ABAP objects in the repository
 *
 * CLI equivalent: `adt search <query>`
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types.js';
import { connectionShape } from './shared-schemas.js';

export function registerSearchObjectsTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'search_objects',
    'Search for ABAP objects in the repository (supports wildcards)',
    {
      ...connectionShape,
      query: z.string().describe('Search query (supports wildcards like *)'),
      maxResults: z
        .number()
        .optional()
        .describe('Maximum number of results (default: 50)'),
    },
    async (args) => {
      try {
        const client = ctx.getClient(args);
        const maxResults = args.maxResults ?? 50;

        const results =
          await client.adt.repository.informationsystem.search.quickSearch({
            query: args.query,
            maxResults,
          });

        type SearchObject = {
          name?: string;
          type?: string;
          uri?: string;
          description?: string;
          packageName?: string;
        };

        const resultsAny = results as Record<string, unknown>;
        let rawObjects: SearchObject | SearchObject[] | undefined;
        if ('objectReferences' in resultsAny && resultsAny.objectReferences) {
          const refs = resultsAny.objectReferences as {
            objectReference?: SearchObject | SearchObject[];
          };
          rawObjects = refs.objectReference;
        } else if ('objectReference' in resultsAny) {
          rawObjects = resultsAny.objectReference as
            | SearchObject
            | SearchObject[];
        } else if ('mainObject' in resultsAny && resultsAny.mainObject) {
          const main = resultsAny.mainObject as {
            objectReference?: SearchObject | SearchObject[];
          };
          rawObjects = main.objectReference;
        }
        const objects: SearchObject[] = rawObjects
          ? Array.isArray(rawObjects)
            ? rawObjects
            : [rawObjects]
          : [];

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ count: objects.length, objects }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
