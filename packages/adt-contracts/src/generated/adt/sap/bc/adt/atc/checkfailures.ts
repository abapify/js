/**
 * Check Failure
 * 
 * Endpoint: /sap/bc/adt/atc/checkfailures
 * Category: atccheckfailures
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const checkfailuresContract = contract({
  /**
   * GET Check Failure
   */
  checkfailures: (worklistId: string, params?: { displayId?: string }) =>
    http.get(`/sap/bc/adt/atc/checkfailures/${worklistId}`, {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type CheckfailuresContract = typeof checkfailuresContract;
