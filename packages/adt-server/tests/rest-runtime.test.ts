import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadRestRuntimeSecurity } from '../src/index.js';

test('keeps REST disabled when its mounted bearer secret is empty', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-rest-runtime-'));
  const tokenFile = path.join(directory, 'rest-token');
  await writeFile(tokenFile, '\n', 'utf8');

  try {
    const security = await loadRestRuntimeSecurity({ tokenFile });
    assert.strictEqual(security.restAuthorizer, undefined);
    assert.strictEqual(security.sourceCapabilities, undefined);
    assert.strictEqual(security.atcDocumentationCapabilities, undefined);
    assert.strictEqual(security.pageCursors, undefined);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('requires distinct mounted REST state secrets when bearer auth is enabled', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-rest-runtime-'));
  const tokenFile = path.join(directory, 'rest-token');
  const sourceSecretFile = path.join(directory, 'source-secret');
  const pageCursorSecretFile = path.join(directory, 'page-secret');
  await Promise.all([
    writeFile(tokenFile, 'local-rest-token\n', 'utf8'),
    writeFile(sourceSecretFile, 'source-state-secret\n', 'utf8'),
    writeFile(pageCursorSecretFile, 'page-state-secret\n', 'utf8'),
  ]);

  try {
    await assert.rejects(
      () => loadRestRuntimeSecurity({ tokenFile, sourceSecretFile }),
      (error: unknown) =>
        error instanceof Error &&
        error.message ===
          'REST state secret files are required when REST bearer authentication is enabled.' &&
        !error.message.includes('source-state-secret'),
    );

    const security = await loadRestRuntimeSecurity({
      tokenFile,
      sourceSecretFile,
      pageCursorSecretFile,
    });
    assert.ok(security.restAuthorizer);
    assert.ok(security.sourceCapabilities);
    assert.ok(security.atcDocumentationCapabilities);
    assert.ok(security.pageCursors);

    const sourceCapability = security.sourceCapabilities!.issue({
      destination: 'dev',
      sourceUri: '/sap/bc/adt/oo/classes/zcl_safe/source/main/versions/1',
    });
    assert.ok(!sourceCapability.includes('/sap/bc/adt/'));
    const documentationCapability =
      security.atcDocumentationCapabilities!.issue({
        destination: 'dev',
        documentationUri:
          '/sap/bc/adt/documentation/atc/documents/itemid/ABC/index/1',
      });
    assert.ok(!documentationCapability.includes('/sap/bc/adt/'));
    const first = security.pageCursors!.paginate({
      data: [{ key: 'A' }, { key: 'B' }],
      fingerprint: 'objects:dev:*:::',
      keyOf: (entry) => entry.key,
      limit: 1,
      truncated: false,
    });
    assert.ok(first.nextCursor);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
