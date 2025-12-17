/**
 * CHKV Templates
 * 
 * Endpoint: /sap/bc/adt/atc/checkvariants/codecompletion/templates
 * Category: chkvtyp/codecompletion
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const chkvtypContract = contract({
  /**
   * GET CHKV Templates
   */
  get: () =>
    http.get('/sap/bc/adt/atc/checkvariants/codecompletion/templates', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type ChkvtypContract = typeof chkvtypContract;
