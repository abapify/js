/**
 * Exemptions View
 * 
 * Endpoint: /sap/bc/adt/atc/checkexemptionsview
 * Category: exemptionsView
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const checkexemptionsviewContract = contract({
  /**
   * GET Exemptions View
   */
  checkexemptionsview: (exemptionName: string, params?: { aggregatesOnly?: string; requestedBy?: string; assessedBy?: string; assessableBy?: string; exemptionState?: string }) =>
    http.get(`/sap/bc/adt/atc/checkexemptionsview${exemptionName}`, {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type CheckexemptionsviewContract = typeof checkexemptionsviewContract;
