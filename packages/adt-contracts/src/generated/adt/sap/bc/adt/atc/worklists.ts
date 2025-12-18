/**
 * ATC worklist
 * 
 * Endpoint: /sap/bc/adt/atc/worklists
 * Category: atcworklists
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atcworklist } from '#schemas';

export const worklistsContract = contract({
  /**
   * POST ATC worklist
   */
  post: (params?: { checkVariant?: string }) =>
    http.post('/sap/bc/adt/atc/worklists', {
      query: params,
      body: atcworklist,
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' },
    }),
  /**
   * GET ATC worklist
   */
  get: (worklistId: string, params?: { timestamp?: string; usedObjectSet?: string; includeExemptedFindings?: string }) =>
    http.get(`/sap/bc/adt/atc/worklists/${worklistId}`, {
      query: params,
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml' },
    }),
  /**
   * GET ATC worklist
   */
  objectset: (worklistId: string, objectSetName: string, params?: { timestamp?: string; includeExemptedFindings?: string }) =>
    http.get(`/sap/bc/adt/atc/worklists/${worklistId}/${objectSetName}`, {
      query: params,
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml' },
    }),
  /**
   * DELETE ATC worklist
   */
  deletefindings: (worklistId: string, params?: { action?: string }) =>
    http.delete(`/sap/bc/adt/atc/worklists/${worklistId}`, {
      query: params,
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml' },
    }),
});

export type WorklistsContract = typeof worklistsContract;
