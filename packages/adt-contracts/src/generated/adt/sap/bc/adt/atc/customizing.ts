/**
 * ATC customizing
 * 
 * Endpoint: /sap/bc/adt/atc/customizing
 * Category: atccustomizing
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const customizingContract = contract({
  /**
   * GET ATC customizing
   */
  get: () =>
    http.get('/sap/bc/adt/atc/customizing', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type CustomizingContract = typeof customizingContract;
