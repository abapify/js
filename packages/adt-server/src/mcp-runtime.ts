import { createPublicKey } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  createDestinationContextRegistry,
  createMcpInvocationVerifier,
  type ToolContext,
} from '@abapify/adt-mcp';
import { runWithAdtAbortSignal } from '@abapify/adt-client';
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
  /**
   * Optional deployment/test override for the execution-scoped abort runtime.
   */
  executeSafeTool?: NonNullable<ToolContext['executeSafeTool']>;
}

const MAX_TIMER_DELAY_MS = 2_147_483_647;

function scheduleDeadline(
  deadline: number,
  onDeadline: () => void,
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    const remaining = deadline - performance.now();
    if (remaining <= 0) {
      onDeadline();
      return;
    }
    timer = setTimeout(schedule, Math.min(remaining, MAX_TIMER_DELAY_MS));
  };
  schedule();
  return () => {
    if (timer !== undefined) clearTimeout(timer);
  };
}

/**
 * Aborts all SAP HTTP work in this async execution context at the signed
 * deadline, then waits for the tool operation to settle before returning.
 */
export async function executeSafeToolWithAbort(input: {
  maxDurationMs: number;
  operation: () => Promise<unknown>;
}): Promise<unknown> {
  if (!Number.isSafeInteger(input.maxDurationMs) || input.maxDurationMs <= 0) {
    throw new RangeError('maxDurationMs must be a positive safe integer');
  }

  const abortController = new AbortController();
  const deadline = performance.now() + input.maxDurationMs;
  let deadlineExceeded = false;
  const markDeadlineExceeded = () => {
    deadlineExceeded = true;
    if (!abortController.signal.aborted) {
      abortController.abort(new Error('safe_execute deadline exceeded'));
    }
  };
  const clearDeadline = scheduleDeadline(deadline, markDeadlineExceeded);
  const deadlineHasPassed = () =>
    deadlineExceeded || performance.now() >= deadline;

  try {
    const result = await runWithAdtAbortSignal(
      abortController.signal,
      input.operation,
    );
    if (deadlineHasPassed()) {
      markDeadlineExceeded();
      throw new Error('safe_execute deadline exceeded');
    }
    return result;
  } catch (error) {
    if (deadlineHasPassed()) {
      markDeadlineExceeded();
      throw new Error('safe_execute deadline exceeded', { cause: error });
    }
    throw error;
  } finally {
    clearDeadline();
  }
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

function safeExecuteEnabled(env: RuntimeEnvironment): boolean {
  const configured = configuredValue(
    env,
    'ADT_SERVER_MCP_SAFE_EXECUTE_ENABLED',
  );
  if (configured === undefined || configured === 'false') return false;
  if (configured === 'true') return true;
  throw new Error(
    'ADT_SERVER_MCP_SAFE_EXECUTE_ENABLED must be exactly true or false',
  );
}

export function createSafeExecuteGrantConsumer(
  options: HttpBrokerOptions,
): NonNullable<ToolContext['consumeSafeExecuteGrant']> {
  const fetcher = options.fetch ?? globalThis.fetch;
  return async ({ grantJti, opaqueGrant }) => {
    try {
      const token = (await readFile(options.tokenFile, 'utf8')).trim();
      if (!token) return false;
      const response = await fetcher(
        new URL(
          `/internal/adt-server/jess-safe-execute-grants/${encodeURIComponent(
            grantJti,
          )}/consume`,
          options.baseUrl,
        ),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-adt-server-token': token,
          },
          body: JSON.stringify({ opaqueGrant }),
        },
      );
      return response.status === 204;
    } catch {
      // Grant material and validation details are intentionally never logged.
      return false;
    }
  };
}

export function createSafeExecuteGrantOutcomeReporter(
  options: HttpBrokerOptions,
): NonNullable<ToolContext['reportSafeExecuteGrantOutcome']> {
  const fetcher = options.fetch ?? globalThis.fetch;
  return async ({ grantJti, opaqueGrant, outcome }) => {
    try {
      const token = (await readFile(options.tokenFile, 'utf8')).trim();
      if (!token) return false;
      const response = await fetcher(
        new URL(
          `/internal/adt-server/jess-safe-execute-grants/${encodeURIComponent(
            grantJti,
          )}/outcome`,
          options.baseUrl,
        ),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-adt-server-token': token,
          },
          body: JSON.stringify({ opaqueGrant, outcome }),
        },
      );
      return response.status === 204;
    } catch {
      // Grant material and validation details are intentionally never logged.
      return false;
    }
  };
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
  const enableSafeExecute = safeExecuteEnabled(options.env);
  const invocation = invocationConfiguration(options.env);
  if (!invocation) {
    if (enableSafeExecute) {
      throw new Error(
        'ADT Server MCP safe_execute requires MCP invocation configuration',
      );
    }
    return undefined;
  }
  const executeSafeTool = options.executeSafeTool ?? executeSafeToolWithAbort;

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
    ...(enableSafeExecute
      ? {
          consumeSafeExecuteGrant: createSafeExecuteGrantConsumer(
            options.brokerOptions,
          ),
          reportSafeExecuteGrantOutcome: createSafeExecuteGrantOutcomeReporter(
            options.brokerOptions,
          ),
          executeSafeTool,
        }
      : {}),
    allowedHosts: allowedHostsFromEnv(options.env),
  };
}
