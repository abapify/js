import { AdtEndpointMapping } from '../types.js';

/**
 * Data Dictionary (DDIC) endpoint mappings for Domains, Data Elements, etc.
 */
export const DDIC_MAPPINGS: Record<string, AdtEndpointMapping> = {
  Domain: {
    baseEndpoint: '/sap/bc/adt/ddic/domains',
    contentType: 'application/vnd.sap.adt.ddic.domains.v1+xml',
    acceptType: 'application/vnd.sap.adt.ddic.domains.v1+xml',
    getActivationUri: (objectName: string) =>
      `/sap/bc/adt/ddic/domains/${objectName.toLowerCase()}`,
    // Note: Domains don't have source endpoints
  },
};
