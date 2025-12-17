/**
 * Package Settings
 * 
 * Endpoint: /sap/bc/adt/packages/settings
 * Category: settings
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { packagesV1 } from '@abapify/adt-contracts/schemas';

export const settingsContract = contract({
  /**
   * GET Package Settings
   */
  get: () =>
    http.get('/sap/bc/adt/packages/settings', {
      responses: { 200: packagesV1 },
      headers: { Accept: 'application/xml' },
    }),
});

export type SettingsContract = typeof settingsContract;
