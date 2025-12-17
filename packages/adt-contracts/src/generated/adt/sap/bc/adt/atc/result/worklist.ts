/**
 * Result Worklist
 * 
 * Endpoint: /sap/bc/adt/atc/result/worklist
 * Category: atcresultworklist
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const worklistContract = contract({
  /**
   * GET Result Worklist
   */
  worklist: (worklistId: string, displayId: string, params?: { contactPerson?: string }) =>
    http.get(`/sap/bc/adt/atc/result/worklist/${worklistId}/${displayId}`, {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type WorklistContract = typeof worklistContract;
