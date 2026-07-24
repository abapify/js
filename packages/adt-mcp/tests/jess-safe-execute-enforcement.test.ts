import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { destinationModeServer } from '../src/lib/tools/destination-mode.js';
import {
  isMcpToolListed,
  normalizeUnitTestOptions,
  type McpRequestAccess,
} from '../src/lib/tools/scope-catalogue.js';

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
    jess: {
      tokenId: 'invocation-jti',
      principal: 'engineer@arm',
      correlationId: 'jess:execution:001',
      threadId: '11111111-1111-4111-8111-111111111111',
      executionId: '22222222-2222-4222-8222-222222222222',
      systemSid: 'TST',
      objectKeys: ['CLAS:ZCL_RELEASE_GATE'],
      toolNames: ['atc_run'],
      operationClass: 'safe_execute',
      maxToolCalls: 1,
      safeExecutePolicy: atcPolicy,
      safeExecuteGrantJti: '33333333-3333-4333-8333-333333333333',
      safeExecuteGrant: 'header.payload.signature',
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

describe('Jess safe-execute catalogue and dispatch', () => {
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
      jess: {
        tokenId: 'read-jti',
        principal: 'engineer@arm',
        correlationId: 'jess:execution:read',
        threadId: '11111111-1111-4111-8111-111111111111',
        executionId: '22222222-2222-4222-8222-222222222222',
        systemSid: 'TST',
        objectKeys: ['CLAS:ZCL_RELEASE_GATE'],
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
      consumeSafeExecuteGrant: async () => {
        consumes++;
        return true;
      },
      executeSafeTool: async ({ operation }) => await operation(),
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
      consumeSafeExecuteGrant: async () => {
        consumes++;
        return true;
      },
      executeSafeTool: async ({ operation }) => await operation(),
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
    access.jess = { ...access.jess!, maxToolCalls: 2 };
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: () => access,
      consumeSafeExecuteGrant: async (input) => {
        events.push('consume');
        assert.strictEqual(
          input.grantJti,
          safeAccess().jess?.safeExecuteGrantJti,
        );
        assert.strictEqual(input.opaqueGrant, 'header.payload.signature');
        if (!unconsumed) return false;
        unconsumed = false;
        return true;
      },
      executeSafeTool: async ({ operation }) => await operation(),
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
    assert.deepStrictEqual(events, ['consume', 'handler', 'consume']);
    assert.strictEqual(replay.isError, true);
    assert.strictEqual(replay.content[0]?.text, 'mcp_scope_denied');
  });

  it('enforces maxToolCalls across the exact read catalogue', async () => {
    const target = new CapturingServer();
    let handlerCalls = 0;
    const access: McpRequestAccess = {
      classes: ['server', 'read'],
      destinationKeys: ['tst-adt'],
      jess: {
        tokenId: 'read-jti',
        principal: 'engineer@arm',
        correlationId: 'jess:execution:read',
        threadId: '11111111-1111-4111-8111-111111111111',
        executionId: '22222222-2222-4222-8222-222222222222',
        systemSid: 'TST',
        objectKeys: ['CLAS:ZCL_RELEASE_GATE'],
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

  it('stays fail-closed before consume when no hard-cancellable runtime exists', async () => {
    const target = new CapturingServer();
    let consumes = 0;
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: safeAccess,
      consumeSafeExecuteGrant: async () => {
        consumes++;
        return true;
      },
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
    access.jess = {
      ...access.jess!,
      safeExecutePolicy: { ...atcPolicy, maxResultBytes: 8 },
    };
    const server = destinationModeServer(target as unknown as McpServer, {
      requestAccess: () => access,
      consumeSafeExecuteGrant: async () => true,
      executeSafeTool: async ({ operation }) => await operation(),
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
});
