/**
 * Interfaces
 * 
 * Endpoint: /sap/bc/adt/oo/interfaces
 * Category: interfaces
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { interfaces } from '#schemas';

export const interfacesContract = contract({
  /**
   * GET Interfaces
   */
  get: () =>
    http.get('/sap/bc/adt/oo/interfaces', {
      responses: { 200: interfaces },
      headers: { Accept: 'application/vnd.sap.adt.oo.interfaces.v4+xml' },
    }),
});

export type InterfacesContract = typeof interfacesContract;
