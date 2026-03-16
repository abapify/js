/**
 * DDIC Structure Contract
 *
 * ADT endpoint: /sap/bc/adt/ddic/structures
 * Content-Type: application/vnd.sap.adt.structures.v2+xml
 * Object type: TABL/DS (tablds)
 *
 * Note: No XSD schema available yet for structures.
 * Using undefined responses until a proper schema is available.
 */

import { http } from '@abapify/speci/rest';

const basePath = '/sap/bc/adt/ddic/structures';
const contentType = 'application/vnd.sap.adt.structures.v2+xml';
const nameTransform = (n: string) => n.toLowerCase();

export const structuresContract = {
  get: (name: string, options?: { version?: string }) =>
    http.get(`${basePath}/${nameTransform(name)}`, {
      responses: { 200: undefined },
      headers: { Accept: contentType },
      query: options?.version ? { version: options.version } : undefined,
    }),

  post: (options?: { corrNr?: string }) =>
    http.post(basePath, {
      body: undefined,
      responses: { 200: undefined },
      headers: {
        Accept: contentType,
        'Content-Type': 'application/*',
      },
      query: options?.corrNr ? { corrNr: options.corrNr } : undefined,
    }),

  put: (name: string, options?: { corrNr?: string; lockHandle?: string }) =>
    http.put(`${basePath}/${nameTransform(name)}`, {
      body: undefined,
      responses: { 200: undefined },
      headers: {
        Accept: contentType,
        'Content-Type': contentType,
      },
      query: {
        ...(options?.corrNr ? { corrNr: options.corrNr } : {}),
        ...(options?.lockHandle ? { lockHandle: options.lockHandle } : {}),
      },
    }),

  delete: (name: string, options?: { corrNr?: string; lockHandle?: string }) =>
    http.delete(`${basePath}/${nameTransform(name)}`, {
      responses: { 204: undefined },
      query: {
        ...(options?.corrNr ? { corrNr: options.corrNr } : {}),
        ...(options?.lockHandle ? { lockHandle: options.lockHandle } : {}),
      },
    }),

  lock: (name: string, options?: { corrNr?: string; accessMode?: string }) =>
    http.post(`${basePath}/${nameTransform(name)}`, {
      responses: { 200: undefined },
      headers: {
        'X-sap-adt-sessiontype': 'stateful',
      },
      query: {
        _action: 'LOCK',
        accessMode: options?.accessMode ?? 'MODIFY',
        ...(options?.corrNr ? { corrNr: options.corrNr } : {}),
      },
    }),

  unlock: (name: string, options: { lockHandle: string }) =>
    http.post(`${basePath}/${nameTransform(name)}`, {
      responses: { 200: undefined },
      query: {
        _action: 'UNLOCK',
        lockHandle: options.lockHandle,
      },
    }),

  objectstructure: (name: string, options?: { version?: string }) =>
    http.get(`${basePath}/${nameTransform(name)}/objectstructure`, {
      responses: { 200: undefined },
      query: options?.version ? { version: options.version } : undefined,
    }),
};
