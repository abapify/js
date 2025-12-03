/**
 * ADT Repository Information System - Search Contract
 *
 * ABAP object search operations.
 * Path: /sap/bc/adt/repository/informationsystem/search
 */

import { http } from '../../../base';
import { adtcore } from 'adt-schemas-xsd';

export const searchContract = {
  /**
   * Quick search for ABAP objects
   *
   * @param query - Search query (supports wildcards like *)
   * @param maxResults - Maximum number of results (default: 50)
   * @returns Object references matching the search query (union of all adtcore element types)
   *
   * @example
   * // Search for classes starting with ZCL
   * const results = await client.repository.informationsystem.search.quickSearch({
   *   query: 'zcl*',
   *   maxResults: 10
   * });
   */
  quickSearch: (options: { query: string; maxResults?: number }) =>
    http.get('/sap/bc/adt/repository/informationsystem/search', {
      query: {
        operation: 'quickSearch',
        query: options.query,
        maxResults: options.maxResults || 50,
      },
      responses: {
        200: adtcore,
      },
    }),
};

export type SearchContract = typeof searchContract;
