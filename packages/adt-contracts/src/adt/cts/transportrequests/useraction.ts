/**
 * /sap/bc/adt/cts/transportrequests - user-action body endpoints
 *
 * SAP ADT uses distinct lifecycle endpoints for release, changeowner, and
 * newrequest actions. This file exposes typed contracts for all three.
 *
 *   release       → POST /{trkorr}/newreleasejobs (no body)
 *   changeowner   → PUT  /{trkorr}    (requires tm:number and tm:targetuser)
 *   newrequest    → POST /            (creates a new transport request)
 */

import { http } from '../../../base';
import {
  transportUseraction,
  transportmanagment,
  transportmanagmentSingle,
} from '../../../schemas';
import { changeOwnerBodySchema } from './change-owner-schema';

export { changeOwnerBodySchema } from './change-owner-schema';
export type { ChangeOwnerBody } from './change-owner-schema';

/** Options for {@link useraction.reassign} */
export interface ReassignOptions {
  /** SAP user who should become the new owner */
  targetUser: string;
  /** Cascade the change to all modifiable tasks (default: false) */
  recursive?: boolean;
}

/** Options for {@link useraction.create} (useraction=newrequest) */
export interface CreateRequestOptions {
  /** Transport short description */
  description: string;
  /** Transport type (default: K = workbench) */
  type?: string;
  /** Transport target system (default: LOCAL) */
  target?: string;
  /** CTS project (optional) */
  project?: string;
  /** SAP user who should own the created request / task */
  owner: string;
}

const CONTENT_TYPE = 'application/vnd.sap.adt.transportorganizer.v1+xml';

export const useraction = {
  /**
   * Start and synchronously report a transport/task release job.
   */
  release: (trkorr: string) =>
    http.post(`/sap/bc/adt/cts/transportrequests/${trkorr}/newreleasejobs`, {
      responses: { 200: transportmanagment },
      headers: { Accept: CONTENT_TYPE },
    }),

  /**
   * PUT /{trkorr} with useraction="changeowner".
   */
  reassign: (trkorr: string, _options: ReassignOptions) =>
    http.put(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
      body: changeOwnerBodySchema,
      responses: { 200: transportmanagmentSingle },
      headers: {
        Accept: CONTENT_TYPE,
        'Content-Type': CONTENT_TYPE,
      },
    }),

  /**
   * POST / with useraction="newrequest"
   *
   * Creates a brand-new transport request. Body carries the nested
   * tm:request / tm:task with desc / type / target / owner.
   */
  create: (_options: CreateRequestOptions) =>
    http.post('/sap/bc/adt/cts/transportrequests', {
      body: transportUseraction,
      responses: { 200: transportmanagmentSingle },
      headers: {
        Accept: CONTENT_TYPE,
        'Content-Type': CONTENT_TYPE,
      },
    }),
};

export type UseractionContract = typeof useraction;
