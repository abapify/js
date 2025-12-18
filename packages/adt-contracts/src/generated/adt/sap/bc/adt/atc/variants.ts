/**
 * List of Variants
 * 
 * Endpoint: /sap/bc/adt/atc/variants
 * Category: atcvariants
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const variantsContract = contract({
  /**
   * GET List of Variants
   */
  referencevariant: (params?: { maxItemCount?: string; data?: string }) =>
    http.get('/sap/bc/adt/atc/variants', {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type VariantsContract = typeof variantsContract;
