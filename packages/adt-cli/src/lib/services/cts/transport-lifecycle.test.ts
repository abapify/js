import { describe, expect, it, vi } from 'vitest';
import type { AdtClient } from '@abapify/adt-client';
import type { AdkTransportRequest } from '@abapify/adk';
import { CtsTransportLifecycleService } from './transport-lifecycle';

function transport(overrides: Partial<AdkTransportRequest> = {}) {
  return {
    number: 'DEVK900001',
    status: 'D',
    statusText: 'Modifiable',
    owner: 'OLDUSER',
    description: 'Lifecycle test',
    target: 'PRD',
    targetDescription: 'Production',
    tasks: [],
    objects: [],
    release: vi.fn().mockResolvedValue({ success: true }),
    releaseAll: vi.fn().mockResolvedValue({ success: true }),
    reassign: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as AdkTransportRequest;
}

describe('CtsTransportLifecycleService', () => {
  it('surfaces release failures from ADK', async () => {
    const model = transport({
      release: vi.fn().mockResolvedValue({
        success: false,
        message: 'Release report failed',
      }),
    });
    const service = new CtsTransportLifecycleService({} as AdtClient, {
      getTransport: vi.fn().mockResolvedValue(model),
    });

    await expect(service.release({ transport: 'DEVK900001' })).rejects.toThrow(
      'Release report failed',
    );
  });

  it('returns the same structured lifecycle results to delivery adapters', async () => {
    const model = transport();
    const service = new CtsTransportLifecycleService({} as AdtClient, {
      getTransport: vi.fn().mockResolvedValue(model),
    });

    await expect(
      service.release({ transport: 'DEVK900001', releaseAll: false }),
    ).resolves.toMatchObject({
      status: 'released',
      transport: 'DEVK900001',
    });
    await expect(
      service.reassign({
        transport: 'DEVK900001',
        newOwner: 'NEWUSER',
        recursive: true,
      }),
    ).resolves.toEqual({
      status: 'reassigned',
      transport: 'DEVK900001',
      previousOwner: 'OLDUSER',
      newOwner: 'NEWUSER',
      recursive: true,
    });
  });
});
