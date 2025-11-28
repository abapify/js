/**
 * /sap/bc/adt/cts/transportrequests/valuehelp/target
 */

import { http } from 'speci/rest';

export const target = {
  /**
   * GET /sap/bc/adt/cts/transportrequests/valuehelp/target{?maxItemCount}{&name}
   */
  get: (params?: { maxItemCount?: number; name?: string }) =>
    http.get('/sap/bc/adt/cts/transportrequests/valuehelp/target', {
      query: params,
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'application/xml' },
    }),
};
