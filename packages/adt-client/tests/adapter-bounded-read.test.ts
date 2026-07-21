import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdtResponseTooLargeError, createAdtAdapter } from '../src/adapter';

describe('AdtHttpAdapter.readTextBounded', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is available for bounded plain-text reads', () => {
    const adapter = createAdtAdapter({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
      client: '100',
    });

    expect('readTextBounded' in adapter).toBe(true);
  });

  it('exports the bounded adapter error and option types from the package API', async () => {
    const publicApi = await import('../src');

    expect('AdtResponseTooLargeError' in publicApi).toBe(true);
  });

  it('rejects a known oversized Content-Length before reading the body', async () => {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      cancel() {
        cancelled = true;
      },
    });
    const getReader = vi.spyOn(body, 'getReader');
    const fetch = vi.fn().mockResolvedValue(
      new Response(body, {
        headers: { 'content-length': '15', 'content-type': 'text/plain' },
      }),
    );
    vi.stubGlobal('fetch', fetch);

    const adapter = createAdtAdapter({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
      client: '100',
    });

    await expect(
      adapter.readTextBounded(
        { url: '/sap/bc/adt/oo/classes/zcl_example/source' },
        10,
      ),
    ).rejects.toBeInstanceOf(AdtResponseTooLargeError);

    expect(getReader).not.toHaveBeenCalled();
    expect(cancelled).toBe(true);
  });

  it('aborts a streamed response when a chunk crosses the byte limit', async () => {
    let cancelled = false;
    let requestSignal: AbortSignal | undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('1234'));
        controller.enqueue(new TextEncoder().encode('5678'));
      },
      cancel() {
        cancelled = true;
      },
    });
    const fetch = vi.fn().mockImplementation((_input, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      return Promise.resolve(
        new Response(body, { headers: { 'content-type': 'text/plain' } }),
      );
    });
    vi.stubGlobal('fetch', fetch);

    const adapter = createAdtAdapter({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
      client: '100',
    });

    await expect(
      adapter.readTextBounded(
        { url: '/sap/bc/adt/oo/classes/zcl_example/source' },
        6,
      ),
    ).rejects.toMatchObject({
      code: 'ADT_RESPONSE_TOO_LARGE',
      maxBytes: 6,
      receivedBytes: 8,
    });

    expect(requestSignal?.aborted).toBe(true);
    expect(cancelled).toBe(true);
  });
});
