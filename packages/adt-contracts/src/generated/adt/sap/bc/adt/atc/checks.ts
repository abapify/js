/**
 * Check
 * 
 * Endpoint: /sap/bc/adt/atc/checks
 * Category: chkotyp
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const checksContract = contract({
  /**
   * GET Check
   */
  properties: (object_name: string, params?: { corrNr?: string; lockHandle?: string; version?: string; accessMode?: string; _action?: string }) =>
    http.get(`/sap/bc/adt/atc/checks/${object_name}`, {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.chkov1+xml' },
    }),
  /**
   * GET Check
   */
  parameter: (params?: { checkname?: string; chkoname?: string }) =>
    http.get('/sap/bc/adt/atc/checks/parameter', {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.chkov1+xml' },
    }),
  /**
   * GET Check
   */
  remoteenabled: (params?: { checkname?: string }) =>
    http.get('/sap/bc/adt/atc/checks/remoteenabled', {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/vnd.sap.adt.chkov1+xml' },
    }),
});

export type ChecksContract = typeof checksContract;
