/**
 * SAP ADT Sessions Contract
 *
 * Provides endpoints for HTTP session management and CSRF token initialization.
 */

import { createContract, adtHttp } from '../../../base/contract';
import { SessionSchema } from './sessions-schema';

/**
 * Sessions contract for HTTP session management
 */
export const sessionsContract = createContract({
  /**
   * Get or create an HTTP session
   * Also initializes CSRF token for subsequent requests
   *
   * @returns Session information
   */
  getSession: () =>
    adtHttp.get('/sap/bc/adt/core/http/sessions', {
      responses: {
        200: SessionSchema,
      },
      headers: {
        Accept: 'application/vnd.sap.adt.core.http.session.v3+xml',
        'x-csrf-token': 'Fetch',
        'X-sap-adt-sessiontype': 'stateful',
      },
    }),
});

export type SessionsContract = typeof sessionsContract;
