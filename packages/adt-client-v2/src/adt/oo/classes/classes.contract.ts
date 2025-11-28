/**
 * ADT OO Classes Contract
 *
 * Mirrors the ADT API structure: /sap/bc/adt/oo/classes
 */

import { adtHttp, createContract } from '../../../base';
import { ClassSchema, type ClassXml } from './classes.schema';

/**
 * Classes API Contract
 *
 * Endpoint: /sap/bc/adt/oo/classes
 */
export const classesContract = createContract({
  /**
   * Get class metadata
   * GET /sap/bc/adt/oo/classes/{className}
   */
  getMetadata: (className: string) =>
    adtHttp.get(`/sap/bc/adt/oo/classes/${className}`, {
      responses: { 200: ClassSchema }, // Type inferred automatically via Inferrable!
      headers: { Accept: 'application/vnd.sap.adt.oo.classes.v4+xml' },
    }),

  /**
   * Get main class source
   * GET /sap/bc/adt/oo/classes/{className}/source/main
   */
  getMainSource: (className: string) =>
    adtHttp.get(`/sap/bc/adt/oo/classes/${className}/source/main`, {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    }),

  /**
   * Get definitions include
   * GET /sap/bc/adt/oo/classes/{className}/source/definitions
   */
  getDefinitions: (className: string) =>
    adtHttp.get(`/sap/bc/adt/oo/classes/${className}/source/definitions`, {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    }),

  /**
   * Get implementations include
   * GET /sap/bc/adt/oo/classes/{className}/source/implementations
   */
  getImplementations: (className: string) =>
    adtHttp.get(`/sap/bc/adt/oo/classes/${className}/source/implementations`, {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    }),

  /**
   * Get macros include
   * GET /sap/bc/adt/oo/classes/{className}/source/macros
   */
  getMacros: (className: string) =>
    adtHttp.get(`/sap/bc/adt/oo/classes/${className}/source/macros`, {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    }),

  /**
   * Get test classes include
   * GET /sap/bc/adt/oo/classes/{className}/source/testclasses
   */
  getTestClasses: (className: string) =>
    adtHttp.get(`/sap/bc/adt/oo/classes/${className}/source/testclasses`, {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    }),

  /**
   * Update main source
   * PUT /sap/bc/adt/oo/classes/{className}/source/main
   */
  updateMainSource: (className: string) =>
    adtHttp.put(`/sap/bc/adt/oo/classes/${className}/source/main`, {
      body: undefined as unknown as string, // Body type - inferred as parameter
      responses: { 200: undefined as unknown as void },
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }),

  /**
   * Create a new class
   * POST /sap/bc/adt/oo/classes/{className}
   *
   * User passes ClassXml data, adapter uses ClassSchema to serialize
   */
  create: (className: string, classData: ClassXml) =>
    adtHttp.post(`/sap/bc/adt/oo/classes/${className}`, {
      body: ClassSchema, // Schema - adapter will serialize classData using this
      responses: { 201: ClassSchema },
      headers: {
        'Content-Type': 'application/vnd.sap.adt.oo.classes.v4+xml',
        Accept: 'application/vnd.sap.adt.oo.classes.v4+xml',
      },
    }),

  /**
   * Delete a class
   * DELETE /sap/bc/adt/oo/classes/{className}
   */
  delete: (className: string) =>
    adtHttp.delete(`/sap/bc/adt/oo/classes/${className}`),
});

export type ClassesContract = typeof classesContract;
