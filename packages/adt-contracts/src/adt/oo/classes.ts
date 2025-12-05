/**
 * ADT OO Classes Contract
 * 
 * Endpoint: /sap/bc/adt/oo/classes
 * Full CRUD operations for ABAP classes including source code management.
 */

import { http, contract } from '../../base';
import { classes as classesSchema } from '../../schemas';
import type { ClassAbapClass } from '../../schemas';

/**
 * Include types for ABAP classes
 */
export type ClassIncludeType = 'definitions' | 'implementations' | 'macros' | 'main';

/**
 * Class response type - exported for consumers (ADK, etc.)
 * 
 * This is the canonical type for class metadata.
 * Uses pre-generated type from adt-schemas-xsd-v2.
 */
export type ClassResponse = ClassAbapClass;

/**
 * /sap/bc/adt/oo/classes
 * Full CRUD operations for ABAP classes
 */
const _classesContract = contract({
  /**
   * GET /sap/bc/adt/oo/classes/{name}
   * Retrieve class metadata including includes
   */
  get: (name: string) =>
    http.get(`/sap/bc/adt/oo/classes/${name.toLowerCase()}`, {
      responses: { 200: classesSchema },
      headers: { Accept: 'application/vnd.sap.adt.oo.classes.v4+xml' },
    }),

  /**
   * POST /sap/bc/adt/oo/classes
   * Create a new class
   */
  post: (body: string) =>
    http.post('/sap/bc/adt/oo/classes', {
      body,
      responses: { 200: classesSchema },
      headers: {
        Accept: 'application/vnd.sap.adt.oo.classes.v4+xml',
        'Content-Type': 'application/vnd.sap.adt.oo.classes.v4+xml',
      },
    }),

  /**
   * PUT /sap/bc/adt/oo/classes/{name}
   * Update class metadata (properties)
   */
  put: (name: string, body: string) =>
    http.put(`/sap/bc/adt/oo/classes/${name.toLowerCase()}`, {
      body,
      responses: { 200: classesSchema },
      headers: {
        Accept: 'application/vnd.sap.adt.oo.classes.v4+xml',
        'Content-Type': 'application/vnd.sap.adt.oo.classes.v4+xml',
      },
    }),

  /**
   * DELETE /sap/bc/adt/oo/classes/{name}
   * Delete a class
   */
  delete: (name: string) =>
    http.delete(`/sap/bc/adt/oo/classes/${name.toLowerCase()}`, {
      responses: { 204: undefined },
    }),

  /**
   * /sap/bc/adt/oo/classes/{name}/source
   * Source code operations for class main source
   */
  source: {
    /**
     * /sap/bc/adt/oo/classes/{name}/source/main
     * Main class source (global definitions + implementations)
     */
    main: {
      get: (name: string) =>
        http.get(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/source/main`, {
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain' },
        }),

      put: (name: string, source: string) =>
        http.put(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/source/main`, {
          body: source,
          responses: { 200: undefined as unknown as string },
          headers: {
            Accept: 'text/plain',
            'Content-Type': 'text/plain',
          },
        }),
    },
  },

  /**
   * /sap/bc/adt/oo/classes/{name}/includes
   * Class include sections (definitions, implementations, macros)
   */
  includes: {
    /**
     * GET /sap/bc/adt/oo/classes/{name}/includes/{includeType}
     * Get source code for a specific include
     */
    get: (name: string, includeType: ClassIncludeType) =>
      http.get(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/${includeType}`, {
        responses: { 200: undefined as unknown as string },
        headers: { Accept: 'text/plain' },
      }),

    /**
     * PUT /sap/bc/adt/oo/classes/{name}/includes/{includeType}
     * Update source code for a specific include
     */
    put: (name: string, includeType: ClassIncludeType, source: string) =>
      http.put(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/${includeType}`, {
        body: source,
        responses: { 200: undefined as unknown as string },
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'text/plain',
        },
      }),

    /**
     * Shorthand accessors for specific includes
     */
    definitions: {
      get: (name: string) =>
        http.get(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/definitions`, {
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain' },
        }),
      put: (name: string, source: string) =>
        http.put(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/definitions`, {
          body: source,
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain', 'Content-Type': 'text/plain' },
        }),
    },
    implementations: {
      get: (name: string) =>
        http.get(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/implementations`, {
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain' },
        }),
      put: (name: string, source: string) =>
        http.put(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/implementations`, {
          body: source,
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain', 'Content-Type': 'text/plain' },
        }),
    },
    macros: {
      get: (name: string) =>
        http.get(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/macros`, {
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain' },
        }),
      put: (name: string, source: string) =>
        http.put(`/sap/bc/adt/oo/classes/${name.toLowerCase()}/includes/macros`, {
          body: source,
          responses: { 200: undefined as unknown as string },
          headers: { Accept: 'text/plain', 'Content-Type': 'text/plain' },
        }),
    },
  },
});

/** Exported contract for classes operations */
export const classesContract = _classesContract;

/** Type alias for the classes contract */
export type ClassesContract = typeof classesContract;
