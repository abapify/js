import { createPublicKey } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  createDestinationContextRegistry,
  createMcpInvocationVerifier,
} from '@abapify/adt-mcp';
import {
  createHttpDestinationContexts,
  type HttpBrokerOptions,
} from './broker.js';
import type { AdtServerMcpOptions } from './server.js';

const INVOCATION_AUDIENCE = 'adt-server-mcp';

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export interface AdtServerMcpRuntimeOptions {
  env: RuntimeEnvironment;
  brokerOptions: HttpBrokerOptions;
}

function configuredValue(
  env: RuntimeEnvironment,
  name: string,
): string | undefined {
  return env[name]?.trim() || undefined;
}

function invocationConfiguration(env: RuntimeEnvironment):
  | {
      publicKeyFile: string;
      keyId: string;
      issuer: string;
    }
  | undefined {
  const publicKeyFile = configuredValue(env, 'ADT_SERVER_MCP_PUBLIC_KEY_FILE');
  const keyId = configuredValue(env, 'ADT_SERVER_MCP_KEY_ID');
  const issuer = configuredValue(env, 'ADT_SERVER_MCP_ISSUER');
  const configuredCount = [publicKeyFile, keyId, issuer].filter(Boolean).length;

  if (configuredCount === 0) return undefined;
  if (configuredCount !== 3) {
    throw new Error(
      'ADT_SERVER_MCP_PUBLIC_KEY_FILE, ADT_SERVER_MCP_KEY_ID, and ADT_SERVER_MCP_ISSUER must be configured together',
    );
  }
  return {
    publicKeyFile: publicKeyFile!,
    keyId: keyId!,
    issuer: issuer!,
  };
}

function allowedHostsFromEnv(env: RuntimeEnvironment): string[] | undefined {
  const configured = configuredValue(env, 'ADT_SERVER_MCP_ALLOWED_HOSTS');
  if (!configured) return undefined;
  const hosts = configured.split(',').map((host) => host.trim());
  if (hosts.some((host) => !host)) {
    throw new Error(
      'ADT_SERVER_MCP_ALLOWED_HOSTS must be a comma-separated host list',
    );
  }
  return [...new Set(hosts)];
}

async function loadP256PublicKey(file: string) {
  const pem = await readFile(file, 'utf8');
  if (/-----BEGIN(?: EC)? PRIVATE KEY-----/u.test(pem)) {
    throw new Error(
      'ADT Server MCP public key file must contain only public key material',
    );
  }

  let publicKey;
  try {
    publicKey = createPublicKey(pem);
  } catch {
    throw new Error('ADT Server MCP public key file is invalid');
  }
  if (
    publicKey.type !== 'public' ||
    publicKey.asymmetricKeyType !== 'ec' ||
    publicKey.asymmetricKeyDetails?.namedCurve !== 'prime256v1'
  ) {
    throw new Error('ADT Server MCP requires an ES256 P-256 public key');
  }
  return publicKey;
}

/**
 * Creates the optional, signed MCP sidecar configuration. A missing complete
 * configuration keeps MCP unavailable; a partial or invalid configuration
 * aborts startup rather than risking a weaker authentication mode.
 */
export async function createAdtServerMcpOptions(
  options: AdtServerMcpRuntimeOptions,
): Promise<AdtServerMcpOptions | undefined> {
  const invocation = invocationConfiguration(options.env);
  if (!invocation) return undefined;

  const publicKey = await loadP256PublicKey(invocation.publicKeyFile);
  const { leaseProvider, contextFactory, resolveFrozenSource } =
    createHttpDestinationContexts(options.brokerOptions);
  return {
    invocationVerifier: createMcpInvocationVerifier({
      publicKey,
      keyId: invocation.keyId,
      issuer: invocation.issuer,
      audience: INVOCATION_AUDIENCE,
    }),
    destinationRegistry: createDestinationContextRegistry({
      leaseProvider,
      contextFactory,
    }),
    resolveFrozenSource,
    allowedHosts: allowedHostsFromEnv(options.env),
  };
}
