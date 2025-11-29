/**
 * ADT OO (Object-Oriented) Contracts
 * 
 * Structure mirrors URL tree:
 * - /sap/bc/adt/oo/classes → oo.classes
 * - /sap/bc/adt/oo/interfaces → oo.interfaces
 * - /sap/bc/adt/oo/classrun → oo.classrun
 * 
 * Supports full CRUD operations for ABAP classes and interfaces,
 * including source code management for class includes.
 */

import { http, contract } from '../../base';
import { classes as classesSchema, interfaces as interfacesSchema } from 'adt-schemas-xsd';

/**
 * Include types for ABAP classes
 */
type ClassIncludeType = 'definitions' | 'implementations' | 'macros' | 'main';

/**
 * /sap/bc/adt/oo/classes
 * Full CRUD operations for ABAP classes
 */
const classes = contract({
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

/**
 * /sap/bc/adt/oo/interfaces
 * Full CRUD operations for ABAP interfaces
 */
const interfaces = contract({
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

/**
 * /sap/bc/adt/oo/classrun
 * Execute console application classes (IF_OO_ADT_CLASSRUN)
 */
const classrun = contract({
  /**
   * POST /sap/bc/adt/oo/classrun/{classname}{?profilerId}
   * Execute a class implementing IF_OO_ADT_CLASSRUN
   */
  post: (classname: string, params?: { profilerId?: string }) =>
    http.post(`/sap/bc/adt/oo/classrun/${classname.toLowerCase()}`, {
      query: params,
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    }),
});

/**
 * OO Contract type definition
 * Explicit type to avoid TypeScript inference limits
 */
export interface OoContract {
  classes: typeof classes;
  interfaces: typeof interfaces;
  classrun: typeof classrun;
}

export const ooContract: OoContract = {
  classes,
  interfaces,
  classrun,
};
