/**
 * Unit tests for ADT's signed MCP invocation credentials. These run against
 * real ES256 JWS values — the verifier never trusts decoded, unsigned data.
 */
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import {
  generateKeyPair,
  SignJWT,
  type CryptoKey,
  type JWTPayload,
} from 'jose';
import { createMcpInvocationVerifier } from '../src/lib/http/invocation.js';

const issuer = 'adt-api';
const audience = 'adt-server-mcp';
const keyId = 'adt-mcp-2026-07';
const now = new Date('2026-07-19T12:00:00.000Z');
const nowSeconds = Math.floor(now.getTime() / 1_000);

let privateKey: CryptoKey;
let publicKey: CryptoKey;
let verifier: ReturnType<typeof createMcpInvocationVerifier>;

before(async () => {
  ({ privateKey, publicKey } = await generateKeyPair('ES256'));
  verifier = createMcpInvocationVerifier({
    publicKey,
    keyId,
    issuer,
    audience,
    now: () => now,
  });
});

function claims(overrides: JWTPayload = {}): JWTPayload {
  return {
    v: 1,
    kid: keyId,
    principal: 'petr.plenkov',
    agentId: 'system-assistant',
    classes: ['server', 'read'],
    destinationKeys: ['d01-rise'],
    correlationId: 'correlation-001',
    constraint: { systemSid: 'D01', frozenScope: ['ZCL_ADT_REVIEW'] },
    limits: { maxSourceBytes: 65_536 },
    ...overrides,
  };
}

async function sign(
  payloadOverrides: JWTPayload = {},
  options: {
    protectedKeyId?: string;
    omitProtectedKeyId?: boolean;
    signingKey?: CryptoKey;
    issuer?: string;
    audience?: string;
    issuedAt?: number;
    notBefore?: number;
    expiration?: number;
    tokenId?: string;
  } = {},
): Promise<string> {
  const signedIssuer = options.issuer ?? issuer;
  const signedAudience = options.audience ?? audience;
  const signedIssuedAt = options.issuedAt ?? nowSeconds;
  const signedNotBefore = options.notBefore ?? nowSeconds;
  const signedExpiration = options.expiration ?? nowSeconds + 60;
  const header: { alg: 'ES256'; typ: 'JWT'; kid?: string } = {
    alg: 'ES256',
    typ: 'JWT',
  };
  if (!options.omitProtectedKeyId) {
    if (options.protectedKeyId !== undefined) {
      header.kid = options.protectedKeyId;
    } else {
      header.kid = keyId;
    }
  }

  return await new SignJWT(claims(payloadOverrides))
    .setProtectedHeader(header)
    .setIssuer(signedIssuer)
    .setAudience(signedAudience)
    .setIssuedAt(signedIssuedAt)
    .setNotBefore(signedNotBefore)
    .setExpirationTime(signedExpiration)
    .setJti(options.tokenId ?? 'jti-test-001')
    .sign(options.signingKey ?? privateKey);
}

describe('MCP invocation verifier', () => {
  it('verifies a real ES256 bearer JWS into immutable trusted claims', async () => {
    const credential = await sign();

    const verified = await verifier.verify(`Bearer ${credential}`);

    assert.deepStrictEqual(verified, {
      tokenId: 'jti-test-001',
      principal: 'petr.plenkov',
      agentId: 'system-assistant',
      classes: ['server', 'read'],
      destinationKeys: ['d01-rise'],
      correlationId: 'correlation-001',
      constraint: { systemSid: 'D01', frozenScope: ['ZCL_ADT_REVIEW'] },
      limits: { maxSourceBytes: 65_536 },
    });
    assert.ok(verified);
    assert.ok(Object.isFrozen(verified));
    assert.ok(Object.isFrozen(verified.classes));
    assert.ok(Object.isFrozen(verified.destinationKeys));
    assert.ok(Object.isFrozen(verified.constraint));
    assert.ok(Object.isFrozen(verified.constraint.frozenScope));
    assert.throws(() => {
      (verified.destinationKeys as string[]).push('other-rise');
    });
  });

  it('rejects a credential with an invalid ES256 signature', async () => {
    const { privateKey: untrustedPrivateKey } = await generateKeyPair('ES256');
    const credential = await sign({}, { signingKey: untrustedPrivateKey });

    assert.strictEqual(
      await verifier.verify(`Bearer ${credential}`),
      undefined,
    );
  });

  it('rejects missing and wrong protected key identifiers', async () => {
    const missing = await sign({}, { omitProtectedKeyId: true });
    const wrong = await sign({}, { protectedKeyId: 'untrusted-kid' });

    assert.strictEqual(await verifier.verify(`Bearer ${missing}`), undefined);
    assert.strictEqual(await verifier.verify(`Bearer ${wrong}`), undefined);
  });

  it('rejects credentials for another issuer or audience', async () => {
    const wrongIssuer = await sign({}, { issuer: 'other-api' });
    const wrongAudience = await sign({}, { audience: 'other-mcp' });

    assert.strictEqual(
      await verifier.verify(`Bearer ${wrongIssuer}`),
      undefined,
    );
    assert.strictEqual(
      await verifier.verify(`Bearer ${wrongAudience}`),
      undefined,
    );
  });

  it('rejects expired and not-yet-valid credentials', async () => {
    const expired = await sign({}, { expiration: nowSeconds - 1 });
    const notYetValid = await sign({}, { notBefore: nowSeconds + 1 });

    assert.strictEqual(await verifier.verify(`Bearer ${expired}`), undefined);
    assert.strictEqual(
      await verifier.verify(`Bearer ${notYetValid}`),
      undefined,
    );
  });

  it('rejects credentials whose lifetime exceeds the ADT five-minute maximum', async () => {
    const credential = await sign({}, { expiration: nowSeconds + 301 });

    assert.strictEqual(
      await verifier.verify(`Bearer ${credential}`),
      undefined,
    );
  });

  it('rejects a credential with an unsupported version', async () => {
    const credential = await sign({ v: 2 });

    assert.strictEqual(
      await verifier.verify(`Bearer ${credential}`),
      undefined,
    );
  });

  it('rejects malformed and unrecognised agent identities', async () => {
    const malformed = await sign({ agentId: ['system-assistant'] });
    const unrecognised = await sign({ agentId: 'untrusted-agent' });

    assert.strictEqual(await verifier.verify(`Bearer ${malformed}`), undefined);
    assert.strictEqual(
      await verifier.verify(`Bearer ${unrecognised}`),
      undefined,
    );
  });

  it('rejects an invocation that requests write authority', async () => {
    const credential = await sign({ classes: ['read', 'write'] });

    assert.strictEqual(
      await verifier.verify(`Bearer ${credential}`),
      undefined,
    );
  });

  it('rejects empty and invalid destination keys', async () => {
    const empty = await sign({ destinationKeys: [] });
    const invalid = await sign({ destinationKeys: ['D01_RISE'] });

    assert.strictEqual(await verifier.verify(`Bearer ${empty}`), undefined);
    assert.strictEqual(await verifier.verify(`Bearer ${invalid}`), undefined);
  });

  it('rejects malformed constraint and limits claims', async () => {
    const malformedConstraint = await sign({ constraint: ['not-an-object'] });
    const malformedLimits = await sign({ limits: null });

    assert.strictEqual(
      await verifier.verify(`Bearer ${malformedConstraint}`),
      undefined,
    );
    assert.strictEqual(
      await verifier.verify(`Bearer ${malformedLimits}`),
      undefined,
    );
  });
});
