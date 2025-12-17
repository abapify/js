/**
 * Autoquickfix
 * 
 * Endpoint: /sap/bc/adt/atc/autoqf/worklist
 * Category: atcautoqf
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const worklistContract = contract({
  /**
   * GET Autoquickfix
   */
  get: () =>
    http.get('/sap/bc/adt/atc/autoqf/worklist', {
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.atc.objectreferences.v1+xml' },
    }),
});

export type WorklistContract = typeof worklistContract;
