/**
 * ATC Items
 * 
 * Endpoint: /sap/bc/adt/atc/items
 * Category: atcitems
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

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
