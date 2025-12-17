/**
 * Exemptions Apply
 * 
 * Endpoint: /sap/bc/adt/atc/exemptions/apply
 * Category: atcexemptions
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atcexemption } from '@abapify/adt-contracts/schemas';

export const applyContract = contract({
  /**
   * PUT Exemptions Apply
   */
  template: (params?: { markerId?: string }) =>
    http.put('/sap/bc/adt/atc/exemptions/apply', {
      query: params,
      body: atcexemption,
      responses: { 200: atcexemption },
      headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' },
    }),
  /**
   * PUT Exemptions Apply
   */
  apply: (params?: { markerId?: string }) =>
    http.put('/sap/bc/adt/atc/exemptions/apply', {
      query: params,
      body: atcexemption,
      responses: { 200: atcexemption },
      headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' },
    }),
});

export type ApplyContract = typeof applyContract;
