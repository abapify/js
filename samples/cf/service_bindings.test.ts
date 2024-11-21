import {
  getOAuthToken,
  CloudFoundryClient,
  readCfConfig,
} from '@cloudfoundry/api';
import { AxiosError } from 'axios';
import assert from 'node:assert';

import test, { describe } from 'node:test';

describe('Service bindings', () => {
  test('List service bindings', async () => {
    const oauthToken = await getOAuthToken();
    const config = await readCfConfig();
    assert(config);

    //oauthToken = 'bearer {access_token}'
    const cf = new CloudFoundryClient({
      apiEndpoint: config.Target,
      accessToken: oauthToken,
    });

    try {
      const serviceBindings = await cf.serviceCredentialBinding.list({
        include: ['service_instance'],
      });
      assert(serviceBindings);
      console.log(JSON.stringify(serviceBindings.data));
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
