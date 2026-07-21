/**
 * Verifies that the HTTP MCP transport can be composed under a listener that
 * is owned by the embedding application.
 */
import { after, describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createHttpMcpHandler } from '../src/lib/http/server.js';
import { createSessionRegistry } from '../src/lib/session/registry.js';

describe('createHttpMcpHandler', () => {
  const listeners: http.Server[] = [];

  after(async () => {
    await Promise.all(
      listeners.map(async (listener) => {
        if (!listener.listening) return;
        await new Promise<void>((resolve, reject) => {
          listener.close((error) => (error ? reject(error) : resolve()));
        });
      }),
    );
  });

  it('handles requests on an embedding-owned listener after close', async () => {
    const handler = createHttpMcpHandler({
      host: '127.0.0.1',
      registry: createSessionRegistry({ ttlMs: 0 }),
      multiSystem: { systems: {}, resolve: () => undefined },
      log: () => undefined,
    });
    const listener = http.createServer((req, res) => {
      void handler.handle(req, res);
    });
    listeners.push(listener);
    await new Promise<void>((resolve, reject) => {
      listener.listen(0, '127.0.0.1', () => resolve());
      listener.once('error', reject);
    });
    const port = (listener.address() as { port: number }).port;

    const beforeClose = await fetch(`http://127.0.0.1:${port}/healthz`);
    assert.strictEqual(beforeClose.status, 200);

    await handler.close();

    assert.strictEqual(listener.listening, true);
    const afterClose = await fetch(`http://127.0.0.1:${port}/healthz`);
    assert.strictEqual(afterClose.status, 200);
  });
});
