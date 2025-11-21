/**
 * SAP ADT System Information Contract
 *
 * Provides endpoints for retrieving system information.
 */

import { createContract, adtHttp } from '../../../base/contract';
import { SystemInformationSchema } from './systeminformation-schema';

/**
 * System information contract
 */
export const systeminformationContract = createContract({
  /**
   * Get system information (returns JSON)
   *
   * @returns System information including version, user, client, etc.
   */
  getSystemInformation: () =>
    adtHttp.get('/sap/bc/adt/core/http/systeminformation', {
      responses: {
        200: SystemInformationSchema,
      },
      headers: {
        Accept: 'application/vnd.sap.adt.core.http.systeminformation.v1+json',
        'X-sap-adt-sessiontype': 'stateful',
      },
    }),
});

export type SystemInformationContract = typeof systeminformationContract;
