/**
 * ADT Repository Information System - Search Contract
 *
 * REST contract for searching ABAP objects
 */

import { createContract, adtHttp } from '../../../base/contract';
import { ObjectReferencesSchema, type ObjectReferencesXml } from './search-schema';

/**
 * Search contract for ABAP repository objects
 *
 * Supports quick search and advanced search operations
 */
export const searchContract = createContract({
  /**
   * Quick search for ABAP objects
   *
   * @param query - Search query (supports wildcards like *)
   * @param maxResults - Maximum number of results (default: 50)
   * @returns Object references matching the search query
   *
   * @example
   * // Search for classes starting with ZCL
   * const results = await client.adt.repository.informationsystem.search.quickSearch({
   *   query: 'zcl*',
   *   maxResults: 10
   * });
   */
  quickSearch: (options: { query: string; maxResults?: number }) =>
    adtHttp.get('/sap/bc/adt/repository/informationsystem/search', {
      query: {
        operation: 'quickSearch',
        query: options.query,
        maxResults: options.maxResults || 50,
      },
      responses: {
        200: ObjectReferencesSchema,
      },
    }),
});

export type SearchContract = typeof searchContract;
