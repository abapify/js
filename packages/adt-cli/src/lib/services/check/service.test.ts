import type { AdtClient } from '@abapify/adt-client';
import { describe, expect, it, vi } from 'vitest';
import { CheckService } from './service';

function createClient(response: unknown): {
  client: AdtClient;
  post: ReturnType<typeof vi.fn>;
} {
  const post = vi.fn(async () => response);
  return {
    client: {
      adt: { checkruns: { checkObjects: { post } } },
    } as unknown as AdtClient,
    post,
  };
}

describe('CheckService', () => {
  it('checks inactive source by default', async () => {
    const { client, post } = createClient({
      checkRunReports: { checkReport: [] },
    });

    await new CheckService(client).run({
      objects: [{ uri: '/sap/bc/adt/oo/classes/zcl_test' }],
    });

    expect(post).toHaveBeenCalledWith({
      checkObjectList: {
        checkObject: [
          {
            uri: '/sap/bc/adt/oo/classes/zcl_test',
            version: 'inactive',
          },
        ],
      },
    });
  });

  it('reports SAP error messages as errors', async () => {
    const { client } = createClient({
      checkRunReports: {
        checkReport: [
          {
            triggeringUri: '/sap/bc/adt/oo/classes/zcl_test',
            checkMessageList: {
              checkMessage: [
                { type: 'E', shortText: 'Method implementation is missing' },
              ],
            },
          },
        ],
      },
    });

    const result = await new CheckService(client).run({
      objects: [{ uri: '/sap/bc/adt/oo/classes/zcl_test' }],
      sourceVersion: 'active',
    });

    expect(result.hasErrors).toBe(true);
    expect(result.hasWarnings).toBe(false);
    expect(result.reports[0]?.checkMessageList?.checkMessage).toEqual([
      { type: 'E', shortText: 'Method implementation is missing' },
    ]);
  });
});
