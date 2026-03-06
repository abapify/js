/**
 * /sap/bc/adt/cts/transportrequests/reference
 * @source transportmanagementref.json
 */

import { http } from '@abapify/speci/rest';

export const reference = {
  get: () =>
    http.get('/sap/bc/adt/cts/transportrequests/reference', {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'application/xml' },
    }),
};
