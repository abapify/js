/**
 * ADT Discovery Contract
 * 
 * Endpoint: GET /sap/bc/adt/discovery
 * Returns AtomPub service document describing available ADT services.
 */

import { http } from '../../base';
import { discovery } from 'adt-schemas-xsd';

/**
 * Discovery response type - inferred from XSD schema
 */
export type DiscoveryResponse = typeof discovery._infer;

export const discoveryContract = {
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
    http.get('/sap/bc/adt/discovery', {
      responses: { 200: discovery },
      headers: { Accept: 'application/atomsvc+xml' },
    }),
};

export type DiscoveryContract = typeof discoveryContract;
