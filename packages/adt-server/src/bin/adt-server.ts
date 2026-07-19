import { createHttpBrokerOperations } from '../broker.js';
import { startAdtServer } from '../server.js';

const baseUrl = process.env.ARM_BROKER_BASE_URL;
const tokenFile = process.env.ADT_SERVER_BROKER_TOKEN_FILE;
if (!baseUrl || !tokenFile)
  throw new Error(
    'ARM_BROKER_BASE_URL and ADT_SERVER_BROKER_TOKEN_FILE are required',
  );
void startAdtServer({
  operations: createHttpBrokerOperations({ baseUrl, tokenFile }),
  host: process.env.ADT_SERVER_HOST,
  port: Number(process.env.ADT_SERVER_PORT ?? '3002'),
});
