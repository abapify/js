import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SourceCapabilityError,
  createSourceCapabilityRegistry,
} from '../src/lib/source-capabilities.js';

test('a source capability is bound to its MCP session and destination', () => {
  const registry = createSourceCapabilityRegistry({
    now: () => 1_000,
    ttlMs: 60_000,
  });
  const sourceCapability = registry.issue({
    sessionId: 'session-a',
    destination: 'dev',
    sourceUri: '/sap/bc/adt/programs/programs/zsafe/source/main/versions/1',
  });

  assert.deepEqual(
    registry.resolve({
      sourceCapability,
      sessionId: 'session-a',
      destination: 'dev',
    }),
    {
      sourceUri: '/sap/bc/adt/programs/programs/zsafe/source/main/versions/1',
    },
  );
  assert.throws(
    () =>
      registry.resolve({
        sourceCapability,
        sessionId: 'session-a',
        destination: 'prod',
      }),
    SourceCapabilityError,
  );
});

test('an expired source capability is unavailable without returning its URI', () => {
  let now = 1_000;
  const registry = createSourceCapabilityRegistry({
    now: () => now,
    ttlMs: 1,
  });
  const sourceCapability = registry.issue({
    sessionId: 'session-a',
    destination: 'dev',
    sourceUri: '/sap/bc/adt/programs/programs/zsafe/source/main/versions/1',
  });
  now += 2;

  assert.throws(
    () =>
      registry.resolve({
        sourceCapability,
        sessionId: 'session-a',
        destination: 'dev',
      }),
    (error: unknown) =>
      error instanceof SourceCapabilityError &&
      !error.message.includes('/sap/bc/adt/'),
  );
});
