import { createRestSealedCapabilityService } from './sealed-capability.js';

const ADT_PATH_PREFIX = '/sap/bc/adt/';

export class RestSourceCapabilityError extends Error {
  constructor() {
    super('Source capability is unavailable.');
    this.name = 'RestSourceCapabilityError';
  }
}

export interface RestSourceCapabilityServiceOptions {
  /** A production deployment shares this secret across all sidecar replicas. */
  secret: string;
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
  options: RestSourceCapabilityServiceOptions,
) {
  const service = createRestSealedCapabilityService({
    secret: options.secret,
    now: options.now,
    ttlMs: options.ttlMs,
    namespace: 'src',
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
