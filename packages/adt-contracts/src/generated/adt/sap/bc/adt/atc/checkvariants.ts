/**
 * Check Variant
 * 
 * Endpoint: /sap/bc/adt/atc/checkvariants
 * Category: chkvtyp
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const checkvariantsContract = contract({
  /**
   * GET Check Variant
   */
  properties: (object_name: string, params?: { corrNr?: string; lockHandle?: string; version?: string; accessMode?: string; _action?: string }) =>
    http.get(`/sap/bc/adt/atc/checkvariants/${object_name}`, {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.chkvv4+xml' },
    }),
  /**
   * GET Check Variant
   */
  formtemplate: (params?: { chkvName?: string; version?: string }) =>
    http.get('/sap/bc/adt/atc/checkvariants/formtemplate', {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.chkvv4+xml' },
    }),
  /**
   * GET Check Variant
   */
  checkschema: (params?: { chkoName?: string }) =>
    http.get('/sap/bc/adt/atc/checkvariants/schema', {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.chkvv4+xml' },
    }),
});

export type CheckvariantsContract = typeof checkvariantsContract;
