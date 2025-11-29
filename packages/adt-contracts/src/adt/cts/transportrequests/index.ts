/**
 * /sap/bc/adt/cts/transportrequests
 * @source transportmanagement.json
 * 
 * Contract: Pure HTTP endpoint definitions (no business logic)
 * 
 * Endpoints:
 * - list() - GET / - List transports
 * - get(trkorr) - GET /{trkorr} - Get single transport
 * - post() - POST / - Create transport
 * - post(trkorr) - POST /{trkorr} - Action (release, etc.)
 * - put(trkorr) - PUT /{trkorr} - Update transport
 * - delete(trkorr) - DELETE /{trkorr} - Delete transport
 */

import { http } from '../../../base';
import { transportmanagment, transportmanagmentSingle } from 'adt-schemas-xsd';
import { valuehelp } from './valuehelp';
import { reference } from './reference';
import { searchconfiguration } from './searchconfiguration';

/**
 * GET /sap/bc/adt/cts/transportrequests{?targets,configUri}
 * List transport requests
 */
const list = (params?: { targets?: string; configUri?: string }) =>
  http.get('/sap/bc/adt/cts/transportrequests', {
    query: params,
    responses: { 200: transportmanagment },
    headers: { Accept: '*/*' },
  });

/**
 * GET /sap/bc/adt/cts/transportrequests/{trkorr}
 * Get single transport
 * Uses transportmanagmentSingle schema which adds request as direct child of root
 */
const get = (trkorr: string) =>
  http.get(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
    responses: { 200: transportmanagmentSingle },
    headers: { Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml' },
  });

/**
 * POST /sap/bc/adt/cts/transportrequests - Create new transport
 * POST /sap/bc/adt/cts/transportrequests/{trkorr} - Action on transport (release, etc.)
 */
const post = (trkorr?: string) =>
  http.post(`/sap/bc/adt/cts/transportrequests${trkorr ? `/${trkorr}` : ''}`, {
    body: transportmanagment,
    responses: { 200: transportmanagment },
    headers: {
      Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
      'Content-Type': 'application/xml',
    },
  });

/**
 * PUT /sap/bc/adt/cts/transportrequests/{trkorr}
 * Update transport request
 */
const put = (trkorr: string) =>
  http.put(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
    body: transportmanagment,
    responses: { 200: transportmanagment },
    headers: {
      Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
      'Content-Type': 'application/xml',
    },
  });

/**
 * DELETE /sap/bc/adt/cts/transportrequests/{trkorr}
 * Delete transport request
 */
const deleteTransport = (trkorr: string) =>
  http.delete(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
    responses: { 204: undefined },
  });

// Explicit type to avoid TS7056 "exceeds maximum length" error
export const transportrequests: {
  list: typeof list;
  get: typeof get;
  post: typeof post;
  put: typeof put;
  delete: typeof deleteTransport;
  reference: typeof reference;
  valuehelp: typeof valuehelp;
  searchconfiguration: typeof searchconfiguration;
} = {
  list,
  get,
  post,
  put,
  delete: deleteTransport,
  reference,
  valuehelp,
  searchconfiguration,
};
