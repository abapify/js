/**
 * ADT ATC (ABAP Test Cockpit) Contracts
 * 
 * Structure mirrors URL tree:
 * - /sap/bc/adt/atc/runs → atc.runs
 * - /sap/bc/adt/atc/results → atc.results
 * - /sap/bc/adt/atc/worklists → atc.worklists
 */

import { http, contract } from '../../base';
import { atcworklist } from '../../schemas';

/**
 * /sap/bc/adt/atc/runs
 * @source atcruns.json
 */
const runs = contract({
  /**
   * POST /sap/bc/adt/atc/runs{?worklistId,clientWait}
   */
  post: (params?: { worklistId?: string; clientWait?: boolean }) =>
    http.post('/sap/bc/adt/atc/runs', {
      query: params,
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml' },
    }),
});

/**
 * /sap/bc/adt/atc/results
 * @source atcresults.json
 */
const results = contract({
  /**
   * GET /sap/bc/adt/atc/results{?activeResult,contactPerson,createdBy,ageMin,ageMax,centralResult,sysId}
   */
  get: (params?: {
    activeResult?: boolean;
    contactPerson?: string;
    createdBy?: string;
    ageMin?: number;
    ageMax?: number;
    centralResult?: boolean;
    sysId?: string;
  }) =>
    http.get('/sap/bc/adt/atc/results', {
      query: params,
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml' },
    }),

  /**
   * GET /sap/bc/adt/atc/results/{displayId}{?activeResult,contactPerson,includeExemptedFindings}
   */
  byDisplayId: {
    get: (
      displayId: string,
      params?: { activeResult?: boolean; contactPerson?: string; includeExemptedFindings?: boolean }
    ) =>
      http.get(`/sap/bc/adt/atc/results/${displayId}`, {
        query: params,
        responses: { 200: atcworklist },
        headers: { Accept: 'application/xml' },
      }),
  },
});

/**
 * /sap/bc/adt/atc/worklists
 * @source atcworklists.json
 */
const worklists = contract({
  /**
   * GET /sap/bc/adt/atc/worklists/{id}
   */
  get: (id: string) =>
    http.get(`/sap/bc/adt/atc/worklists/${id}`, {
      responses: { 200: atcworklist },
      headers: { Accept: 'application/xml' },
    }),
});

export const atcContract = {
  runs,
  results,
  worklists,
};

/** Type alias for the ATC contract */
export type AtcContract = typeof atcContract;
