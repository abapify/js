/**
 * ATC Items
 * 
 * Endpoint: /sap/bc/adt/atc/items
 * Category: atcitems
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const itemsContract = contract({
  /**
   * GET ATC Items
   */
  get: () =>
    http.get('/sap/bc/adt/atc/items', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ItemsContract = typeof itemsContract;
