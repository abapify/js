/**
 * Classes
 * 
 * Endpoint: /sap/bc/adt/oo/classes
 * Category: classes
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { classes } from '@abapify/adt-contracts/schemas';

export const classesContract = contract({
  /**
   * GET Classes
   */
  get: () =>
    http.get('/sap/bc/adt/oo/classes', {
      responses: { 200: classes },
      headers: { Accept: 'application/vnd.sap.adt.oo.classes.v2+xml' },
    }),
});

export type ClassesContract = typeof classesContract;
