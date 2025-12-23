/**
 * ADT OO Interfaces Contract
 *
 * Endpoint: /sap/bc/adt/oo/interfaces
 * Full CRUD operations for ABAP interfaces including source code management.
 */

import { http, contract } from '../../base';
import {
  interfaces as interfacesSchema,
  type InferTypedSchema,
} from '../../schemas';

/**
 * Interface response type - exported for consumers (ADK, etc.)
 *
 * This is the canonical type for interface metadata.
 * Uses pre-generated type from adt-schemas.
 */
export type InterfaceResponse = InferTypedSchema<typeof interfacesSchema>;

/**
 * /sap/bc/adt/oo/interfaces
 * Full CRUD operations for ABAP interfaces
 */
const _interfacesContract = contract({
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
   * 
   * Usage: client.adt.oo.interfaces.post({ corrNr?: string }, interfaceData)
   * The interfaceData is typed via the schema and serialized automatically.
   */
  post: (options?: { corrNr?: string }) =>
    http.post('/sap/bc/adt/oo/interfaces', {
      body: interfacesSchema,  // Schema for type inference + serialization
      query: options?.corrNr ? { corrNr: options.corrNr } : undefined,
      responses: { 200: interfacesSchema },
      headers: {
        Accept: 'application/vnd.sap.adt.oo.interfaces.v5+xml',
        'Content-Type': 'application/vnd.sap.adt.oo.interfaces.v5+xml',
      },
    }),

  /**
   * PUT /sap/bc/adt/oo/interfaces/{name}
   * Update interface metadata (properties)
   * 
   * Usage: client.adt.oo.interfaces.put(name, { corrNr?, lockHandle? }, interfaceData)
   * The interfaceData is typed via the schema and serialized automatically.
   */
  put: (name: string, options?: { corrNr?: string; lockHandle?: string }) =>
    http.put(`/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`, {
      body: interfacesSchema,  // Schema for type inference + serialization
      query: {
        ...(options?.corrNr ? { corrNr: options.corrNr } : {}),
        ...(options?.lockHandle ? { lockHandle: options.lockHandle } : {}),
      },
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
        http.get(
          `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}/source/main`,
          {
            responses: { 200: undefined as unknown as string },
            headers: { Accept: 'text/plain' },
          }
        ),

      put: (name: string, source: string) =>
        http.put(
          `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}/source/main`,
          {
            body: source,
            responses: { 200: undefined as unknown as string },
            headers: {
              Accept: 'text/plain',
              'Content-Type': 'text/plain',
            },
          }
        ),
    },
  },
});

/** Exported contract for interfaces operations */
export const interfacesContract = _interfacesContract;

/** Type alias for the interfaces contract */
export type InterfacesContract = typeof interfacesContract;
