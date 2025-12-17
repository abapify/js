/**
 * CCS Tunnel
 * 
 * Endpoint: /sap/bc/adt/atc/ccstunnel
 * Category: ccstunnel
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const ccstunnelContract = contract({
  /**
   * GET CCS Tunnel
   */
  ccstunnel: (params?: { targetUri?: string }) =>
    http.get('/sap/bc/adt/atc/ccstunnel', {
      query: params,
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type CcstunnelContract = typeof ccstunnelContract;
