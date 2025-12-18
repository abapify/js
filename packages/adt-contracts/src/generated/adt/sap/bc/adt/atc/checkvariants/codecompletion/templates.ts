/**
 * CHKV Templates
 * 
 * Endpoint: /sap/bc/adt/atc/checkvariants/codecompletion/templates
 * Category: chkvtyp/codecompletion
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { atc } from '#schemas';

export const templatesContract = contract({
  /**
   * GET CHKV Templates
   */
  get: () =>
    http.get('/sap/bc/adt/atc/checkvariants/codecompletion/templates', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type TemplatesContract = typeof templatesContract;
