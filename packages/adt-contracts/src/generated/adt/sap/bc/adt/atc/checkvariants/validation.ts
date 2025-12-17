/**
 * Check Variant Name Validation
 * 
 * Endpoint: /sap/bc/adt/atc/checkvariants/validation
 * Category: chkvtyp/validation
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const validationContract = contract({
  /**
   * GET Check Variant Name Validation
   */
  get: () =>
    http.get('/sap/bc/adt/atc/checkvariants/validation', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ValidationContract = typeof validationContract;
