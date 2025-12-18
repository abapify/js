/**
 * Check Category
 * 
 * Endpoint: /sap/bc/adt/atc/checkcategories
 * Category: chkctyp
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const checkcategoriesContract = contract({
  /**
   * GET Check Category
   */
  properties: (object_name: string, params?: { corrNr?: string; lockHandle?: string; version?: string; accessMode?: string; _action?: string }) =>
    http.get(`/sap/bc/adt/atc/checkcategories/${object_name}`, {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.chkcv1+xml' },
    }),
});

export type CheckcategoriesContract = typeof checkcategoriesContract;
