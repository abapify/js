/**
 * /sap/bc/adt/cts/transportrequests/valuehelp/object
 */

import { http } from 'speci/rest';

export const object = {
  /**
   * GET /sap/bc/adt/cts/transportrequests/valuehelp/object/{field}{?maxItemCount}{&name}
   */
  get: (field: string, params?: { maxItemCount?: number; name?: string }) =>
    http.get(`/sap/bc/adt/cts/transportrequests/valuehelp/object/${field}`, {
      query: params,
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'application/xml' },
    }),
};
