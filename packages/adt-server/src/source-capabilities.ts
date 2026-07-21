import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

const CAPABILITY_PREFIX = 'src.v1';
const ADT_PATH_PREFIX = '/sap/bc/adt/';
const MAX_CAPABILITY_LENGTH = 8 * 1_024;
const MAX_TTL_MS = 5 * 60_000;

type SourceCapabilityPayload = {
  v: 1;
  d: string;
  u: string;
  e: number;
};

export class RestSourceCapabilityError extends Error {
  constructor() {
    super('Source capability is unavailable.');
    this.name = 'RestSourceCapabilityError';
  }
}

export interface RestSourceCapabilityServiceOptions {
  /** A production deployment shares this secret across all sidecar replicas. */
  secret?: string;
  now?: () => number;
  ttlMs?: number;
}

function isSafeAdtSourceUri(value: string): boolean {
  return (
    value.startsWith(ADT_PATH_PREFIX) &&
    value === value.trim() &&
    // eslint-disable-next-line no-control-regex
    !/[\\\s\u0000-\u001f\u007f]/u.test(value)
  );
}

function parsePayload(value: string): SourceCapabilityPayload | undefined {
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
    const payload = parsed as SourceCapabilityPayload;
    return payload.d && isSafeAdtSourceUri(payload.u) ? payload : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Issues short-lived encrypted immutable-source capabilities. The source URI
 * is never a client-controlled input and is not readable from the capability.
 */
export function createRestSourceCapabilityService(
  options: RestSourceCapabilityServiceOptions = {},
) {
  const secret =
    options.secret?.trim() || randomBytes(32).toString('base64url');
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? MAX_TTL_MS;
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > MAX_TTL_MS) {
    throw new Error('Source capability TTL must be between 1ms and 5 minutes.');
  }
  const key = createHash('sha256').update(secret).digest();

  const unseal = (
    sourceCapability: string,
  ): SourceCapabilityPayload | undefined => {
    const [prefix, version, encodedIv, encodedCiphertext, extra] =
      sourceCapability.split('.');
    if (
      prefix !== 'src' ||
      version !== 'v1' ||
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
  };

  return {
    issue(input: { destination: string; sourceUri: string }): string {
      if (!input.destination || !isSafeAdtSourceUri(input.sourceUri)) {
        throw new RestSourceCapabilityError();
      }
      const initializationVector = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, initializationVector);
      const ciphertext = Buffer.concat([
        cipher.update(
          JSON.stringify({
            v: 1,
            d: input.destination,
            u: input.sourceUri,
            e: now() + ttlMs,
          } satisfies SourceCapabilityPayload),
          'utf8',
        ),
        cipher.final(),
        cipher.getAuthTag(),
      ]);
      return `${CAPABILITY_PREFIX}.${initializationVector.toString('base64url')}.${ciphertext.toString('base64url')}`;
    },
    resolve(input: { sourceCapability: string; destination: string }): {
      sourceUri: string;
    } {
      if (
        typeof input.sourceCapability !== 'string' ||
        input.sourceCapability.length > MAX_CAPABILITY_LENGTH
      ) {
        throw new RestSourceCapabilityError();
      }
      const payload = unseal(input.sourceCapability);
      if (!payload || payload.d !== input.destination || payload.e <= now()) {
        throw new RestSourceCapabilityError();
      }
      return { sourceUri: payload.u };
    },
  };
}
