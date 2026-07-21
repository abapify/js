import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

const CAPABILITY_PREFIX = 'atcdoc.v1';
const MAX_CAPABILITY_LENGTH = 8 * 1_024;
const MAX_TTL_MS = 5 * 60_000;
const DOCUMENTATION_URI =
  /^\/sap\/bc\/adt\/documentation\/atc\/documents\/itemid\/[A-Za-z0-9_-]+\/index\/\d+$/u;

type DocumentationCapabilityPayload = {
  v: 1;
  d: string;
  u: string;
  e: number;
};

export class RestAtcDocumentationCapabilityError extends Error {
  constructor() {
    super('ATC documentation capability is unavailable.');
    this.name = 'RestAtcDocumentationCapabilityError';
  }
}

export interface RestAtcDocumentationCapabilityServiceOptions {
  /** A production deployment shares this secret across all sidecar replicas. */
  secret?: string;
  now?: () => number;
  ttlMs?: number;
}

function isTrustedDocumentationUri(value: string): boolean {
  return value === value.trim() && DOCUMENTATION_URI.test(value);
}

function parsePayload(
  value: string,
): DocumentationCapabilityPayload | undefined {
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
    const payload = parsed as DocumentationCapabilityPayload;
    return payload.d && isTrustedDocumentationUri(payload.u)
      ? payload
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Issues short-lived encrypted capabilities for one trusted ATC-documentation
 * relation. The ADT URI is neither visible in nor chosen by the REST client.
 */
export function createRestAtcDocumentationCapabilityService(
  options: RestAtcDocumentationCapabilityServiceOptions = {},
) {
  const secret =
    options.secret?.trim() || randomBytes(32).toString('base64url');
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? MAX_TTL_MS;
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > MAX_TTL_MS) {
    throw new Error(
      'ATC documentation capability TTL must be between 1ms and 5 minutes.',
    );
  }
  const key = createHash('sha256').update(secret).digest();

  const unseal = (
    documentationCapability: string,
  ): DocumentationCapabilityPayload | undefined => {
    const [prefix, version, encodedIv, encodedCiphertext, extra] =
      documentationCapability.split('.');
    if (
      prefix !== 'atcdoc' ||
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
    issue(input: { destination: string; documentationUri: string }): string {
      if (
        !input.destination ||
        !isTrustedDocumentationUri(input.documentationUri)
      ) {
        throw new RestAtcDocumentationCapabilityError();
      }
      const initializationVector = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, initializationVector);
      const ciphertext = Buffer.concat([
        cipher.update(
          JSON.stringify({
            v: 1,
            d: input.destination,
            u: input.documentationUri,
            e: now() + ttlMs,
          } satisfies DocumentationCapabilityPayload),
          'utf8',
        ),
        cipher.final(),
        cipher.getAuthTag(),
      ]);
      return `${CAPABILITY_PREFIX}.${initializationVector.toString('base64url')}.${ciphertext.toString('base64url')}`;
    },
    resolve(input: { documentationCapability: string; destination: string }): {
      documentationUri: string;
    } {
      if (
        typeof input.documentationCapability !== 'string' ||
        input.documentationCapability.length > MAX_CAPABILITY_LENGTH
      ) {
        throw new RestAtcDocumentationCapabilityError();
      }
      const payload = unseal(input.documentationCapability);
      if (!payload || payload.d !== input.destination || payload.e <= now()) {
        throw new RestAtcDocumentationCapabilityError();
      }
      return { documentationUri: payload.u };
    },
  };
}
