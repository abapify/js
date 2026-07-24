import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isMcpInvocationDispatchPolicySupported,
  parseScopedAdtInvocationPolicy,
  type TrustedMcpInvocationClaims,
} from '../src/lib/http/invocation.js';

const scopeId = '11111111-1111-4111-8111-111111111111';
const executionId = '22222222-2222-4222-8222-222222222222';
const authorizationId = '33333333-3333-4333-8333-333333333333';
const authorizationToken = [
  'mock_header',
  'mock_payload',
  'mock_signature',
].join('.');

function claims(
  overrides: Partial<TrustedMcpInvocationClaims> = {},
): TrustedMcpInvocationClaims {
  return {
    tokenId: 'jti-scoped-001',
    principal: 'engineer@example.invalid',
    agentId: 'adt-execution',
    classes: ['server', 'read'],
    destinationKeys: ['tst-adt'],
    correlationId: 'scoped:execution:001',
    constraint: {
      kind: 'adt-execution-v1',
      scopeId,
      executionId,
      systemSid: 'TST',
      resourceKeys: ['CLAS:ZCL_RELEASE_GATE', 'PROG:Z_RELEASE_REPORT'],
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

describe('Scoped ADT invocation policy', () => {
  it('parses the exact read policy', () => {
    const parsed = parseScopedAdtInvocationPolicy(claims());

    assert.deepStrictEqual(parsed, {
      scopeId,
      executionId,
      systemSid: 'TST',
      resourceKeys: ['CLAS:ZCL_RELEASE_GATE', 'PROG:Z_RELEASE_REPORT'],
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
          kind: 'adt-execution-v1',
          scopeId,
          executionId,
          systemSid: 'TST',
          resourceKeys: ['CLAS:ZCL_RELEASE_GATE'],
          toolNames: [policy.operationId],
          safeExecutePolicy: policy,
          authorizationId: authorizationId,
          authorizationToken: authorizationToken,
        },
        limits: { maxToolCalls: 1 },
      });

      assert.deepStrictEqual(parseScopedAdtInvocationPolicy(safeClaims), {
        scopeId,
        executionId,
        systemSid: 'TST',
        resourceKeys: ['CLAS:ZCL_RELEASE_GATE'],
        toolNames: [policy.operationId],
        operationClass: 'safe_execute',
        safeExecutePolicy: policy,
        authorizationId: authorizationId,
        authorizationToken: authorizationToken,
        maxToolCalls: 1,
      });
      assert.strictEqual(
        isMcpInvocationDispatchPolicySupported(safeClaims),
        true,
      );
    });
  }

  it('does not reinterpret other agent policies as scoped execution', () => {
    for (const agentId of [
      'system-assistant',
      'autonomous-review-agent',
    ] as const) {
      assert.strictEqual(
        parseScopedAdtInvocationPolicy(
          claims({ agentId } as Partial<TrustedMcpInvocationClaims>),
        ),
        undefined,
      );
    }
  });

  it('rejects destination-wide reads without an exact resource binding', () => {
    for (const toolName of ['cts_get_transport', 'cts_transport_objects']) {
      const constraint = {
        ...claims().constraint,
        toolNames: [toolName],
      };
      assert.strictEqual(
        parseScopedAdtInvocationPolicy(claims({ constraint })),
        undefined,
      );
    }
  });

  it('rejects unsorted or duplicate exact scopes', () => {
    for (const constraint of [
      {
        ...claims().constraint,
        resourceKeys: ['PROG:Z_RELEASE_REPORT', 'CLAS:ZCL_RELEASE_GATE'],
      },
      {
        ...claims().constraint,
        resourceKeys: ['CLAS:ZCL_RELEASE_GATE', 'CLAS:ZCL_RELEASE_GATE'],
      },
      {
        ...claims().constraint,
        toolNames: ['get_object_structure', 'get_object'],
      },
    ]) {
      assert.strictEqual(
        parseScopedAdtInvocationPolicy(claims({ constraint })),
        undefined,
      );
    }
  });

  it('rejects class, tool and policy drift', () => {
    const safeConstraint = {
      kind: 'adt-execution-v1',
      scopeId,
      executionId,
      systemSid: 'TST',
      resourceKeys: ['CLAS:ZCL_RELEASE_GATE'],
      toolNames: ['atc_run'],
      safeExecutePolicy: atcPolicy,
      authorizationId: authorizationId,
      authorizationToken: authorizationToken,
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
      assert.strictEqual(parseScopedAdtInvocationPolicy(candidate), undefined);
    }
  });
});
