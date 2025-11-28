/**
 * /sap/bc/adt/cts/transportrequests/searchconfiguration/configurations
 * @schema configurations.xsd
 */

import { http, contract } from '../../../../base';
import { configurations as configurationsSchema } from 'adt-schemas-xsd';

export const configurations = contract({
  /** GET list of search configurations */
  get: () =>
    http.get('/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations', {
      responses: { 200: configurationsSchema },
      headers: { Accept: 'application/vnd.sap.adt.configurations.v1+xml' },
    }),
});
