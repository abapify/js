import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { destinationModeServer } from '../src/lib/tools/destination-mode.js';
import { registerAtcRunTool } from '../src/lib/tools/atc-run.js';
import { registerRunUnitTestsTool } from '../src/lib/tools/run-unit-tests.js';
import {
  isMcpToolListed,
  normalizeUnitTestOptions,
  type McpRequestAccess,
} from '../src/lib/tools/scope-catalogue.js';
import { isKnownAdtHttpFailure } from '../src/lib/tools/utils.js';

type ToolResult = {
  isError?: boolean;
  content: Array<{ type: 'text'; text: string }>;
};
type ToolHandler = (
  args: Record<string, unknown>,
  extra: { sessionId?: string },
) => Promise<ToolResult>;

class CapturingServer {
  readonly handlers = new Map<string, ToolHandler>();

  tool(...args: unknown[]): void {
    const name = args[0];
    const handler = args.at(-1);
    assert.strictEqual(typeof name, 'string');
    assert.strictEqual(typeof handler, 'function');
    this.handlers.set(name, handler as ToolHandler);
  }
}

const atcPolicy = {
  operationId: 'atc_run',
  check: 'atc',
  maxDurationMs: 30_000,
  maxResultBytes: 1_024,
  maxFindings: 10,
  maxObjects: 2,
  maxPackages: 1,
  maxVariants: 1,
} as const;

function safeAccess(): McpRequestAccess {
  return {
    classes: ['server', 'safe_execute'],
    destinationKeys: ['tst-adt'],
    scoped: {
      tokenId: 'invocation-jti',
      principal: 'engineer@example.invalid',
      correlationId: 'scoped:execution:001',
      scopeId: '11111111-1111-4111-8111-111111111111',
      executionId: '22222222-2222-4222-8222-222222222222',
      systemSid: 'TST',
      resourceKeys: ['CLAS:ZCL_RELEASE_GATE'],
      toolNames: ['atc_run'],
      operationClass: 'safe_execute',
      maxToolCalls: 1,
      safeExecutePolicy: atcPolicy,
      authorizationId: '33333333-3333-4333-8333-333333333333',
      authorizationToken: 'header.payload.signature',
    },
  };
}

function safeAunitAccess(): McpRequestAccess {
  const access = safeAccess();
  return {
    ...access,
    scoped: {
      ...access.scoped!,
      resourceKeys: ['CLAS:ZCL_RELEASE_GATE'],
      toolNames: ['run_unit_tests'],
      safeExecutePolicy: {
        operationId: 'run_unit_tests',
        check: 'aunit',
        effectiveWithCoverage: false,
        effectiveCoverageFormat: null,
        maxDurationMs: 30_000,
        maxResultBytes: 1_024,
        maxFindings: 10,
        maxObjects: 1,
        maxTestClasses: 10,
        maxTestMethods: 100,
      },
    },
  };
}

const exactAtcArgs = {
  destination: 'tst-adt',
  scope: {
    kind: 'objects',
    objects: [{ objectType: 'CLAS', objectName: 'ZCL_RELEASE_GATE' }],
  },
  variant: 'DEFAULT',
};

describe('Scoped safe-execute catalogue and dispatch', () => {
  it('classifies only completed SAP HTTP error responses as deterministic failures', () => {
    const sapResponse = Object.assign(new Error('HTTP 400: Bad Request'), {
      name: 'AdtError',
      status: 400,
    });
    const transportFailure = new TypeError('fetch failed');
    const abortFailure = Object.assign(new Error('deadline exceeded'), {
      name: 'AbortError',
    });

    assert.strictEqual(isKnownAdtHttpFailure(sapResponse), true);
    assert.strictEqual(isKnownAdtHttpFailure(transportFailure), false);
    assert.strictEqual(isKnownAdtHttpFailure(abortFailure), false);
  });

  it('normalises known ATC HTTP failures but rethrows uncertain transport failures', async () => {
    const target = new CapturingServer();
    let failure: Error = Object.assign(new Error('HTTP 400: Bad Request'), {
      name: 'AdtError',
      status: 400,
    });
    registerAtcRunTool(target as unknown as McpServer, {
      getClient: () =>
        ({
          adt: {
            atc: {
              worklists: {
                create: async () => {
                  throw failure;
                },
              },
            },
          },
        }) as never,
      requestAccess: safeAccess,
    });
    const handler = target.handlers.get('atc_run')!;
    const args = {
      baseUrl: 'https://sap.example.test',
      scope: exactAtcArgs.scope,
      variant: 'DEFAULT',
    };

    await assert.doesNotReject(async () => {
      const result = await handler(args, {});
      assert.strictEqual(result.isError, true);
    });

    failure = new TypeError('fetch failed');
    await assert.rejects(handler(args, {}), /fetch failed/u);
  });

  it('normalises known AUnit HTTP failures but rethrows uncertain transport failures', async () => {
    const target = new CapturingServer();
    let failure: Error = Object.assign(
      new Error('HTTP 500: Internal Server Error'),
      {
        name: 'AdtError',
        status: 500,
      },
    );
    registerRunUnitTestsTool(target as unknown as McpServer, {
      getClient: () =>
        ({
          adt: {
            aunit: {
              testruns: {
                post: async () => {
                  throw failure;
                },
              },
            },
          },
        }) as never,
      requestAccess: safeAunitAccess,
    });
    const handler = target.handlers.get('run_unit_tests')!;
    const args = {
      baseUrl: 'https://sap.example.test',
      objectName: 'ZCL_RELEASE_GATE',
      objectType: 'CLAS',
      withCoverage: false,
    };

    await assert.doesNotReject(async () => {
      const result = await handler(args, {});
      assert.strictEqual(result.isError, true);
    });

    failure = new TypeError('fetch failed');
    await assert.rejects(handler(args, {}), /fetch failed/u);
  });

  it('normalises coverage flags and rejects disagreement', () => {
    assert.deepStrictEqual(normalizeUnitTestOptions({}), {
      effectiveWithCoverage: false,
      effectiveCoverageFormat: null,
    });
    assert.deepStrictEqual(
      normalizeUnitTestOptions({
        coverage: true,
        withCoverage: true,
        coverageFormat: 'sonar-generic',
      }),
      {
        effectiveWithCoverage: true,
        effectiveCoverageFormat: 'sonar-generic',
      },
    );
    assert.strictEqual(
      normalizeUnitTestOptions({
        coverage: true,
        withCoverage: false,
      }),
      undefined,
    );
  });

  it('hides both checks from read and exposes exactly the signed safe tool', () => {
    const read: McpRequestAccess = {
      classes: ['server', 'read'],
      destinationKeys: ['tst-adt'],
      scoped: {
        tokenId: 'read-jti',
        principal: 'engineer@example.invalid',
        correlationId: 'scoped:execution:read',
        scopeId: '11111111-1111-4111-8111-111111111111',
        executionId: '22222222-2222-4222-8222-222222222222',
        systemSid: 'TST',
        resourceKeys: ['CLAS:ZCL_RELEASE_GATE'],
        toolNames: ['get_object'],
        operationClass: 'read',
        maxToolCalls: 3,
      },
    };

    assert.strictEqual(isMcpToolListed(read, 'atc_run'), false);
    assert.strictEqual(isMcpToolListed(read, 'run_unit_tests'), false);
    assert.strictEqual(isMcpToolListed(safeAccess(), 'atc_run'), true);
    assert.strictEqual(isMcpToolListed(safeAccess(), 'run_unit_tests'), false);
  });

  it('denies policy/resource mismatch before grant consumption and handler I/O', async () => {
    const target = new CapturingServer();
    let consumes = 0;
    let handlerCalls = 0;
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: safeAccess,
      consumeExecutionAuthorization: async () => {
        consumes++;
        return true;
      },
      executeWithDeadline: async ({ operation }) => await operation(),
      reportExecutionOutcome: async () => true,
    });
    server.tool('atc_run', {}, async () => {
      handlerCalls++;
      return { content: [{ type: 'text' as const, text: 'unexpected' }] };
    });

    const result = await target.handlers.get('atc_run')!(
      {
        ...exactAtcArgs,
        scope: {
          kind: 'objects',
          objects: [{ objectType: 'CLAS', objectName: 'ZCL_OTHER' }],
        },
      },
      { sessionId: 'session-1' },
    );

    assert.strictEqual(result.isError, true);
    assert.strictEqual(result.content[0]?.text, 'mcp_scope_denied');
    assert.strictEqual(consumes, 0);
    assert.strictEqual(handlerCalls, 0);
  });

  it('denies an unmaterialised package expansion before grant consumption', async () => {
    const target = new CapturingServer();
    let consumes = 0;
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: safeAccess,
      consumeExecutionAuthorization: async () => {
        consumes++;
        return true;
      },
      executeWithDeadline: async ({ operation }) => await operation(),
      reportExecutionOutcome: async () => true,
    });
    server.tool('atc_run', {}, async () => ({
      content: [{ type: 'text' as const, text: 'unexpected' }],
    }));

    const result = await target.handlers.get('atc_run')!(
      {
        destination: 'tst-adt',
        scope: { kind: 'package', packageName: 'ZRELEASE' },
        variant: 'DEFAULT',
      },
      { sessionId: 'session-1' },
    );

    assert.strictEqual(result.isError, true);
    assert.strictEqual(consumes, 0);
  });

  it('consumes the opaque grant before I/O and denies replay', async () => {
    const target = new CapturingServer();
    const events: string[] = [];
    let unconsumed = true;
    const access = safeAccess();
    access.scoped = { ...access.scoped!, maxToolCalls: 2 };
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: () => access,
      consumeExecutionAuthorization: async (input) => {
        events.push('consume');
        assert.strictEqual(
          input.authorizationId,
          safeAccess().scoped?.authorizationId,
        );
        assert.strictEqual(
          input.authorizationToken,
          'header.payload.signature',
        );
        if (!unconsumed) return false;
        unconsumed = false;
        return true;
      },
      executeWithDeadline: async ({ operation }) => await operation(),
      reportExecutionOutcome: async ({ outcome }) => {
        events.push(`outcome:${outcome}`);
        return true;
      },
    });
    server.tool('atc_run', {}, async () => {
      events.push('handler');
      return { content: [{ type: 'text' as const, text: 'permitted' }] };
    });

    const first = await target.handlers.get('atc_run')!(exactAtcArgs, {
      sessionId: 'session-1',
    });
    const replay = await target.handlers.get('atc_run')!(exactAtcArgs, {
      sessionId: 'session-1',
    });

    assert.strictEqual(first.isError, undefined);
    assert.deepStrictEqual(events, [
      'consume',
      'handler',
      'outcome:succeeded',
      'consume',
    ]);
    assert.strictEqual(replay.isError, true);
    assert.strictEqual(replay.content[0]?.text, 'mcp_scope_denied');
  });

  it('enforces maxToolCalls across the exact read catalogue', async () => {
    const target = new CapturingServer();
    let handlerCalls = 0;
    const access: McpRequestAccess = {
      classes: ['server', 'read'],
      destinationKeys: ['tst-adt'],
      scoped: {
        tokenId: 'read-jti',
        principal: 'engineer@example.invalid',
        correlationId: 'scoped:execution:read',
        scopeId: '11111111-1111-4111-8111-111111111111',
        executionId: '22222222-2222-4222-8222-222222222222',
        systemSid: 'TST',
        resourceKeys: ['CLAS:ZCL_RELEASE_GATE'],
        toolNames: ['get_object'],
        operationClass: 'read',
        maxToolCalls: 1,
      },
    };
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: () => access,
    });
    server.tool('get_object', {}, async () => {
      handlerCalls++;
      return { content: [{ type: 'text' as const, text: 'permitted' }] };
    });
    const args = {
      destination: 'tst-adt',
      objectType: 'CLAS',
      objectName: 'ZCL_RELEASE_GATE',
    };

    const first = await target.handlers.get('get_object')!(args, {
      sessionId: 'session-1',
    });
    const second = await target.handlers.get('get_object')!(args, {
      sessionId: 'session-1',
    });

    assert.strictEqual(first.isError, undefined);
    assert.strictEqual(second.isError, true);
    assert.strictEqual(handlerCalls, 1);
  });

  it('stays fail-closed before consume when the runtime or outcome recorder is absent', async () => {
    const target = new CapturingServer();
    let consumes = 0;
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: safeAccess,
      consumeExecutionAuthorization: async () => {
        consumes++;
        return true;
      },
      executeWithDeadline: async ({ operation }) => await operation(),
    });
    server.tool('atc_run', {}, async () => ({
      content: [{ type: 'text' as const, text: 'unexpected' }],
    }));

    const result = await target.handlers.get('atc_run')!(exactAtcArgs, {
      sessionId: 'session-1',
    });

    assert.strictEqual(result.isError, true);
    assert.strictEqual(consumes, 0);
  });

  it('enforces the signed result byte limit after a consumed execution', async () => {
    const target = new CapturingServer();
    const access = safeAccess();
    access.scoped = {
      ...access.scoped!,
      safeExecutePolicy: { ...atcPolicy, maxResultBytes: 8 },
    };
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: () => access,
      consumeExecutionAuthorization: async () => true,
      executeWithDeadline: async ({ operation }) => await operation(),
      reportExecutionOutcome: async ({ outcome }) => {
        assert.strictEqual(outcome, 'failed');
        return true;
      },
    });
    server.tool('atc_run', {}, async () => ({
      content: [{ type: 'text' as const, text: 'larger-than-eight-bytes' }],
    }));

    const result = await target.handlers.get('atc_run')!(exactAtcArgs, {
      sessionId: 'session-1',
    });

    assert.strictEqual(result.isError, true);
    assert.strictEqual(result.content[0]?.text, 'safe_execute_limit_exceeded');
  });

  it('records deterministic tool failures only after the operation settles', async () => {
    const target = new CapturingServer();
    const events: string[] = [];
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: safeAccess,
      consumeExecutionAuthorization: async () => {
        events.push('consume');
        return true;
      },
      executeWithDeadline: async ({ operation }) => await operation(),
      reportExecutionOutcome: async (input) => {
        events.push(`outcome:${input.outcome}`);
        assert.strictEqual(
          input.authorizationId,
          '33333333-3333-4333-8333-333333333333',
        );
        assert.strictEqual(
          input.authorizationToken,
          'header.payload.signature',
        );
        return true;
      },
    });
    server.tool('atc_run', {}, async () => {
      events.push('handler-settled');
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'deterministic failure' }],
      };
    });

    const result = await target.handlers.get('atc_run')!(exactAtcArgs, {
      sessionId: 'session-1',
    });

    assert.strictEqual(result.isError, true);
    assert.deepStrictEqual(events, [
      'consume',
      'handler-settled',
      'outcome:failed',
    ]);
  });

  it('records outcome_unknown once after an uncertain operation settles without retrying SAP', async () => {
    const target = new CapturingServer();
    const events: string[] = [];
    let handlerCalls = 0;
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: safeAccess,
      consumeExecutionAuthorization: async () => true,
      executeWithDeadline: async ({ operation }) => {
        await operation();
        throw new Error('transport outcome is uncertain');
      },
      reportExecutionOutcome: async ({ outcome }) => {
        events.push(outcome);
        return true;
      },
    });
    server.tool('atc_run', {}, async () => {
      handlerCalls++;
      events.push('handler-settled');
      return { content: [{ type: 'text' as const, text: 'late result' }] };
    });

    const result = await target.handlers.get('atc_run')!(exactAtcArgs, {
      sessionId: 'session-1',
    });

    assert.strictEqual(result.isError, true);
    assert.strictEqual(result.content[0]?.text, 'outcome_unknown');
    assert.strictEqual(handlerCalls, 1);
    assert.deepStrictEqual(events, ['handler-settled', 'outcome_unknown']);
  });

  it('returns outcome_unknown when the single terminal report fails without rerunning SAP', async () => {
    const target = new CapturingServer();
    let handlerCalls = 0;
    let reports = 0;
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: safeAccess,
      consumeExecutionAuthorization: async () => true,
      executeWithDeadline: async ({ operation }) => await operation(),
      reportExecutionOutcome: async () => {
        reports++;
        return false;
      },
    });
    server.tool('atc_run', {}, async () => {
      handlerCalls++;
      return { content: [{ type: 'text' as const, text: 'SAP completed' }] };
    });

    const result = await target.handlers.get('atc_run')!(exactAtcArgs, {
      sessionId: 'session-1',
    });

    assert.strictEqual(result.isError, true);
    assert.strictEqual(result.content[0]?.text, 'outcome_unknown');
    assert.strictEqual(handlerCalls, 1);
    assert.strictEqual(reports, 1);
  });
});
