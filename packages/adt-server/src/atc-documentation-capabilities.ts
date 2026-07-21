import { createRestSealedCapabilityService } from './sealed-capability.js';

const DOCUMENTATION_URI =
  /^\/sap\/bc\/adt\/documentation\/atc\/documents\/itemid\/[A-Za-z0-9_-]+\/index\/\d+$/u;

export class RestAtcDocumentationCapabilityError extends Error {
  constructor() {
    super('ATC documentation capability is unavailable.');
    this.name = 'RestAtcDocumentationCapabilityError';
  }
}

export interface RestAtcDocumentationCapabilityServiceOptions {
  /** A production deployment shares this secret across all sidecar replicas. */
  secret: string;
  now?: () => number;
  ttlMs?: number;
}

function isTrustedDocumentationUri(value: string): boolean {
  return value === value.trim() && DOCUMENTATION_URI.test(value);
}

/**
 * Issues short-lived encrypted capabilities for one trusted ATC-documentation
 * relation. The ADT URI is neither visible in nor chosen by the REST client.
 */
export function createRestAtcDocumentationCapabilityService(
  options: RestAtcDocumentationCapabilityServiceOptions,
) {
  const service = createRestSealedCapabilityService({
    secret: options.secret,
    now: options.now,
    ttlMs: options.ttlMs,
    namespace: 'atcdoc',
    validateUri: isTrustedDocumentationUri,
    createError: () => new RestAtcDocumentationCapabilityError(),
  });

  return {
    issue(input: { destination: string; documentationUri: string }): string {
      return service.issue(input.destination, input.documentationUri);
    },
    resolve(input: { documentationCapability: string; destination: string }): {
      documentationUri: string;
    } {
      return {
        documentationUri: service.resolve(
          input.documentationCapability,
          input.destination,
        ),
      };
    },
  };
}
