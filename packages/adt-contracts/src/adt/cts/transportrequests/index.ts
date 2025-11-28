/**
 * /sap/bc/adt/cts/transportrequests
 * @source transportmanagement.json
 */

import { http } from '../../../base';
import { transportmanagment } from 'adt-schemas-xsd';
import { valuehelp } from './valuehelp';
import { reference } from './reference';
import { searchconfiguration } from './searchconfiguration';

export const transportrequests = {
  /**
   * GET /sap/bc/adt/cts/transportrequests{?targets,configUri}
   * @accepts application/vnd.sap.adt.transportorganizer.v1+xml
   * 
   * @param targets - 'true' to include target systems
   * @param configUri - Search configuration URI (from searchconfiguration/configurations)
   */
  get: (params?: { targets?: string; configUri?: string }) =>
    http.get('/sap/bc/adt/cts/transportrequests', {
      query: params,
      responses: { 200: transportmanagment },
      headers: { Accept: '*/*' },
    }),

  reference,
  valuehelp,
  searchconfiguration,
};
