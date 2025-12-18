/**
 * Check Category Name Validation
 * 
 * Endpoint: /sap/bc/adt/atc/checkcategories/validation
 * Category: chkctyp/validation
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const validationContract = contract({
  /**
   * GET Check Category Name Validation
   */
  get: () =>
    http.get('/sap/bc/adt/atc/checkcategories/validation', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ValidationContract = typeof validationContract;
