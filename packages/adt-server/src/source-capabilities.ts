import { createSealedCapabilityService } from './sealed-capability.js';

const ADT_PATH_PREFIX = '/sap/bc/adt/';
const MAX_CAPABILITY_LENGTH = 8 * 1_024;
const MAX_TTL_MS = 5 * 60_000;

export class RestSourceCapabilityError extends Error {
  constructor() {
    super('Source capability is unavailable.');
    this.name = 'RestSourceCapabilityError';
  }
}

export interface RestSourceCapabilityServiceOptions {
  /** A production deployment shares this secret across all sidecar replicas. */
  secret?: string;
  /**
   * Allow an ephemeral per-process secret. This breaks validation across
   * replicas/restarts and must only be used in single-instance tests/development.
   */
  allowEphemeralSecret?: boolean;
  now?: () => number;
  ttlMs?: number;
}

function isSafeAdtSourceUri(value: string): boolean {
  return (
    value.startsWith(ADT_PATH_PREFIX) &&
    value === value.trim() &&
    // eslint-disable-next-line no-control-regex
    !/[\\\s\u0000-\u0008\u000e-\u001f\u007f]/u.test(value)
  );
}

/**
 * Issues short-lived encrypted immutable-source capabilities. The source URI
 * is never a client-controlled input and is not readable from the capability.
 */
export function createRestSourceCapabilityService(
  options: RestSourceCapabilityServiceOptions = {},
) {
  const service = createSealedCapabilityService({
    ...options,
    maxTtlMs: MAX_TTL_MS,
    maxCapabilityLength: MAX_CAPABILITY_LENGTH,
    namespace: 'src',
    version: 'v1',
    validateUri: isSafeAdtSourceUri,
    createError: () => new RestSourceCapabilityError(),
  });

  return {
    issue(input: { destination: string; sourceUri: string }): string {
      return service.issue(input.destination, input.sourceUri);
    },
    resolve(input: { sourceCapability: string; destination: string }): {
      sourceUri: string;
    } {
      return {
        sourceUri: service.resolve(input.sourceCapability, input.destination),
      };
    },
  };
}
