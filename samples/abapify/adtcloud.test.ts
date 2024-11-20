import xsenv from '@sap/xsenv';
import test from 'node:test';

test('Connect to cloud', async (t) => {
  //
  const services = xsenv.readServices();
  console.log(services.serviceInstance);
});
