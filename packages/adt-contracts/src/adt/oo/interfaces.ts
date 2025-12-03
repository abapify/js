/**
 * ADT OO Interfaces Contract
 * 
 * Endpoint: /sap/bc/adt/oo/interfaces
 * Full CRUD operations for ABAP interfaces including source code management.
 */

import { http, contract } from '../../base';
import { interfaces as interfacesSchema } from 'adt-schemas-xsd';
import type { InferElement } from 'ts-xsd';
import type { RestContract } from 'speci/rest';

/**
 * Interface response type - exported for consumers (ADK, etc.)
 * 
 * This is the canonical type for interface metadata.
 * Consumers should import this type instead of inferring from speci internals.
 * 
 * Note: Using InferElement instead of InferXsd because the interfaces schema has
 * a single root element (abapInterface). InferXsd would create a type that
 * exceeds TypeScript's serialization limits (TS7056).
 */
export type InterfaceResponse = InferElement<typeof interfacesSchema, 'abapInterface'>;

/**
 * /sap/bc/adt/oo/interfaces
 * Full CRUD operations for ABAP interfaces
 */
const _interfacesContract: RestContract = contract({
  /**
   * GET /sap/bc/adt/oo/interfaces/{name}
   * Retrieve interface metadata
   */
  get: (name: string) =>
    http.get(`/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`, {
      responses: { 200: interfacesSchema },
      headers: { Accept: 'application/vnd.sap.adt.oo.interfaces.v5+xml' },
    }),

  /**
   * POST /sap/bc/adt/oo/interfaces
   * Create a new interface
   */
  post: (body: string) =>
    http.post('/sap/bc/adt/oo/interfaces', {
      body,
      responses: { 200: interfacesSchema },
      headers: {
        Accept: 'application/vnd.sap.adt.oo.interfaces.v5+xml',
        'Content-Type': 'application/vnd.sap.adt.oo.interfaces.v5+xml',
      },
    }),

  /**
   * PUT /sap/bc/adt/oo/interfaces/{name}
   * Update interface metadata (properties)
   */
  put: (name: string, body: string) =>
    http.put(`/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`, {
      body,
      responses: { 200: interfacesSchema },
      headers: {
        Accept: 'application/vnd.sap.adt.oo.interfaces.v5+xml',
        'Content-Type': 'application/vnd.sap.adt.oo.interfaces.v5+xml',
      },
    }),

  /**
   * DELETE /sap/bc/adt/oo/interfaces/{name}
   * Delete an interface
   */
  delete: (name: string) =>
    http.delete(`/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`, {
      responses: { 204: undefined },
    }),

  /**
   * /sap/bc/adt/oo/interfaces/{name}/source
   * Source code operations for interface
   */
  source: {
    /**
     * /sap/bc/adt/oo/interfaces/{name}/source/main
     * Interface source code
     */
    main: {
      get: (name: string) =>
        http.get(`/sap/bc/adt/oo/interfaces/${name.toLowerCase()}/source/main`, {
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain' },
        }),

      put: (name: string, source: string) =>
        http.put(`/sap/bc/adt/oo/interfaces/${name.toLowerCase()}/source/main`, {
          body: source,
          responses: { 200: undefined as unknown as string },
          headers: {
            Accept: 'text/plain',
            'Content-Type': 'text/plain',
          },
        }),
    },
  },
});

export type InterfacesContract = RestContract;

/** Exported contract for interfaces operations */
export const interfacesContract: InterfacesContract = _interfacesContract;
