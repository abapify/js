/**
 * Transport Search Configurations
 * 
 * Endpoint: /sap/bc/adt/cts/transportrequests/searchconfiguration/configurations
 * Category: transportconfigurations
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { transportmanagment } from '@abapify/adt-contracts/schemas';

export const configurationsContract = contract({
  /**
   * GET Transport Search Configurations
   */
  get: () =>
    http.get('/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations', {
      responses: { 200: transportmanagment },
      headers: { Accept: 'application/xml' },
    }),
});

export type ConfigurationsContract = typeof configurationsContract;
