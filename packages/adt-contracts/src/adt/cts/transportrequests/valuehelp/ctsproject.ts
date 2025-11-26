/**
 * /sap/bc/adt/cts/transportrequests/valuehelp/ctsproject
 */

import { http } from 'speci/rest';

export const ctsproject = {
  /**
   * GET /sap/bc/adt/cts/transportrequests/valuehelp/ctsproject{?maxItemCount}{&name}
   */
  get: (params?: { maxItemCount?: number; name?: string }) =>
    http.get('/sap/bc/adt/cts/transportrequests/valuehelp/ctsproject', {
      query: params,
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'application/xml' },
    }),
};
