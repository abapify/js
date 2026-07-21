import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadOptionalRestBearerAuthorizer } from '../src/rest-auth.js';

test('loads a REST bearer authorizer only from a non-empty mounted secret', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-rest-auth-'));
  const emptyTokenFile = path.join(directory, 'empty-token');
  const tokenFile = path.join(directory, 'rest-token');
  await writeFile(emptyTokenFile, '\n', 'utf8');
  await writeFile(tokenFile, 'local-rest-token\n', 'utf8');

  try {
    assert.strictEqual(
      await loadOptionalRestBearerAuthorizer(emptyTokenFile),
      undefined,
    );
    assert.ok(await loadOptionalRestBearerAuthorizer(tokenFile));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
