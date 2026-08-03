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
    addTask: vi.fn().mockResolvedValue({
      number: 'DEVK900004',
      owner: 'NEWUSER',
      status: 'D',
    }),
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
    model.reassign = vi.fn().mockImplementation(async (newOwner: string) => {
      (model as unknown as { owner: string }).owner = newOwner;
    });
    const getTransport = vi.fn().mockResolvedValue(model);
    const service = new CtsTransportLifecycleService({} as AdtClient, {
      getTransport,
    });

    await expect(
      service.createTask({
        transport: 'devk900001',
        owner: 'newuser',
      }),
    ).resolves.toEqual({
      status: 'created',
      transport: 'DEVK900001',
      task: 'DEVK900004',
      owner: 'NEWUSER',
    });
    expect(model.addTask).toHaveBeenCalledWith('NEWUSER');
    await expect(
      service.release({ transport: 'DEVK900001', releaseAll: false }),
    ).resolves.toMatchObject({
      status: 'released',
      transport: 'DEVK900001',
    });
    await expect(
      service.reassign({
        transport: ' devk900001 ',
        newOwner: ' newuser ',
        recursive: true,
      }),
    ).resolves.toEqual({
      status: 'reassigned',
      transport: 'DEVK900001',
      previousOwner: 'OLDUSER',
      newOwner: 'NEWUSER',
      recursive: true,
    });
    expect(getTransport).toHaveBeenLastCalledWith(
      'DEVK900001',
      expect.anything(),
    );
    expect(model.reassign).toHaveBeenCalledWith('NEWUSER', true);
  });

  it('rejects empty reassignment identity', async () => {
    const service = new CtsTransportLifecycleService({} as AdtClient, {
      getTransport: vi.fn(),
    });

    await expect(
      service.reassign({ transport: ' ', newOwner: 'NEWUSER' }),
    ).rejects.toThrow('Transport and new owner are required');
    await expect(
      service.reassign({ transport: 'DEVK900001', newOwner: ' ' }),
    ).rejects.toThrow('Transport and new owner are required');
  });
});
