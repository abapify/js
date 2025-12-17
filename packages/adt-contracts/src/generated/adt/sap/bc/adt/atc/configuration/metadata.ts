/**
 * ATC Configuration (Metadata)
 * 
 * Endpoint: /sap/bc/adt/atc/configuration/metadata
 * Category: atcConfigurationMetadata
 * 
 * @generated - DO NOT EDIT MANUALLY
 */

import { http, contract } from '@abapify/adt-contracts/base';
import { atc } from '@abapify/adt-contracts/schemas';

export const metadataContract = contract({
  /**
   * GET ATC Configuration (Metadata)
   */
  get: () =>
    http.get('/sap/bc/adt/atc/configuration/metadata', {
      responses: { 200: atc },
      headers: { Accept: 'application/xml' },
    }),
});

export type MetadataContract = typeof metadataContract;
