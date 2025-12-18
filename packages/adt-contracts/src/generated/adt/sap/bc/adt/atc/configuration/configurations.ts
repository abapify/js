/**
 * ATC Configuration
 * 
 * Endpoint: /sap/bc/adt/atc/configuration/configurations
 * Category: atcConfiguration
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const configurationsContract = contract({
  /**
   * GET ATC Configuration
   */
  get: () =>
    http.get('/sap/bc/adt/atc/configuration/configurations', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ConfigurationsContract = typeof configurationsContract;
