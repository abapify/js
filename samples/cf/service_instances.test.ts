import {
  getOAuthToken,
  CloudFoundryClient,
  readCfConfig,
} from '@cloudfoundry/api';
import { AxiosError } from 'axios';
import assert from 'node:assert';

import test, { describe } from 'node:test';

describe('Service instances', () => {
  test('List service instances', async () => {
    const oauthToken = await getOAuthToken();
    const config = await readCfConfig();
    assert(config);

    //oauthToken = 'bearer {access_token}'
    const cf = new CloudFoundryClient({
      apiEndpoint: config.Target,
      accessToken: oauthToken,
    });

    try {
      const serviceInstances = await cf.serviceInstances.list({
        fields: {
          service_plan: ['name'],
          'service_plan.service_offering.service_broker': ['name'],
          'service_plan.service_offering': ['name'],
        },
      });
      assert(serviceInstances);
      console.log(JSON.stringify(serviceInstances.data, null, 2));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.toJSON());
      } else if (error instanceof Error) {
        console.error((error as Error).message);
      } else {
        console.error(error);
      }
    }
  });
});
