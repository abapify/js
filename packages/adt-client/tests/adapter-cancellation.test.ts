import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAdtAdapter } from '../src/adapter';
import { runWithAdtAbortSignal } from '../src/cancellation';

function waitForFetch(fetch: ReturnType<typeof vi.fn>, calls: number) {
  return vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(calls));
}

describe('ADT execution-scoped cancellation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes the execution abort signal to the SAP request and response body', async () => {
    let requestSignal: AbortSignal | undefined;
    let bodyController: ReadableStreamDefaultController<Uint8Array> | undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        bodyController = controller;
      },
    });
    const fetch = vi.fn().mockImplementation((_input, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      requestSignal?.addEventListener('abort', () => {
        bodyController?.error(requestSignal?.reason);
      });
      return Promise.resolve(
        new Response(body, { headers: { 'content-type': 'text/plain' } }),
      );
    });
    vi.stubGlobal('fetch', fetch);
    const adapter = createAdtAdapter({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
    });
    const abortController = new AbortController();

    const request = runWithAdtAbortSignal(abortController.signal, () =>
      adapter.request({
        method: 'GET',
        url: '/sap/bc/adt/repository/informationsystem/search',
      }),
    );
    await waitForFetch(fetch, 1);
    abortController.abort(new Error('execution deadline exceeded'));

    await expect(request).rejects.toThrow('execution deadline exceeded');
    expect(requestSignal).toBe(abortController.signal);
  });

  it('aborts CSRF initialization without dispatching later session or write requests', async () => {
    let requestSignal: AbortSignal | undefined;
    const fetch = vi.fn().mockImplementation((_input, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener(
          'abort',
          () => reject(requestSignal?.reason),
          { once: true },
        );
      });
    });
    vi.stubGlobal('fetch', fetch);
    const adapter = createAdtAdapter({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
    });
    const abortController = new AbortController();

    const request = runWithAdtAbortSignal(abortController.signal, () =>
      adapter.request({
        method: 'POST',
        url: '/sap/bc/adt/atc/runs',
        body: '<run />',
      }),
    );
    await waitForFetch(fetch, 1);
    abortController.abort(new Error('execution deadline exceeded'));

    await expect(request).rejects.toThrow('execution deadline exceeded');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(requestSignal).toBe(abortController.signal);
  });

  it('isolates concurrent execution signals', async () => {
    const observed = new Map<
      string,
      {
        signal: AbortSignal;
        resolve: (response: Response) => void;
        reject: (error: unknown) => void;
      }
    >();
    const fetch = vi.fn().mockImplementation((input, init?: RequestInit) => {
      const signal = init?.signal;
      if (!signal) throw new Error('missing request signal');
      const url = String(input);
      return new Promise<Response>((resolve, reject) => {
        observed.set(url, { signal, resolve, reject });
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        });
      });
    });
    vi.stubGlobal('fetch', fetch);
    const adapter = createAdtAdapter({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
    });
    const firstController = new AbortController();
    const secondController = new AbortController();

    const first = runWithAdtAbortSignal(firstController.signal, () =>
      adapter.request<string>({ method: 'GET', url: '/first' }),
    );
    const second = runWithAdtAbortSignal(secondController.signal, () =>
      adapter.request<string>({ method: 'GET', url: '/second' }),
    );
    await waitForFetch(fetch, 2);
    firstController.abort(new Error('first deadline exceeded'));

    const firstRequest = observed.get('https://sap.example.test/first');
    const secondRequest = observed.get('https://sap.example.test/second');
    expect(firstRequest?.signal.aborted).toBe(true);
    expect(secondRequest?.signal.aborted).toBe(false);
    secondRequest?.resolve(
      new Response('second result', {
        headers: { 'content-type': 'text/plain' },
      }),
    );

    await expect(first).rejects.toThrow('first deadline exceeded');
    await expect(second).resolves.toBe('second result');
  });
});
