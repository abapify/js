import { createHttpBrokerOperations } from '../broker.js';
import { createAdtServerMcpOptions } from '../mcp-runtime.js';
import { startAdtServer } from '../server.js';

const baseUrl = process.env.ADT_BROKER_BASE_URL;
const tokenFile = process.env.ADT_SERVER_BROKER_TOKEN_FILE;
if (!baseUrl || !tokenFile)
  throw new Error(
    'ADT_BROKER_BASE_URL and ADT_SERVER_BROKER_TOKEN_FILE are required',
  );
const brokerOptions = { baseUrl, tokenFile };
void createAdtServerMcpOptions({
  env: process.env,
  brokerOptions,
}).then((mcp) =>
  startAdtServer({
    operations: createHttpBrokerOperations(brokerOptions),
    host: process.env.ADT_SERVER_HOST,
    port: Number(process.env.ADT_SERVER_PORT ?? '3002'),
    mcp,
  }),
);
