import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RestSourceCapabilityError,
  createRestSourceCapabilityService,
} from '../src/source-capabilities.js';

test('a REST source capability is opaque and bound to one destination', () => {
  const service = createRestSourceCapabilityService({
    secret: 'test-secret',
    now: () => 1_000,
    ttlMs: 60_000,
  });
  const sourceUri =
    '/sap/bc/adt/programs/programs/zsafe/source/main/versions/1';
  const sourceCapability = service.issue({
    destination: 'dev',
    sourceUri,
  });

  assert.ok(sourceCapability.startsWith('src.v1.'));
  assert.ok(!sourceCapability.includes(sourceUri));
  assert.deepEqual(service.resolve({ sourceCapability, destination: 'dev' }), {
    sourceUri,
  });
  assert.throws(
    () => service.resolve({ sourceCapability, destination: 'prod' }),
    RestSourceCapabilityError,
  );
});

test('an expired or tampered REST source capability fails without its URI', () => {
  let now = 1_000;
  const service = createRestSourceCapabilityService({
    secret: 'test-secret',
    now: () => now,
    ttlMs: 1,
  });
  const sourceUri =
    '/sap/bc/adt/programs/programs/zsafe/source/main/versions/1';
  const sourceCapability = service.issue({
    destination: 'dev',
    sourceUri,
  });
  now += 2;

  for (const rejectedCapability of [
    sourceCapability,
    `${sourceCapability}tampered`,
  ]) {
    assert.throws(
      () =>
        service.resolve({
          sourceCapability: rejectedCapability,
          destination: 'dev',
        }),
      (error: unknown) =>
        error instanceof RestSourceCapabilityError &&
        !error.message.includes(sourceUri),
    );
  }
});
