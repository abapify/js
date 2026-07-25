import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseDelegatedAssistantReadPolicy,
  type TrustedMcpInvocationClaims,
} from '../src/index.js';
import { isMcpInvocationDispatchPolicySupported } from '../src/lib/http/invocation.js';

const threadId = '11111111-1111-4111-8111-111111111111';
const executionId = '22222222-2222-4222-8222-222222222222';

function claims(
  overrides: Partial<TrustedMcpInvocationClaims> = {},
): TrustedMcpInvocationClaims {
  return {
    tokenId: 'jti-delegated-assistant-001',
    principal: 'engineer@example.invalid',
    agentId: 'delegated-assistant',
    classes: ['server', 'read'],
    destinationKeys: ['tst-adt'],
    correlationId: 'delegated-assistant:001',
    constraint: {
      kind: 'delegated-assistant-read-v1',
      threadId,
      executionId,
      systemSid: 'TST',
    },
    limits: {},
    ...overrides,
  };
}

describe('Delegated-assistant read policy', () => {
  it('accepts the exact principal-scoped read envelope', () => {
    assert.deepStrictEqual(parseDelegatedAssistantReadPolicy(claims()), {
      threadId,
      executionId,
      systemSid: 'TST',
    });
    assert.strictEqual(isMcpInvocationDispatchPolicySupported(claims()), true);
  });

  it('rejects tool lists, limits, extra classes, and extra Destinations', () => {
    for (const candidate of [
      claims({
        constraint: {
          ...claims().constraint,
          toolNames: ['get_object'],
        },
      }),
      claims({ limits: { maxToolCalls: 12 } }),
      claims({ classes: ['server', 'read', 'safe_execute'] }),
      claims({ destinationKeys: ['tst-adt', 'prd-adt'] }),
    ]) {
      assert.strictEqual(
        parseDelegatedAssistantReadPolicy(candidate),
        undefined,
      );
      assert.strictEqual(
        isMcpInvocationDispatchPolicySupported(candidate),
        false,
      );
    }
  });

  it('rejects malformed or incomplete execution identity', () => {
    for (const constraint of [
      { ...claims().constraint, kind: 'unknown' },
      { ...claims().constraint, threadId: 'not-a-uuid' },
      { ...claims().constraint, executionId: 'not-a-uuid' },
      { ...claims().constraint, systemSid: 'TST!' },
      {
        kind: 'delegated-assistant-read-v1',
        threadId,
        executionId,
      },
    ]) {
      assert.strictEqual(
        parseDelegatedAssistantReadPolicy(claims({ constraint })),
        undefined,
      );
    }
  });
});
