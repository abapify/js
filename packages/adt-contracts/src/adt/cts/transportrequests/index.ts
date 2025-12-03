/**
 * /sap/bc/adt/cts/transportrequests
 * @source transportmanagement.json
 */

import { http } from '../../../base';
import { transportmanagment, transportmanagmentSingle, transportmanagmentCreate } from 'adt-schemas-xsd';
import type { InferXsd } from 'ts-xsd';
import type { RestContract } from 'speci/rest';
import { valuehelp } from './valuehelp';
import { reference } from './reference';
import { searchconfiguration } from './searchconfiguration';

/**
 * Transport response type - exported for consumers (ADK, etc.)
 * 
 * This is the canonical type for transport request data.
 * Consumers should import this type instead of inferring from speci internals.
 */
export type TransportResponse = InferXsd<typeof transportmanagmentSingle>;

export const transportrequests: RestContract = {
  /** GET / - List transports */
  list: (params?: { targets?: string; configUri?: string }) =>
    http.get('/sap/bc/adt/cts/transportrequests', {
      query: params,
      responses: { 200: transportmanagment },
      headers: { Accept: '*/*' },
    }),

  /** GET /{trkorr} - Get single transport */
  get: (trkorr: string) =>
    http.get(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
      responses: { 200: transportmanagmentSingle },
      headers: { Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml' },
    }),

  /** POST / - Create new transport (response has root/request structure like single) */
  create: () =>
    http.post('/sap/bc/adt/cts/transportrequests', {
      body: transportmanagmentCreate,
      responses: { 200: transportmanagmentSingle },
      headers: {
        Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
        'Content-Type': 'application/xml',
      },
    }),

  /** POST /{trkorr} - Action on transport (release, etc.) */
  post: (trkorr: string) =>
    http.post(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
      body: transportmanagment,
      responses: { 200: transportmanagment },
      headers: {
        Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
        'Content-Type': 'application/xml',
      },
    }),

  /** PUT /{trkorr} - Update transport */
  put: (trkorr: string) =>
    http.put(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
      body: transportmanagment,
      responses: { 200: transportmanagment },
      headers: {
        Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
        'Content-Type': 'application/xml',
      },
    }),

  /** DELETE /{trkorr} - Delete transport */
  delete: (trkorr: string) =>
    http.delete(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
      responses: { 204: undefined },
    }),

  reference,
  valuehelp,
  searchconfiguration,
};
