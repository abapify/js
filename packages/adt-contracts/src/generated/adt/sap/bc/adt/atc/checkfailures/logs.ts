/**
 * Check Failure Details
 * 
 * Endpoint: /sap/bc/adt/atc/checkfailures/logs
 * Category: atccheckfailuresdetails
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const logsContract = contract({
  /**
   * GET Check Failure Details
   */
  logs: (params?: { displayId?: string; objName?: string; objType?: string; moduleId?: string; phaseKey?: string }) =>
    http.get('/sap/bc/adt/atc/checkfailures/logs', {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type LogsContract = typeof logsContract;
