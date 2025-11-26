/**
 * /sap/bc/adt/cts/transportchecks
 * @source transportchecks.json
 */

import { http } from 'speci/rest';

export const transportchecks = {
  /**
   * GET /sap/bc/adt/cts/transportchecks
   */
  get: () =>
    http.get('/sap/bc/adt/cts/transportchecks', {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'application/xml' },
    }),
};
