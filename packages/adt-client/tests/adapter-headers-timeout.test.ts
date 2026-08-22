import { afterEach, describe, expect, it, vi } from 'vitest';

const agentConstructions = vi.hoisted(
  () => [] as Array<Record<string, unknown>>,
);

vi.mock('undici', () => ({
  Agent: class {
    constructor(options: Record<string, unknown>) {
      agentConstructions.push(options);
    }
  },
}));

import { createAdtAdapter, type AdtAdapterConfig } from '../src/adapter';

describe('ADT response header timeout', () => {
  afterEach(() => {
    agentConstructions.length = 0;
    vi.unstubAllGlobals();
  });

  it('uses the configured timeout for long-running SAP requests', async () => {
    const fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response('<result />', {
          headers: { 'content-type': 'application/xml' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetch);
    const config = {
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
      headersTimeoutMs: 900_000,
    } as AdtAdapterConfig & { headersTimeoutMs: number };
    const adapter = createAdtAdapter(config);

    await adapter.request({
      method: 'GET',
      url: '/sap/bc/adt/abapunit/testruns',
    });

    expect(agentConstructions).toEqual([{ headersTimeout: 900_000 }]);
    expect(fetch.mock.calls[0]?.[1]).toMatchObject({
      dispatcher: expect.anything(),
    });
  });

  it('rejects absolute URLs that target a different origin', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const adapter = createAdtAdapter({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
    } as AdtAdapterConfig);

    await expect(
      adapter.request({
        method: 'GET',
        url: 'https://evil.example.test/sap/bc/adt/abapunit/testruns',
      }),
    ).rejects.toThrow(/ADT requests must target the configured base origin/);
    expect(fetch).not.toHaveBeenCalled();
  });
});
