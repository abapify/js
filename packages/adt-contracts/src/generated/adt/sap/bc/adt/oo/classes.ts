/**
 * Classes
 * 
 * Endpoint: /sap/bc/adt/oo/classes
 * Category: classes
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '#base';
import { classes } from '#schemas';

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
