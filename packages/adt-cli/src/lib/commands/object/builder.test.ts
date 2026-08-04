import { describe, expect, it, vi } from 'vitest';
import {
  createWithReadbackRecovery,
  persistSourceWithReleasedLock,
  resolveEffectiveTransport,
} from './builder';

describe('resolveEffectiveTransport', () => {
  it('uses the authoritative correlation number returned by SAP LOCK', () => {
    expect(
      resolveEffectiveTransport(
        { handle: 'lock-1', correlationNumber: 'DEVK900001' },
        'DEVK900002',
      ),
    ).toBe('DEVK900001');
  });

  it('falls back to the caller transport when LOCK omits correlation data', () => {
    expect(resolveEffectiveTransport({ handle: 'lock-1' }, 'DEVK900002')).toBe(
      'DEVK900002',
    );
  });
});

describe('persistSourceWithReleasedLock', () => {
  it('unlocks before activating the saved source', async () => {
    const calls: string[] = [];
    const object = {
      saveMainSource: vi.fn(async () => {
        calls.push('save');
      }),
      unlock: vi.fn(async () => {
        calls.push('unlock');
      }),
      activate: vi.fn(async () => {
        calls.push('activate');
      }),
    };

    await persistSourceWithReleasedLock(object, 'CLASS source', {
      lockHandle: { handle: 'lock-1', correlationNumber: 'DEVK900001' },
      requestedTransport: 'DEVK900002',
      activate: true,
    });

    expect(calls).toEqual(['save', 'unlock', 'activate']);
    expect(object.saveMainSource).toHaveBeenCalledWith('CLASS source', {
      lockHandle: 'lock-1',
      transport: 'DEVK900001',
    });
  });

  it('always unlocks and never activates after a failed save', async () => {
    const calls: string[] = [];
    const object = {
      saveMainSource: vi.fn(async () => {
        calls.push('save');
        throw new Error('write failed');
      }),
      unlock: vi.fn(async () => {
        calls.push('unlock');
      }),
      activate: vi.fn(async () => {
        calls.push('activate');
      }),
    };

    await expect(
      persistSourceWithReleasedLock(object, 'CLASS source', {
        lockHandle: { handle: 'lock-1' },
        requestedTransport: 'DEVK900002',
        activate: true,
      }),
    ).rejects.toThrow('write failed');

    expect(calls).toEqual(['save', 'unlock']);
  });

  it('preserves both the save and unlock failures', async () => {
    const saveError = new Error('write failed');
    const unlockError = new Error('unlock failed');
    const object = {
      saveMainSource: vi.fn(async () => {
        throw saveError;
      }),
      unlock: vi.fn(async () => {
        throw unlockError;
      }),
      activate: vi.fn(),
    };

    const failure = await persistSourceWithReleasedLock(object, 'source', {
      lockHandle: { handle: 'lock-1' },
      requestedTransport: 'DEVK900002',
      activate: true,
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(AggregateError);
    expect((failure as AggregateError).errors).toEqual([
      saveError,
      unlockError,
    ]);
    expect(object.activate).not.toHaveBeenCalled();
  });
});

describe('createWithReadbackRecovery', () => {
  it('recovers an object confirmed after an ambiguous server failure', async () => {
    const recovered = {
      name: 'ZCL_NEW',
      description: 'New class',
      package: 'ZPACKAGE',
    };
    const definition = {
      create: vi.fn(async () => {
        throw Object.assign(new Error('HTTP 500: Internal Server Error'), {
          status: 500,
        });
      }),
      get: vi.fn(async () => recovered),
    };

    await expect(
      createWithReadbackRecovery(
        definition,
        'ZCL_NEW',
        'New class',
        'ZPACKAGE',
        'DEVK900001',
      ),
    ).resolves.toEqual({ object: recovered, recovered: true });
  });

  it('does not mask a client failure or mismatching read-back', async () => {
    const clientError = Object.assign(new Error('HTTP 403: Forbidden'), {
      status: 403,
    });
    const clientFailure = {
      create: vi.fn(async () => {
        throw clientError;
      }),
      get: vi.fn(),
    };

    await expect(
      createWithReadbackRecovery(
        clientFailure,
        'ZCL_NEW',
        'New class',
        'ZPACKAGE',
      ),
    ).rejects.toBe(clientError);
    expect(clientFailure.get).not.toHaveBeenCalled();

    const serverError = Object.assign(
      new Error('HTTP 500: Internal Server Error'),
      { status: 500 },
    );
    const mismatch = {
      create: vi.fn(async () => {
        throw serverError;
      }),
      get: vi.fn(async () => ({
        name: 'ZCL_NEW',
        description: 'Someone else',
        package: 'ZPACKAGE',
      })),
    };

    await expect(
      createWithReadbackRecovery(mismatch, 'ZCL_NEW', 'New class', 'ZPACKAGE'),
    ).rejects.toBe(serverError);
  });

  it('does not recover an object from a different package', async () => {
    const serverError = Object.assign(
      new Error('HTTP 500: Internal Server Error'),
      { status: 500 },
    );
    const definition = {
      create: vi.fn(async () => {
        throw serverError;
      }),
      get: vi.fn(async () => ({
        name: 'ZCL_NEW',
        description: 'New class',
        package: 'ZOTHER',
      })),
    };

    await expect(
      createWithReadbackRecovery(
        definition,
        'ZCL_NEW',
        'New class',
        'ZPACKAGE',
      ),
    ).rejects.toBe(serverError);
  });
});
