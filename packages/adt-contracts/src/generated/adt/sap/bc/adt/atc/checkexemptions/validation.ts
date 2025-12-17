/**
 * Exemption Name Validation
 * 
 * Endpoint: /sap/bc/adt/atc/checkexemptions/validation
 * Category: chketyp/validation
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const validationContract = contract({
  /**
   * GET Exemption Name Validation
   */
  get: () =>
    http.get('/sap/bc/adt/atc/checkexemptions/validation', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ValidationContract = typeof validationContract;
