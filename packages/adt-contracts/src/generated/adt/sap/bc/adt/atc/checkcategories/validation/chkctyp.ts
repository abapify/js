/**
 * Check Category Name Validation
 * 
 * Endpoint: /sap/bc/adt/atc/checkcategories/validation
 * Category: chkctyp/validation
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const chkctypContract = contract({
  /**
   * GET Check Category Name Validation
   */
  get: () =>
    http.get('/sap/bc/adt/atc/checkcategories/validation', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ChkctypContract = typeof chkctypContract;
