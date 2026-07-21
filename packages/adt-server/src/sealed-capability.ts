import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

type SealedCapabilityPayload = {
  v: 1;
  d: string;
  u: string;
  e: number;
};

export interface SealedCapabilityServiceOptions {
  /** A production deployment shares this secret across all replicas. */
  secret?: string;
  /**
   * Allow an ephemeral per-process secret. This breaks validation across
   * replicas/restarts and must only be used in single-instance tests/development.
   */
  allowEphemeralSecret?: boolean;
  now?: () => number;
  ttlMs?: number;
  maxTtlMs: number;
  maxCapabilityLength: number;
  namespace: string;
  version: string;
  validateUri: (value: string) => boolean;
  createError: () => Error;
}

export function createSealedCapabilityService(
  options: SealedCapabilityServiceOptions,
) {
  const explicitSecret = options.secret?.trim();
  const secret =
    explicitSecret ??
    (options.allowEphemeralSecret
      ? randomBytes(32).toString('base64url')
      : undefined);
  if (!secret) {
    throw new Error(
      'Capability secret is required. Set `secret` for production, or `allowEphemeralSecret` for single-instance tests.',
    );
  }
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? options.maxTtlMs;
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > options.maxTtlMs) {
    throw new Error(
      `Capability TTL must be between 1ms and ${options.maxTtlMs}ms.`,
    );
  }
  const key = createHash('sha256').update(secret).digest();

  function parsePayload(value: string): SealedCapabilityPayload | undefined {
    try {
      const parsed: unknown = JSON.parse(value);
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        (parsed as Record<string, unknown>).v !== 1 ||
        typeof (parsed as Record<string, unknown>).d !== 'string' ||
        typeof (parsed as Record<string, unknown>).u !== 'string' ||
        !Number.isSafeInteger((parsed as Record<string, unknown>).e)
      ) {
        return undefined;
      }
      const payload = parsed as SealedCapabilityPayload;
      return payload.d && options.validateUri(payload.u) ? payload : undefined;
    } catch {
      return undefined;
    }
  }

  function unseal(capability: string): SealedCapabilityPayload | undefined {
    const [namespace, version, encodedIv, encodedCiphertext, extra] =
      capability.split('.');
    if (
      namespace !== options.namespace ||
      version !== options.version ||
      !encodedIv ||
      !encodedCiphertext ||
      extra !== undefined ||
      !/^[A-Za-z0-9_-]+$/u.test(encodedIv) ||
      !/^[A-Za-z0-9_-]+$/u.test(encodedCiphertext)
    ) {
      return undefined;
    }
    try {
      const initializationVector = Buffer.from(encodedIv, 'base64url');
      const encrypted = Buffer.from(encodedCiphertext, 'base64url');
      if (initializationVector.length !== 12 || encrypted.length <= 16)
        return undefined;
      const decipher = createDecipheriv(
        'aes-256-gcm',
        key,
        initializationVector,
        { authTagLength: 16 },
      );
      decipher.setAuthTag(encrypted.subarray(-16));
      const plaintext = Buffer.concat([
        decipher.update(encrypted.subarray(0, -16)),
        decipher.final(),
      ]);
      return parsePayload(plaintext.toString('utf8'));
    } catch {
      return undefined;
    }
  }

  return {
    issue(destination: string, uri: string): string {
      if (!destination || !options.validateUri(uri)) {
        throw options.createError();
      }
      const initializationVector = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, initializationVector);
      const ciphertext = Buffer.concat([
        cipher.update(
          JSON.stringify({
            v: 1,
            d: destination,
            u: uri,
            e: now() + ttlMs,
          } satisfies SealedCapabilityPayload),
          'utf8',
        ),
        cipher.final(),
        cipher.getAuthTag(),
      ]);
      return `${options.namespace}.${options.version}.${initializationVector.toString('base64url')}.${ciphertext.toString('base64url')}`;
    },
    resolve(capability: string, destination: string): string {
      if (
        typeof capability !== 'string' ||
        capability.length > options.maxCapabilityLength
      ) {
        throw options.createError();
      }
      const payload = unseal(capability);
      if (
        payload?.d !== destination ||
        (payload?.e ?? Number.NEGATIVE_INFINITY) <= now()
      ) {
        throw options.createError();
      }
      return payload.u;
    },
  };
}
