import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpServer } from '../src/lib/server.js';
import { createDestinationContextRegistry } from '../src/lib/session/destination-registry.js';
import type { ToolContext } from '../src/lib/types.js';
import {
  MCP_TOOL_SCOPE_CATALOGUE,
  type McpRequestAccess,
} from '../src/lib/tools/scope-catalogue.js';
import { destinationModeServer } from '../src/lib/tools/destination-mode.js';
import { registerTools } from '../src/lib/tools/index.js';

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

function destinationRegistry(onLease: () => void, onContext = () => undefined) {
  return createDestinationContextRegistry({
    leaseProvider: {
      async acquire({ destination }) {
        onLease();
        return {
          destination,
          expiresAt: Date.now() + 60_000,
          version: 1,
          material: {},
          release: async () => undefined,
        };
      },
    },
    contextFactory: {
      async create() {
        onContext();
        return { client: {} as never, close: async () => undefined };
      },
    },
    ttlMs: 0,
  });
}

test('a read-scoped caller can dispatch a permitted read tool', async () => {
  const target = new CapturingServer();
  const server = destinationModeServer(target as unknown as McpServer, {
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  let calls = 0;
  server.tool('sap_disconnect', {}, async () => {
    calls++;
    return { content: [{ type: 'text' as const, text: 'permitted' }] };
  });

  const result = await target.handlers.get('sap_disconnect')!(
    { destination: 'dev' },
    { sessionId: 'session-1' },
  );

  assert.notStrictEqual(result.isError, true);
  assert.strictEqual(result.content[0]?.text, 'permitted');
  assert.strictEqual(calls, 1);
});

test('a read-scoped caller cannot dispatch a permitted read tool on an unauthorised destination', async () => {
  let leases = 0;
  let contexts = 0;
  const destinations = destinationRegistry(
    () => leases++,
    () => contexts++,
  );
  const target = new CapturingServer();
  const server = destinationModeServer(target as unknown as McpServer, {
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  let handlerCalls = 0;
  server.tool('sap_disconnect', {}, async (args) => {
    handlerCalls++;
    await destinations.getOrCreate('session-1', args.destination as string, {
      principal: 'agent',
    });
    return { content: [{ type: 'text' as const, text: 'unexpected' }] };
  });

  try {
    const result = await target.handlers.get('sap_disconnect')!(
      { destination: 'prod' },
      { sessionId: 'session-1' },
    );

    assert.strictEqual(result.isError, true);
    assert.strictEqual(result.content[0]?.text, 'mcp_scope_denied');
    assert.strictEqual(handlerCalls, 0);
    assert.strictEqual(leases, 0);
    assert.strictEqual(contexts, 0);
  } finally {
    await destinations.shutdown();
  }
});

test('a caller missing trusted destination keys is denied before its handler', async () => {
  const target = new CapturingServer();
  const server = destinationModeServer(target as unknown as McpServer, {
    requestAccess: () => ({ classes: ['read'] }) as unknown as McpRequestAccess,
  });
  let handlerCalls = 0;
  server.tool('sap_disconnect', {}, async () => {
    handlerCalls++;
    return { content: [{ type: 'text' as const, text: 'unexpected' }] };
  });

  const result = await target.handlers.get('sap_disconnect')!(
    { destination: 'dev' },
    { sessionId: 'session-1' },
  );

  assert.strictEqual(result.isError, true);
  assert.strictEqual(result.content[0]?.text, 'mcp_scope_denied');
  assert.strictEqual(handlerCalls, 0);
});

test('a caller with malformed trusted classes is denied without throwing', async () => {
  const target = new CapturingServer();
  const server = destinationModeServer(target as unknown as McpServer, {
    requestAccess: () =>
      ({
        classes: null,
        destinationKeys: ['dev'],
      }) as unknown as McpRequestAccess,
  });
  let handlerCalls = 0;
  server.tool('sap_disconnect', {}, async () => {
    handlerCalls++;
    return { content: [{ type: 'text' as const, text: 'unexpected' }] };
  });

  const result = await target.handlers.get('sap_disconnect')!(
    { destination: 'dev' },
    { sessionId: 'session-1' },
  );

  assert.strictEqual(result.isError, true);
  assert.strictEqual(result.content[0]?.text, 'mcp_scope_denied');
  assert.strictEqual(handlerCalls, 0);
});

test('a direct write dispatch is denied before its handler or destination lease', async () => {
  let leases = 0;
  const destinations = destinationRegistry(() => leases++);
  const target = new CapturingServer();
  const server = destinationModeServer(target as unknown as McpServer, {
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  let handlerCalls = 0;
  server.tool('lock_object', {}, async () => {
    handlerCalls++;
    await destinations.getOrCreate('session-1', 'dev', { principal: 'agent' });
    return { content: [{ type: 'text' as const, text: 'unexpected' }] };
  });

  try {
    const result = await target.handlers.get('lock_object')!(
      { destination: 'dev', objectName: 'ZCL_SCOPE_TEST' },
      { sessionId: 'session-1' },
    );

    assert.strictEqual(result.isError, true);
    assert.strictEqual(result.content[0]?.text, 'mcp_scope_denied');
    assert.strictEqual(handlerCalls, 0);
    assert.strictEqual(leases, 0);
  } finally {
    await destinations.shutdown();
  }
});

test('the catalogue classifies every tool registered by the factory', () => {
  const target = new CapturingServer();
  const server = destinationModeServer(target as unknown as McpServer, {
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  const ctx: ToolContext = { getClient: () => ({}) as never };

  registerTools(server, ctx);

  assert.ok(target.handlers.size > 0);
  const registeredNames = [...target.handlers.keys()].sort();
  const catalogueNames = Object.keys(MCP_TOOL_SCOPE_CATALOGUE).sort();
  assert.deepEqual(catalogueNames, registeredNames);
  for (const name of registeredNames) {
    assert.ok(MCP_TOOL_SCOPE_CATALOGUE[name], `${name} is unclassified`);
  }
});

test('createMcpServer denies a crafted write call in destination mode', async () => {
  let leases = 0;
  const destinations = destinationRegistry(() => leases++);
  const server = createMcpServer({
    destinationRegistry: destinations,
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'scope-factory-test', version: '0.0.1' });
  await client.connect(clientTransport);

  try {
    const result = await client.callTool({
      name: 'lock_object',
      arguments: { destination: 'dev', objectName: 'ZCL_SCOPE_TEST' },
    });
    assert.strictEqual(result.isError, true);
    assert.strictEqual(
      (result.content as Array<{ type: 'text'; text: string }>)[0]?.text,
      'mcp_scope_denied',
    );
    assert.strictEqual(leases, 0);
  } finally {
    await client.close();
    await server.close();
    await destinations.shutdown();
  }
});

test('destination mode exposes capability-bound immutable source selection without a raw URI', async () => {
  const destinations = destinationRegistry(() => undefined);
  const server = createMcpServer({
    destinationRegistry: destinations,
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({
    name: 'source-version-schema-test',
    version: '0.0.1',
  });
  await client.connect(clientTransport);

  try {
    const tool = (await client.listTools()).tools.find(
      (candidate) => candidate.name === 'get_source_version',
    );
    const properties = tool?.inputSchema.properties as
      | Record<string, unknown>
      | undefined;

    assert.ok(tool);
    assert.ok(properties?.sourceCapability);
    assert.ok(!Object.hasOwn(properties ?? {}, 'uri'));
  } finally {
    await client.close();
    await server.close();
    await destinations.shutdown();
  }
});

test('destination mode hides and rejects the legacy raw ATC URI target', async () => {
  const destinations = destinationRegistry(() => undefined);
  const server = createMcpServer({
    destinationRegistry: destinations,
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({
    name: 'atc-scope-schema-test',
    version: '0.0.1',
  });
  await client.connect(clientTransport);

  try {
    const tool = (await client.listTools()).tools.find(
      (candidate) => candidate.name === 'atc_run',
    );
    const properties = tool?.inputSchema.properties as
      | Record<string, unknown>
      | undefined;

    assert.ok(tool);
    assert.ok(properties?.scope);
    assert.ok(!Object.hasOwn(properties ?? {}, 'objectUri'));

    const result = await client.callTool({
      name: 'atc_run',
      arguments: {
        destination: 'dev',
        scope: { kind: 'package', packageName: 'ZPACKAGE' },
        objectUri: '/sap/bc/adt/packages/ZPACKAGE',
      },
    });
    assert.strictEqual(result.isError, true);
  } finally {
    await client.close();
    await server.close();
    await destinations.shutdown();
  }
});

test('destination mode hides raw URI fields from all canonical read tools', async () => {
  const destinations = destinationRegistry(() => undefined);
  const server = createMcpServer({
    destinationRegistry: destinations,
    requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({
    name: 'canonical-read-schema-test',
    version: '0.0.1',
  });
  await client.connect(clientTransport);

  try {
    const tools = await client.listTools();
    const forbiddenFields: Readonly<Record<string, string>> = {
      atc_run: 'objectUri',
      get_callers_of: 'objectUri',
      get_callees_of: 'objectUri',
      find_references: 'objectUri',
      grep_objects: 'objectUris',
    };
    for (const [name, forbiddenField] of Object.entries(forbiddenFields)) {
      const tool = tools.tools.find((candidate) => candidate.name === name);
      const properties = tool?.inputSchema.properties as
        | Record<string, unknown>
        | undefined;
      assert.ok(tool, `${name} must be listed to a read-scoped caller`);
      assert.ok(
        !Object.hasOwn(properties ?? {}, forbiddenField),
        `${name} must not publish ${forbiddenField}`,
      );
    }
  } finally {
    await client.close();
    await server.close();
    await destinations.shutdown();
  }
});
