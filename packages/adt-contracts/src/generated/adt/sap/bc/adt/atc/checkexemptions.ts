/**
 * Exemption
 * 
 * Endpoint: /sap/bc/adt/atc/checkexemptions
 * Category: chketyp
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atcexemption } from '#schemas';

export const checkexemptionsContract = contract({
  /**
   * GET Exemption
   */
  properties: (object_name: string, params?: { corrNr?: string; lockHandle?: string; version?: string; accessMode?: string; _action?: string }) =>
    http.get(`/sap/bc/adt/atc/checkexemptions/${object_name}`, {
      query: params,
      responses: { 200: atcexemption },
      headers: { Accept: 'application/vnd.sap.adt.chkev2+xml' },
    }),
});

export type CheckexemptionsContract = typeof checkexemptionsContract;
