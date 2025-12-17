/**
 * ATC runs
 * 
 * Endpoint: /sap/bc/adt/atc/runs
 * Category: atcruns
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atcworklist } from '@abapify/adt-contracts/schemas';

export const runsContract = contract({
  /**
   * GET ATC runs
   */
  worklist: (params?: { worklistId?: string; clientWait?: string }) =>
    http.get('/sap/bc/adt/atc/runs', {
      query: params,
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml' },
    }),
});

export type RunsContract = typeof runsContract;
