/**
 * ADT Discovery - REST Contract
 *
 * Speci contract for ADT discovery endpoints
 */

import { adtHttp, createContract } from '../../base/contract';
import { DiscoverySchema } from './discovery.schema';

/**
 * ADT Discovery Contract
 *
 * Provides access to SAP ADT service discovery information.
 * Discovery returns an AtomPub service document describing available ADT services.
 */
export const discoveryContract = createContract({
  /**
   * Get Discovery Information
   *
   * Returns the ADT service discovery document in AtomPub format.
   * This document describes all available ADT services, workspaces, and collections.
   *
   * @endpoint GET /sap/bc/adt/discovery
   * @returns AtomPub service document with workspace and collection information
   */
  getDiscovery: () =>
    adtHttp.get('/sap/bc/adt/discovery', {
      responses: { 200: DiscoverySchema },
      headers: { Accept: 'application/atomsvc+xml' },
    }),
});

export type DiscoveryContract = typeof discoveryContract;
