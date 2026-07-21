/**
 * Verification for ARM-issued MCP invocation credentials.
 *
 * This module is deliberately transport-independent: callers pass the
 * complete Authorization header and receive either immutable, trusted claims
 * or `undefined`. It does not log or throw token-validation failures, so a
 * bearer credential or its decoded payload can never leak through an error.
 */
import type { KeyObject } from 'node:crypto';
import { jwtVerify, type CryptoKey, type JWTPayload } from 'jose';

const INVOCATION_VERSION = 1;
const MAX_IDENTIFIER_LENGTH = 256;
const MAX_COMPONENT_IDENTIFIER_LENGTH = 512;
const MAX_JSON_DEPTH = 8;
const MAX_TOKEN_LIFETIME_SECONDS = 5 * 60;
const MAX_FROZEN_SOURCES = 500;
const MAX_SOURCE_REFERENCE_LENGTH = 8 * 1024;
const MAX_FROZEN_SOURCE_BYTES = 2 * 1024 * 1024;
const destinationKeyPattern = /^[a-z][a-z0-9-]{1,62}$/u;
const canonicalKeyPattern = /^[A-Z0-9_]+:.+$/u;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

const trustedAgentIds = new Set([
  'ai-review',
  'system-assistant',
  'autonomous-review-agent',
]);
const trustedOperationClasses = new Set(['server', 'read']);

export type McpTrustedOperationClass = 'server' | 'read';

export type McpInvocationJsonValue =
  | boolean
  | number
  | string
  | null
  | readonly McpInvocationJsonValue[]
  | Readonly<Record<string, McpInvocationJsonValue>>;

/** Claims proved by a verified, ARM-issued invocation credential. */
export interface TrustedMcpInvocationClaims {
  readonly tokenId: string;
  readonly principal: string;
  readonly agentId:
    | 'ai-review'
    | 'system-assistant'
    | 'autonomous-review-agent';
  readonly classes: readonly McpTrustedOperationClass[];
  readonly destinationKeys: readonly string[];
  readonly correlationId: string;
  readonly constraint: Readonly<Record<string, McpInvocationJsonValue>>;
  readonly limits: Readonly<Record<string, McpInvocationJsonValue>>;
}

/**
 * Fully enforced narrowing policy for an AI Review source read. `sourceRef`
 * remains opaque to MCP clients and models; only ARM's private broker can
 * redeem it after this policy has selected the exact canonical object and
 * source component.
 */
export interface AiReviewFrozenSourcePolicy {
  readonly reviewId: string;
  readonly runId: string;
  readonly systemSid: string;
  readonly sources: readonly {
    readonly canonicalKey: string;
    readonly componentId: string;
    readonly sourceRef: string;
  }[];
  readonly maxSourceBytes: number;
}

export interface McpInvocationVerifierOptions {
  /** ES256 public key mounted at ADT Server; it cannot issue credentials. */
  publicKey: CryptoKey | KeyObject;
  /** The exact key id required in both JWS header and JWT payload. */
  keyId: string;
  /** The exact ARM API issuer expected in `iss`. */
  issuer: string;
  /** The exact audience expected in `aud`. */
  audience: string;
  /** Test-only clock injection. Production defaults to the current time. */
  now?: () => Date | number;
}

export interface McpInvocationVerifier {
  /**
   * Verify a complete `Authorization: Bearer <JWS>` header. Validation
   * failures are intentionally indistinguishable and return `undefined`.
   */
  verify(
    authorizationHeader: string | string[] | undefined,
  ): Promise<TrustedMcpInvocationClaims | undefined>;
}

/**
 * Reports whether this sidecar version can enforce every narrowing claim for
 * an invocation. Unsupported policies deliberately receive no MCP tool
 * access; accepting a syntactically valid policy without enforcing it would
 * widen the signed credential.
 *
 * The initial system-assistant policy is fully enforced by its exact
 * destination key plus the selected System marker. AI Review stays fail
 * closed until the frozen-object/capability policy is implemented at dispatch.
 */
export function isMcpInvocationDispatchPolicySupported(
  claims: TrustedMcpInvocationClaims,
): boolean {
  if (claims.agentId === 'system-assistant') {
    if (Object.keys(claims.limits).length !== 0) return false;
    const constraintKeys = Object.keys(claims.constraint);
    return (
      constraintKeys.length === 1 &&
      constraintKeys[0] === 'systemSid' &&
      requiredIdentifier(claims.constraint.systemSid) !== undefined
    );
  }
  if (claims.agentId === 'autonomous-review-agent') {
    return (
      claims.classes.length === 2 &&
      claims.classes.includes('server') &&
      claims.classes.includes('read') &&
      claims.destinationKeys.length === 1 &&
      parseAutonomousReviewAgentPolicy(claims) !== undefined
    );
  }
  if (claims.agentId !== 'ai-review') return false;
  return (
    claims.classes.length === 2 &&
    claims.classes.includes('server') &&
    claims.classes.includes('read') &&
    claims.destinationKeys.length === 1 &&
    parseAiReviewFrozenSourcePolicy(claims) !== undefined
  );
}

/**
 * The autonomous agent may inspect exactly one System through exactly one
 * Destination. Its execution id binds every ADT activity to ARM's durable
 * Agent Execution, while the sidecar's ordinary scope catalogue continues to
 * deny write tools. No ambient limits or additional constraints are accepted.
 */
export function parseAutonomousReviewAgentPolicy(
  claims: TrustedMcpInvocationClaims,
): { readonly executionId: string; readonly systemSid: string } | undefined {
  if (claims.agentId !== 'autonomous-review-agent') return undefined;
  if (Object.keys(claims.limits).length !== 0) return undefined;
  const constraintKeys = Object.keys(claims.constraint).sort((a, b) =>
    a.localeCompare(b),
  );
  if (
    constraintKeys.length !== 2 ||
    constraintKeys[0] !== 'executionId' ||
    constraintKeys[1] !== 'systemSid'
  ) {
    return undefined;
  }
  const executionId = requiredUuid(claims.constraint.executionId);
  const systemSid = requiredSystemSid(claims.constraint.systemSid);
  if (!executionId || !systemSid) return undefined;
  return Object.freeze({ executionId, systemSid });
}

function requiredUuid(value: unknown): string | undefined {
  return typeof value === 'string' && uuidPattern.test(value)
    ? value
    : undefined;
}

function requiredSourceReference(value: unknown): string | undefined {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_SOURCE_REFERENCE_LENGTH ||
    // eslint-disable-next-line no-control-regex
    /[\s\u0000-\u0008\u000e-\u001f\u007f]/u.test(value)
  ) {
    return undefined;
  }
  return value;
}

/**
 * Parse the only AI Review policy currently safe to dispatch. Every property
 * is deliberately exact: accepting a valid JWS with one ignored narrowing
 * field would widen the Review beyond its frozen materialisation.
 */
export function parseAiReviewFrozenSourcePolicy(
  claims: TrustedMcpInvocationClaims,
): AiReviewFrozenSourcePolicy | undefined {
  if (claims.agentId !== 'ai-review') return undefined;
  const constraint = claims.constraint;
  const constraintKeys = Object.keys(constraint).sort((a, b) =>
    a.localeCompare(b),
  );
  const expectedConstraintKeys = [
    'frozenSources',
    'kind',
    'reviewId',
    'runId',
    'systemSid',
  ];
  if (
    constraintKeys.length !== expectedConstraintKeys.length ||
    constraintKeys.some(
      (key, index) => key !== expectedConstraintKeys[index],
    ) ||
    constraint.kind !== 'ai-review-frozen-v1'
  ) {
    return undefined;
  }
  const reviewId = requiredUuid(constraint.reviewId);
  const runId = requiredUuid(constraint.runId);
  const systemSid = requiredIdentifier(constraint.systemSid);
  if (!reviewId || !runId || !systemSid || systemSid.length > 16)
    return undefined;

  const rawSources = constraint.frozenSources;
  if (
    !Array.isArray(rawSources) ||
    rawSources.length === 0 ||
    rawSources.length > MAX_FROZEN_SOURCES
  ) {
    return undefined;
  }
  const sourceKeys = new Set<string>();
  const sourceRefs = new Set<string>();
  const sources: {
    canonicalKey: string;
    componentId: string;
    sourceRef: string;
  }[] = [];
  for (const rawSource of rawSources) {
    if (!isPlainObject(rawSource)) return undefined;
    const rawSourceKeys = Object.keys(rawSource).sort((a, b) =>
      a.localeCompare(b),
    );
    if (
      rawSourceKeys.length !== 3 ||
      rawSourceKeys[0] !== 'canonicalKey' ||
      rawSourceKeys[1] !== 'componentId' ||
      rawSourceKeys[2] !== 'sourceRef'
    ) {
      return undefined;
    }
    const canonicalKey = rawSource.canonicalKey;
    const componentId = requiredComponentIdentifier(rawSource.componentId);
    const sourceRef = requiredSourceReference(rawSource.sourceRef);
    const sourceKey =
      typeof canonicalKey === 'string' && componentId
        ? `${canonicalKey}\u0000${componentId}`
        : undefined;
    if (
      typeof canonicalKey !== 'string' ||
      !canonicalKeyPattern.test(canonicalKey) ||
      !componentId ||
      !sourceRef ||
      !sourceKey ||
      sourceKeys.has(sourceKey) ||
      sourceRefs.has(sourceRef)
    ) {
      return undefined;
    }
    sourceKeys.add(sourceKey);
    sourceRefs.add(sourceRef);
    sources.push(Object.freeze({ canonicalKey, componentId, sourceRef }));
  }

  const limitKeys = Object.keys(claims.limits);
  const maxSourceBytes = claims.limits.maxSourceBytes;
  if (
    limitKeys.length !== 1 ||
    limitKeys[0] !== 'maxSourceBytes' ||
    typeof maxSourceBytes !== 'number' ||
    !Number.isSafeInteger(maxSourceBytes) ||
    maxSourceBytes < 1 ||
    maxSourceBytes > MAX_FROZEN_SOURCE_BYTES
  ) {
    return undefined;
  }
  return Object.freeze({
    reviewId,
    runId,
    systemSid,
    sources: Object.freeze(sources),
    maxSourceBytes,
  });
}

function requiredIdentifier(value: unknown): string | undefined {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_IDENTIFIER_LENGTH ||
    value.trim().length === 0
  ) {
    return undefined;
  }
  return value;
}

function requiredSystemSid(value: unknown): string | undefined {
  const systemSid = requiredIdentifier(value);
  return systemSid &&
    systemSid.length <= 16 &&
    /^[A-Za-z0-9_-]+$/u.test(systemSid)
    ? systemSid
    : undefined;
}

function requiredComponentIdentifier(value: unknown): string | undefined {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_COMPONENT_IDENTIFIER_LENGTH ||
    // eslint-disable-next-line no-control-regex
    /[\s\u0000-\u0008\u000e-\u001f\u007f]/u.test(value)
  ) {
    return undefined;
  }
  return value;
}

function requiredConfigurationIdentifier(value: unknown, name: string): string {
  const identifier = requiredIdentifier(value);
  if (!identifier) {
    throw new Error(`MCP invocation verifier requires a valid ${name}`);
  }
  return identifier;
}

function extractBearerCredential(
  authorizationHeader: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(authorizationHeader)) return undefined;
  if (typeof authorizationHeader !== 'string') return undefined;
  const header = authorizationHeader.trim();
  if (header.length < 8 || header.slice(0, 7).toLowerCase() !== 'bearer ') {
    return undefined;
  }
  const credential = header.slice(7).trim();
  return credential.length > 0 ? credential : undefined;
}

function isTrustedOperationClass(
  value: unknown,
): value is McpTrustedOperationClass {
  return typeof value === 'string' && trustedOperationClasses.has(value);
}

function cloneTrustedClasses(
  value: unknown,
): readonly McpTrustedOperationClass[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const classes: McpTrustedOperationClass[] = [];
  for (const item of value) {
    if (!isTrustedOperationClass(item)) return undefined;
    classes.push(item);
  }
  return Object.freeze(classes);
}

function cloneDestinationKeys(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const destinationKeys: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !destinationKeyPattern.test(item)) {
      return undefined;
    }
    destinationKeys.push(item);
  }
  return Object.freeze(destinationKeys);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function cloneJsonValue(
  value: unknown,
  depth = 0,
): McpInvocationJsonValue | undefined {
  if (depth > MAX_JSON_DEPTH) return undefined;
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (Array.isArray(value)) {
    const cloned: McpInvocationJsonValue[] = [];
    for (const item of value) {
      const clonedItem = cloneJsonValue(item, depth + 1);
      if (clonedItem === undefined) return undefined;
      cloned.push(clonedItem);
    }
    return Object.freeze(cloned);
  }
  if (!isPlainObject(value)) return undefined;

  const cloned = Object.create(null) as Record<string, McpInvocationJsonValue>;
  for (const [key, item] of Object.entries(value)) {
    const clonedItem = cloneJsonValue(item, depth + 1);
    if (clonedItem === undefined) return undefined;
    cloned[key] = clonedItem;
  }
  return Object.freeze(cloned);
}

function cloneJsonObject(
  value: unknown,
): Readonly<Record<string, McpInvocationJsonValue>> | undefined {
  const cloned = cloneJsonValue(value);
  return cloned !== null && !Array.isArray(cloned) && typeof cloned === 'object'
    ? (cloned as Readonly<Record<string, McpInvocationJsonValue>>)
    : undefined;
}

function isUnixTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function claimsFromPayload(
  payload: JWTPayload,
  expectedKeyId: string,
  expectedIssuer: string,
  expectedAudience: string,
): TrustedMcpInvocationClaims | undefined {
  const record = payload as Record<string, unknown>;
  if (
    record.v !== INVOCATION_VERSION ||
    record.kid !== expectedKeyId ||
    record.iss !== expectedIssuer ||
    record.aud !== expectedAudience ||
    !isUnixTimestamp(record.iat) ||
    !isUnixTimestamp(record.nbf) ||
    !isUnixTimestamp(record.exp) ||
    record.nbf < record.iat ||
    record.exp < record.nbf ||
    record.exp - record.iat > MAX_TOKEN_LIFETIME_SECONDS
  ) {
    return undefined;
  }

  const tokenId = requiredIdentifier(record.jti);
  const principal = requiredIdentifier(record.principal);
  const agentId = record.agentId;
  const correlationId = requiredIdentifier(record.correlationId);
  const classes = cloneTrustedClasses(record.classes);
  const destinationKeys = cloneDestinationKeys(record.destinationKeys);
  const constraint = cloneJsonObject(record.constraint);
  const limits = cloneJsonObject(record.limits);
  if (
    !tokenId ||
    !principal ||
    !correlationId ||
    typeof agentId !== 'string' ||
    !trustedAgentIds.has(agentId) ||
    !classes ||
    !destinationKeys ||
    !constraint ||
    !limits
  ) {
    return undefined;
  }

  return Object.freeze({
    tokenId,
    principal,
    agentId: agentId as TrustedMcpInvocationClaims['agentId'],
    classes,
    destinationKeys,
    correlationId,
    constraint,
    limits,
  });
}

function currentDate(now: (() => Date | number) | undefined): Date {
  const value = now?.() ?? new Date();
  return value instanceof Date ? value : new Date(value);
}

/**
 * Build a fail-closed verifier for the one ARM-to-ADT-Server invocation key.
 * Configuration failures throw before serving traffic; credential failures
 * always resolve to `undefined` without logging token-derived information.
 */
export function createMcpInvocationVerifier(
  options: McpInvocationVerifierOptions,
): McpInvocationVerifier {
  if (!options?.publicKey) {
    throw new Error('MCP invocation verifier requires an ES256 public key');
  }
  const publicKey = options.publicKey;
  const keyId = requiredConfigurationIdentifier(options.keyId, 'key id');
  const issuer = requiredConfigurationIdentifier(options.issuer, 'issuer');
  const audience = requiredConfigurationIdentifier(
    options.audience,
    'audience',
  );
  const now = options.now;

  return {
    async verify(authorizationHeader) {
      const credential = extractBearerCredential(authorizationHeader);
      if (!credential) return undefined;

      try {
        const verified = await jwtVerify(credential, publicKey, {
          algorithms: ['ES256'],
          issuer,
          audience,
          currentDate: currentDate(now),
        });
        if (verified.protectedHeader.kid !== keyId) return undefined;
        return claimsFromPayload(verified.payload, keyId, issuer, audience);
      } catch {
        return undefined;
      }
    },
  };
}
