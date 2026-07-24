import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDestinationContextRegistry,
  type DestinationContextFactory,
  type DestinationLeaseProvider,
} from '../src/lib/session/destination-registry.js';

function harness() {
  const closed: string[] = [];
  const leases: string[] = [];
  const provider: DestinationLeaseProvider = {
    async acquire({ destination }) {
      leases.push(destination);
      if (destination === 'missing') throw new Error('unknown destination');
      return {
        destination,
        expiresAt: Date.now() + 60_000,
        version: 1,
        material: {},
        release: async () => undefined,
      };
    },
  };
  const factory: DestinationContextFactory = {
    async create({ mcpSessionId, destination }) {
      return {
        client: {} as never,
        close: async () => {
          closed.push(`${mcpSessionId}/${destination}`);
        },
      };
    },
  };
  return { closed, leases, provider, factory };
}

test('isolates two destinations in one MCP session', async () => {
  const { provider, factory, leases } = harness();
  const registry = createDestinationContextRegistry({
    leaseProvider: provider,
    contextFactory: factory,
  });
  const dev = await registry.getOrCreate('session-1', 'dev', {
    principal: 'agent',
  });
  const prod = await registry.getOrCreate('session-1', 'prod', {
    principal: 'agent',
  });

  assert.notStrictEqual(dev, prod);
  assert.deepEqual(leases, ['dev', 'prod']);
  assert.strictEqual(registry.get('session-1', 'dev'), dev);
  assert.strictEqual(registry.get('session-1', 'prod'), prod);
  await registry.shutdown();
});

test('deduplicates concurrent acquisition for the same destination', async () => {
  const { provider, factory, leases } = harness();
  const registry = createDestinationContextRegistry({
    leaseProvider: provider,
    contextFactory: factory,
  });
  const [first, second] = await Promise.all([
    registry.getOrCreate('session-1', 'dev', { principal: 'agent' }),
    registry.getOrCreate('session-1', 'dev', { principal: 'agent' }),
  ]);

  assert.strictEqual(first, second);
  assert.deepEqual(leases, ['dev']);
  await registry.shutdown();
});

test('release is idempotent and releaseAll cleans every session destination', async () => {
  const { provider, factory, closed } = harness();
  const registry = createDestinationContextRegistry({
    leaseProvider: provider,
    contextFactory: factory,
  });
  await registry.getOrCreate('session-1', 'dev', { principal: 'agent' });
  await registry.getOrCreate('session-1', 'prod', { principal: 'agent' });
  await registry.release('session-1', 'dev');
  await registry.release('session-1', 'dev');
  await registry.releaseAll('session-1');

  assert.deepEqual(closed.sort(), ['session-1/dev', 'session-1/prod']);
  assert.deepEqual(registry.list(), []);
});

test('failed lease acquisition does not retain a context', async () => {
  const { provider, factory } = harness();
  const registry = createDestinationContextRegistry({
    leaseProvider: provider,
    contextFactory: factory,
  });

  await assert.rejects(
    registry.getOrCreate('session-1', 'missing', { principal: 'agent' }),
    /unknown destination/,
  );
  assert.strictEqual(registry.get('session-1', 'missing'), undefined);
  assert.deepEqual(registry.list(), []);
  await registry.shutdown();
});

test('releases a mismatched lease once without masking the mismatch', async () => {
  const events: string[] = [];
  let releases = 0;
  const provider: DestinationLeaseProvider = {
    async acquire() {
      events.push('acquire');
      return {
        destination: 'prod',
        expiresAt: Date.now() + 60_000,
        version: 1,
        material: {},
        release: async () => {
          releases += 1;
          events.push('release');
          throw new Error('broker release failed');
        },
      };
    },
  };
  const factory: DestinationContextFactory = {
    async create() {
      throw new Error('context factory must not run for a mismatched lease');
    },
  };
  const registry = createDestinationContextRegistry({
    leaseProvider: provider,
    contextFactory: factory,
  });

  await assert.rejects(
    registry.getOrCreate('session-1', 'dev', { principal: 'agent' }),
    /Destination lease did not match the requested destination/,
  );

  assert.equal(releases, 1);
  assert.deepEqual(events, ['acquire', 'release']);
  assert.deepEqual(registry.list(), []);
  await registry.shutdown();
});

test('releaseAll waits for a pending creation and cleans its context and lease', async () => {
  let resolveLease:
    | ((value: {
        destination: string;
        expiresAt: number;
        version: number;
        material: object;
        release(): Promise<void>;
      }) => void)
    | undefined;
  let resolveCreationStarted: (() => void) | undefined;
  let resolveContext:
    ((value: { client: never; close(): Promise<void> }) => void) | undefined;
  const leaseReady = new Promise<{
    destination: string;
    expiresAt: number;
    version: number;
    material: object;
    release(): Promise<void>;
  }>((resolve) => {
    resolveLease = resolve;
  });
  const creationStarted = new Promise<void>((resolve) => {
    resolveCreationStarted = resolve;
  });
  const contextReady = new Promise<{ client: never; close(): Promise<void> }>(
    (resolve) => {
      resolveContext = resolve;
    },
  );
  let closes = 0;
  let releases = 0;
  const provider: DestinationLeaseProvider = {
    async acquire() {
      return await leaseReady;
    },
  };
  const factory: DestinationContextFactory = {
    async create() {
      resolveCreationStarted?.();
      return await contextReady;
    },
  };
  const registry = createDestinationContextRegistry({
    leaseProvider: provider,
    contextFactory: factory,
  });

  const creating = registry.getOrCreate('session-1', 'dev', {
    principal: 'agent',
  });
  resolveLease?.({
    destination: 'dev',
    expiresAt: Date.now() + 60_000,
    version: 1,
    material: {},
    release: async () => {
      releases += 1;
    },
  });
  await creationStarted;
  const releasing = registry.releaseAll('session-1');
  resolveContext?.({
    client: {} as never,
    close: async () => {
      closes += 1;
    },
  });

  await Promise.all([creating, releasing]);

  assert.equal(closes, 1);
  assert.equal(releases, 1);
  assert.strictEqual(registry.get('session-1', 'dev'), undefined);
  assert.deepEqual(registry.list(), []);
  await registry.shutdown();
});

test('serialises work within one context without blocking another destination', async () => {
  const { provider, factory } = harness();
  const registry = createDestinationContextRegistry({
    leaseProvider: provider,
    contextFactory: factory,
  });
  const dev = await registry.getOrCreate('session-1', 'dev', {
    principal: 'agent',
  });
  const prod = await registry.getOrCreate('session-1', 'prod', {
    principal: 'agent',
  });
  const events: string[] = [];
  let releaseDev: () => void = () => undefined;
  const devFirst = dev.runExclusive(async () => {
    events.push('dev-start');
    await new Promise<void>((resolve) => {
      releaseDev = resolve;
    });
    events.push('dev-end');
  });
  const devSecond = dev.runExclusive(async () => events.push('dev-second'));
  await prod.runExclusive(async () => events.push('prod'));
  assert.deepEqual(events, ['dev-start', 'prod']);
  releaseDev();
  await Promise.all([devFirst, devSecond]);
  assert.deepEqual(events, ['dev-start', 'prod', 'dev-end', 'dev-second']);
  await registry.shutdown();
});
