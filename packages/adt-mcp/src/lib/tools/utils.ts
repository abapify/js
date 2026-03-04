/**
 * Shared utilities for MCP tool implementations.
 */

export interface SearchObject {
  name?: string;
  type?: string;
  uri?: string;
  description?: string;
  packageName?: string;
}

/**
 * Extract object references from various ADT search response shapes.
 */
export function extractObjectReferences(results: unknown): SearchObject[] {
  const resultsAny = results as Record<string, unknown>;
  let rawObjects: SearchObject | SearchObject[] | undefined;

  if ('objectReferences' in resultsAny && resultsAny.objectReferences) {
    const refs = resultsAny.objectReferences as {
      objectReference?: SearchObject | SearchObject[];
    };
    rawObjects = refs.objectReference;
  } else if ('objectReference' in resultsAny) {
    rawObjects = resultsAny.objectReference as SearchObject | SearchObject[];
  } else if ('mainObject' in resultsAny && resultsAny.mainObject) {
    const main = resultsAny.mainObject as {
      objectReference?: SearchObject | SearchObject[];
    };
    rawObjects = main.objectReference;
  }

  if (!rawObjects) return [];
  return Array.isArray(rawObjects) ? rawObjects : [rawObjects];
}
