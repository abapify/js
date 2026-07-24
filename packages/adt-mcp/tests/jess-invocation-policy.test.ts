import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isMcpInvocationDispatchPolicySupported,
  parseJessAdtInvocationPolicy,
  type TrustedMcpInvocationClaims,
} from '../src/lib/http/invocation.js';

const threadId = '11111111-1111-4111-8111-111111111111';
const executionId = '22222222-2222-4222-8222-222222222222';
const grantJti = '33333333-3333-4333-8333-333333333333';
const opaqueGrant = 'eyJhbGciOiJFUzI1NiJ9.eyJncmFudCI6dHJ1ZX0.signature';

function claims(
  overrides: Partial<TrustedMcpInvocationClaims> = {},
): TrustedMcpInvocationClaims {
  return {
    tokenId: 'jti-jess-001',
    principal: 'engineer@arm',
    agentId: 'jess',
    classes: ['server', 'read'],
    destinationKeys: ['tst-adt'],
    correlationId: 'jess:execution:001',
    constraint: {
      kind: 'jess-adt-v1',
      threadId,
      executionId,
      systemSid: 'TST',
      objectKeys: ['CLAS:ZCL_RELEASE_GATE', 'PROG:Z_RELEASE_REPORT'],
      toolNames: ['get_object', 'get_object_structure'],
    },
    limits: { maxToolCalls: 3 },
    ...overrides,
  };
}

const atcPolicy = {
  operationId: 'atc_run',
  check: 'atc',
  maxDurationMs: 30_000,
  maxResultBytes: 262_144,
  maxFindings: 500,
  maxObjects: 20,
  maxPackages: 5,
  maxVariants: 1,
} as const;

const aunitPolicy = {
  operationId: 'run_unit_tests',
  check: 'aunit',
  effectiveWithCoverage: false,
  effectiveCoverageFormat: null,
  maxDurationMs: 45_000,
  maxResultBytes: 262_144,
  maxFindings: 500,
  maxObjects: 20,
  maxTestClasses: 100,
  maxTestMethods: 1_000,
} as const;

const coveragePolicy = {
  operationId: 'run_unit_tests',
  check: 'coverage',
  effectiveWithCoverage: true,
  effectiveCoverageFormat: 'sonar-generic',
  maxDurationMs: 60_000,
  maxResultBytes: 524_288,
  maxFindings: 500,
  maxObjects: 20,
  maxPrograms: 20,
  maxMeasurements: 10_000,
} as const;

describe('Jess ADT invocation policy', () => {
  it('parses the exact read policy', () => {
    const parsed = parseJessAdtInvocationPolicy(claims());

    assert.deepStrictEqual(parsed, {
      threadId,
      executionId,
      systemSid: 'TST',
      objectKeys: ['CLAS:ZCL_RELEASE_GATE', 'PROG:Z_RELEASE_REPORT'],
      toolNames: ['get_object', 'get_object_structure'],
      operationClass: 'read',
      maxToolCalls: 3,
    });
    assert.strictEqual(isMcpInvocationDispatchPolicySupported(claims()), true);
  });

  for (const policy of [atcPolicy, aunitPolicy, coveragePolicy]) {
    it(`parses the exact ${policy.check} safe-execute policy`, () => {
      const safeClaims = claims({
        classes: ['server', 'safe_execute'],
        constraint: {
          kind: 'jess-adt-v1',
          threadId,
          executionId,
          systemSid: 'TST',
          objectKeys: ['CLAS:ZCL_RELEASE_GATE'],
          toolNames: [policy.operationId],
          safeExecutePolicy: policy,
          safeExecuteGrantJti: grantJti,
          safeExecuteGrant: opaqueGrant,
        },
        limits: { maxToolCalls: 1 },
      });

      assert.deepStrictEqual(parseJessAdtInvocationPolicy(safeClaims), {
        threadId,
        executionId,
        systemSid: 'TST',
        objectKeys: ['CLAS:ZCL_RELEASE_GATE'],
        toolNames: [policy.operationId],
        operationClass: 'safe_execute',
        safeExecutePolicy: policy,
        safeExecuteGrantJti: grantJti,
        safeExecuteGrant: opaqueGrant,
        maxToolCalls: 1,
      });
      assert.strictEqual(
        isMcpInvocationDispatchPolicySupported(safeClaims),
        true,
      );
    });
  }

  it('rejects retired agent identities', () => {
    for (const agentId of [
      'system-assistant',
      'autonomous-review-agent',
    ] as const) {
      assert.strictEqual(
        parseJessAdtInvocationPolicy(
          claims({ agentId } as Partial<TrustedMcpInvocationClaims>),
        ),
        undefined,
      );
    }
  });

  it('rejects unsorted or duplicate exact scopes', () => {
    for (const constraint of [
      {
        ...claims().constraint,
        objectKeys: ['PROG:Z_RELEASE_REPORT', 'CLAS:ZCL_RELEASE_GATE'],
      },
      {
        ...claims().constraint,
        objectKeys: ['CLAS:ZCL_RELEASE_GATE', 'CLAS:ZCL_RELEASE_GATE'],
      },
      {
        ...claims().constraint,
        toolNames: ['get_object_structure', 'get_object'],
      },
    ]) {
      assert.strictEqual(
        parseJessAdtInvocationPolicy(claims({ constraint })),
        undefined,
      );
    }
  });

  it('rejects class, tool and policy drift', () => {
    const safeConstraint = {
      kind: 'jess-adt-v1',
      threadId,
      executionId,
      systemSid: 'TST',
      objectKeys: ['CLAS:ZCL_RELEASE_GATE'],
      toolNames: ['atc_run'],
      safeExecutePolicy: atcPolicy,
      safeExecuteGrantJti: grantJti,
      safeExecuteGrant: opaqueGrant,
    } as const;
    for (const candidate of [
      claims({
        classes: ['server', 'read'],
        constraint: safeConstraint,
      }),
      claims({
        classes: ['server', 'safe_execute'],
        constraint: {
          ...safeConstraint,
          toolNames: ['run_unit_tests'],
        },
      }),
      claims({
        classes: ['server', 'safe_execute'],
        constraint: {
          ...safeConstraint,
          safeExecutePolicy: { ...atcPolicy, ignored: true },
        },
      }),
      claims({
        classes: ['server', 'safe_execute'],
        constraint: {
          ...safeConstraint,
          safeExecutePolicy: undefined,
        },
      }),
    ]) {
      assert.strictEqual(parseJessAdtInvocationPolicy(candidate), undefined);
    }
  });
});
