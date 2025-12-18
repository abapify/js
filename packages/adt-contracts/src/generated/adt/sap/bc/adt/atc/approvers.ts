/**
 * List of Approvers
 * 
 * Endpoint: /sap/bc/adt/atc/approvers
 * Category: atcapprovers
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const approversContract = contract({
  /**
   * GET List of Approvers
   */
  get: () =>
    http.get('/sap/bc/adt/atc/approvers', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ApproversContract = typeof approversContract;
