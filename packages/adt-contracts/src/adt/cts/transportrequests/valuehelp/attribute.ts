/**
 * /sap/bc/adt/cts/transportrequests/valuehelp/attribute
 */

import { http } from 'speci/rest';

export const attribute = {
  /**
   * GET /sap/bc/adt/cts/transportrequests/valuehelp/attribute{?maxItemCount}{&name}
   */
  get: (params?: { maxItemCount?: number; name?: string }) =>
    http.get('/sap/bc/adt/cts/transportrequests/valuehelp/attribute', {
      query: params,
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'application/xml' },
    }),
};
