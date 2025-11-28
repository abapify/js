/**
 * ADT OO (Object-Oriented) Contracts
 * 
 * Structure mirrors URL tree:
 * - /sap/bc/adt/oo/classes → oo.classes
 * - /sap/bc/adt/oo/interfaces → oo.interfaces
 * - /sap/bc/adt/oo/classrun → oo.classrun
 */

import { http, contract } from '../../base';
import { classes as classesSchema, interfaces as interfacesSchema } from 'adt-schemas-xsd';

/**
 * /sap/bc/adt/oo/classes
 * @source classes.json
 */
const classes = contract({
  /**
   * GET /sap/bc/adt/oo/classes/{name}
   */
  get: (name: string) =>
    http.get(`/sap/bc/adt/oo/classes/${name.toLowerCase()}`, {
      responses: { 200: classesSchema },
      headers: { Accept: 'application/vnd.sap.adt.oo.classes.v4+xml' },
    }),

  /**
   * POST /sap/bc/adt/oo/classes
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
   * /sap/bc/adt/oo/classes/{name}/source
   */
  source: {
    /**
     * GET /sap/bc/adt/oo/classes/{name}/source/main
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
});

/**
 * /sap/bc/adt/oo/interfaces
 * @source interfaces.json
 */
const interfaces = contract({
  /**
   * GET /sap/bc/adt/oo/interfaces/{name}
   */
  get: (name: string) =>
    http.get(`/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`, {
      responses: { 200: interfacesSchema },
      headers: { Accept: 'application/vnd.sap.adt.oo.interfaces.v5+xml' },
    }),

  /**
   * POST /sap/bc/adt/oo/interfaces
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
});

/**
 * /sap/bc/adt/oo/classrun
 * @source classrun.json
 */
const classrun = contract({
  /**
   * POST /sap/bc/adt/oo/classrun/{classname}{?profilerId}
   */
  post: (classname: string, params?: { profilerId?: string }) =>
    http.post(`/sap/bc/adt/oo/classrun/${classname.toLowerCase()}`, {
      query: params,
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    }),
});

export const ooContract = {
  classes,
  interfaces,
  classrun,
};

export type OoContract = typeof ooContract;
