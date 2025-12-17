/**
 * Package Name Validation
 * 
 * Endpoint: /sap/bc/adt/packages/validation
 * Category: devck/validation
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { packagesV1 } from '@abapify/adt-contracts/schemas';

export const validationContract = contract({
  /**
   * GET Package Name Validation
   */
  get: () =>
    http.get('/sap/bc/adt/packages/validation', {
      responses: { 200: packagesV1 },
      headers: { Accept: 'application/xml' },
    }),
});

export type ValidationContract = typeof validationContract;
