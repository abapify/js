/**
 * Check Name Validation
 * 
 * Endpoint: /sap/bc/adt/atc/checks/validation
 * Category: chkotyp/validation
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const validationContract = contract({
  /**
   * GET Check Name Validation
   */
  get: () =>
    http.get('/sap/bc/adt/atc/checks/validation', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ValidationContract = typeof validationContract;
