import { createHttpBrokerOperations } from '../broker.js';
import { createAdtServerMcpOptions } from '../mcp-runtime.js';
import { loadOptionalRestBearerAuthorizer } from '../rest-auth.js';
import { startAdtServer } from '../server.js';

const baseUrl = process.env.ARM_BROKER_BASE_URL;
const tokenFile = process.env.ADT_SERVER_BROKER_TOKEN_FILE;
if (!baseUrl || !tokenFile)
  throw new Error(
    'ARM_BROKER_BASE_URL and ADT_SERVER_BROKER_TOKEN_FILE are required',
  );
const brokerOptions = { baseUrl, tokenFile };
const restTokenFile = process.env.ADT_SERVER_REST_TOKEN_FILE;

async function main(): Promise<void> {
  const [mcp, restAuthorizer] = await Promise.all([
    createAdtServerMcpOptions({
      env: process.env,
      brokerOptions,
    }),
    loadOptionalRestBearerAuthorizer(restTokenFile),
  ]);
  await startAdtServer({
    operations: createHttpBrokerOperations(brokerOptions),
    host: process.env.ADT_SERVER_HOST,
    port: Number(process.env.ADT_SERVER_PORT ?? '3002'),
    mcp,
    restAuthorizer,
  });
}

void main();
