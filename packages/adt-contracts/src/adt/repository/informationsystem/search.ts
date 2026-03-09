/**
 * ADT Repository Information System - Search Contract
 *
 * ABAP object search operations.
 * Path: /sap/bc/adt/repository/informationsystem/search
 */

import { http } from '../../../base';
import { adtcore } from '../../../schemas';

export const searchContract = {
  /**
   * Quick search for ABAP objects
   *
   * @param query - Search query (supports wildcards like *)
   * @param maxResults - Maximum number of results (default: 50)
   * @param packageName - Filter by package name
   * @param objectType - Filter by object type (e.g., 'CLAS', 'INTF')
   * @returns Object references matching the search query (union of all adtcore element types)
   *
   * @example
   * // Search for classes starting with ZCL
   * const results = await client.repository.informationsystem.search.quickSearch({
   *   query: 'zcl*',
   *   maxResults: 10
   * });
   *
   * @example
   * // List all objects in a package
   * const results = await client.repository.informationsystem.search.quickSearch({
   *   query: '*',
   *   packageName: 'ZABAPGIT_EXAMPLES',
   *   maxResults: 200
   * });
   */
  quickSearch: (options: {
    query: string;
    maxResults?: number;
    packageName?: string;
    objectType?: string;
  }) =>
    http.get('/sap/bc/adt/repository/informationsystem/search', {
      query: {
        operation: 'quickSearch',
        query: options.query,
        maxResults: options.maxResults || 50,
        ...(options.packageName && { packageName: options.packageName }),
        ...(options.objectType && { objectType: options.objectType }),
      },
      responses: {
        200: adtcore,
      },
      headers: {
        Accept: 'application/xml',
      },
    }),
};

export type SearchContract = typeof searchContract;
