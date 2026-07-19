import { randomBytes } from 'node:crypto';

const ADT_PATH_PREFIX = '/sap/bc/adt/';

export class SourceCapabilityError extends Error {
  constructor() {
    super('Source capability is unavailable.');
    this.name = 'SourceCapabilityError';
  }
}

export interface SourceCapabilityRegistryOptions {
  now?: () => number;
  ttlMs?: number;
}

type SourceCapabilityEntry = {
  readonly sessionId?: string;
  readonly destination?: string;
  readonly sourceUri: string;
  readonly expiresAt: number;
};

function isSafeAdtSourceUri(value: string): boolean {
  return (
    value.startsWith(ADT_PATH_PREFIX) &&
    value === value.trim() &&
    !/[\\\s\u0000-\u001f\u007f]/u.test(value)
  );
}

/**
 * Keeps opaque source-read capabilities in the sidecar process. A capability
 * is an unguessable handle rather than an encoded URI, so neither the client
 * nor an MCP transcript can recover SAP path details from it.
 */
export function createSourceCapabilityRegistry(
  options: SourceCapabilityRegistryOptions = {},
) {
  const now = options.now ?? (() => Date.now());
  const ttlMs = options.ttlMs ?? 5 * 60_000;
  const entries = new Map<string, SourceCapabilityEntry>();

  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > 5 * 60_000) {
    throw new Error('Source capability TTL must be between 1ms and 5 minutes.');
  }

  function purgeExpired() {
    const current = now();
    for (const [capability, entry] of entries) {
      if (entry.expiresAt <= current) entries.delete(capability);
    }
  }

  return {
    issue(input: {
      sessionId?: string;
      destination?: string;
      sourceUri: string;
    }): string {
      if (!isSafeAdtSourceUri(input.sourceUri)) {
        throw new SourceCapabilityError();
      }
      purgeExpired();
      const sourceCapability = `src_${randomBytes(32).toString('base64url')}`;
      entries.set(sourceCapability, {
        sessionId: input.sessionId,
        destination: input.destination,
        sourceUri: input.sourceUri,
        expiresAt: now() + ttlMs,
      });
      return sourceCapability;
    },
    resolve(input: {
      sourceCapability: string;
      sessionId?: string;
      destination?: string;
    }): { sourceUri: string } {
      purgeExpired();
      const entry = entries.get(input.sourceCapability);
      if (
        !entry ||
        entry.sessionId !== input.sessionId ||
        entry.destination !== input.destination
      ) {
        throw new SourceCapabilityError();
      }
      return { sourceUri: entry.sourceUri };
    },
  };
}
