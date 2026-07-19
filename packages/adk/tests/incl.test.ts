/**
 * ADK Include Object Tests
 *
 * Unit tests for AdkInclude: object URIs, lock/unlock delegation, save
 * orchestration, source read/write, and delete — all with a mock ADT
 * client so tests don't require a running SAP system.
 *
 * Mirrors tests/cds.test.ts in structure.
 */

import { describe, it, expect, vi } from 'vitest';
import { AdkInclude } from '../src/objects/repository/incl/incl.model';
import type { AdkContext } from '../src/base/context';

// ── helpers ──────────────────────────────────────────────────────────────────

function createMockLockService() {
  return {
    lock: vi.fn().mockResolvedValue({ handle: 'LOCK_ABC123' }),
    unlock: vi.fn().mockResolvedValue(undefined),
  };
}

const DEFAULT_INCLUDE_GET = { abapInclude: {} };
const DEFAULT_INCLUDE_META = {
  abapInclude: {
    name: 'ZTEST_INCLUDE',
    type: 'PROG/I',
    description: 'Test Include',
    version: 'active',
  },
};

/**
 * Mock the client.adt.programs.includes surface — matches the CRUD contract
 * shape produced by `crud({ ... sources: ['main'] })`.
 */
function createMockIncludesContract(getResult: unknown = DEFAULT_INCLUDE_GET) {
  return {
    get: vi.fn().mockResolvedValue(getResult),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    lock: vi.fn().mockResolvedValue({ handle: 'LOCK_ABC123' }),
    unlock: vi.fn().mockResolvedValue(undefined),
    source: {
      main: {
        get: vi.fn().mockResolvedValue('REPORT zmy_incl. " test'),
        put: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
}

function createCtx(
  getResult: unknown = DEFAULT_INCLUDE_META,
  lockService?: ReturnType<typeof createMockLockService>,
  options: { getThrows?: boolean } = {},
) {
  const includes = createMockIncludesContract(getResult);
  if (options.getThrows) {
    // Simulate 404 only on the first existence check so save()'s create
    // path hits .post. Subsequent GETs (used by the recursive update
    // step) return the standard metadata so the flow completes cleanly.
    const first = vi
      .fn()
      .mockRejectedValueOnce(new Error('HTTP 404 Not Found'))
      .mockResolvedValue(getResult);
    includes.get = first as any;
  }
  const ctx = {
    client: {
      adt: {
        programs: {
          includes,
        },
        activation: {
          activate: { post: vi.fn().mockResolvedValue({}) },
        },
      },
      services: {} as any,
      fetch: vi.fn().mockResolvedValue('REPORT existing_skeleton.'),
      clearETag: vi.fn(),
    } as any,
    lockService: lockService ?? createMockLockService(),
  } as unknown as AdkContext;
  return { ctx, includes };
}

// ── AdkInclude ──────────────────────────────────────────────────────────────

describe('AdkInclude', () => {
  it('objectUri constructs lowercase URI for the include', () => {
    const { ctx } = createCtx();
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    expect(obj.objectUri).toBe('/sap/bc/adt/programs/includes/ztest_include');
  });

  it('AdkInclude.get loads metadata via includes.get', async () => {
    const { ctx, includes } = createCtx();
    const obj = await AdkInclude.get('ZTEST_INCLUDE', ctx);
    expect(includes.get).toHaveBeenCalledWith('ZTEST_INCLUDE');
    expect(obj.name).toBe('ZTEST_INCLUDE');
  });

  it('getSource calls includes.source.main.get and caches via lazy()', async () => {
    const { ctx, includes } = createCtx();
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    const src1 = await obj.getSource();
    const src2 = await obj.getSource();
    expect(src1).toBe('REPORT zmy_incl. " test');
    expect(src2).toBe(src1);
    // lazy() memoizes — the underlying contract should be hit exactly once
    expect(includes.source.main.get).toHaveBeenCalledTimes(1);
    expect(includes.source.main.get).toHaveBeenCalledWith('ZTEST_INCLUDE');
  });

  it('AdkInclude.create POSTs skeleton to includes.post (with transport)', async () => {
    const { ctx, includes } = createCtx(undefined, undefined, {
      getThrows: true,
    });
    await AdkInclude.create(
      'ZTEST_INCLUDE',
      'Test Include',
      '$TMP',
      { transport: 'DEVK900001' },
      ctx,
    );
    // save({ mode: 'create' }) invokes saveViaContract('create') which
    // delegates to includes.post with the skeleton body once the
    // existence check has returned false (we simulated 404).
    expect(includes.post).toHaveBeenCalledTimes(1);
    const [queryArg, bodyArg] = includes.post.mock.calls[0];
    expect(queryArg).toMatchObject({ corrNr: 'DEVK900001' });
    expect(bodyArg).toMatchObject({
      abapInclude: expect.objectContaining({
        name: 'ZTEST_INCLUDE',
        type: 'PROG/I',
        description: 'Test Include',
      }),
    });
  });

  it('reports a resumable post-create lock conflict without retrying POST', async () => {
    const lockService = createMockLockService();
    lockService.lock.mockRejectedValueOnce(
      new Error(
        'HTTP 500: Object R3TR PROG ZTEST_INCLUDE is already locked in request DEVK900001',
      ),
    );
    const { ctx, includes } = createCtx(undefined, lockService, {
      getThrows: true,
    });
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    (obj as unknown as { setData(data: unknown): void }).setData(
      DEFAULT_INCLUDE_META.abapInclude,
    );
    (obj as unknown as { _pendingSource: string })._pendingSource =
      'REPORT ztest_include.';

    await expect(
      obj.save({ mode: 'create', transport: 'DEVK900001' }),
    ).rejects.toMatchObject({
      name: 'AdkPostCreateLockError',
      code: 'ADT_POST_CREATE_LOCKED',
      objectUri: '/sap/bc/adt/programs/includes/ztest_include',
      transport: 'DEVK900001',
    });

    expect(includes.post).toHaveBeenCalledTimes(1);
    expect(lockService.lock).toHaveBeenCalledTimes(1);
    expect(lockService.lock).toHaveBeenCalledWith(
      '/sap/bc/adt/programs/includes/ztest_include',
      expect.objectContaining({ transport: 'DEVK900001' }),
    );
    expect(includes.source.main.put).not.toHaveBeenCalled();
  });

  it('retries only the post-create lock before writing the pending source', async () => {
    const lockService = createMockLockService();
    lockService.lock
      .mockRejectedValueOnce(
        new Error(
          'HTTP 500: Object R3TR PROG ZTEST_INCLUDE is already locked in request DEVK900001',
        ),
      )
      .mockResolvedValue({ handle: 'LOCK_AFTER_POST_CREATE' });
    const { ctx, includes } = createCtx(undefined, lockService, {
      getThrows: true,
    });
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    (obj as unknown as { setData(data: unknown): void }).setData(
      DEFAULT_INCLUDE_META.abapInclude,
    );
    (obj as unknown as { _pendingSource: string })._pendingSource =
      'REPORT ztest_include.';

    await obj.save({
      mode: 'create',
      transport: 'DEVK900001',
      postCreateLockRetry: { attempts: 2, delayMs: 0 },
    });

    expect(includes.post).toHaveBeenCalledTimes(1);
    expect(lockService.lock).toHaveBeenCalledTimes(2);
    expect((ctx.client as any).fetch).toHaveBeenCalledWith(
      '/sap/bc/adt/programs/includes/ztest_include/source/main?lockHandle=LOCK_AFTER_POST_CREATE&corrNr=DEVK900001',
      expect.objectContaining({ method: 'PUT', body: 'REPORT ztest_include.' }),
    );
    expect(lockService.unlock).toHaveBeenCalledWith(
      '/sap/bc/adt/programs/includes/ztest_include',
      { lockHandle: 'LOCK_AFTER_POST_CREATE' },
    );
  });

  it('resumes an existing post-create skeleton without issuing another POST', async () => {
    const lockService = createMockLockService();
    lockService.lock
      .mockRejectedValueOnce(
        new Error(
          'HTTP 500: Object R3TR PROG ZTEST_INCLUDE is already locked in request DEVK900001',
        ),
      )
      .mockResolvedValue({ handle: 'LOCK_AFTER_RESUME' });
    const { ctx, includes } = createCtx(undefined, lockService);
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    (obj as unknown as { setData(data: unknown): void }).setData(
      DEFAULT_INCLUDE_META.abapInclude,
    );
    (obj as unknown as { _pendingSource: string })._pendingSource =
      'REPORT ztest_include.';

    await obj.save({
      mode: 'create',
      transport: 'DEVK900001',
      postCreateLockRetry: { attempts: 2, delayMs: 0 },
    });

    expect(includes.post).not.toHaveBeenCalled();
    expect(lockService.lock).toHaveBeenCalledTimes(2);
    expect((ctx.client as any).fetch).toHaveBeenCalledWith(
      '/sap/bc/adt/programs/includes/ztest_include/source/main?lockHandle=LOCK_AFTER_RESUME&corrNr=DEVK900001',
      expect.objectContaining({ method: 'PUT', body: 'REPORT ztest_include.' }),
    );
  });

  it('retries a post-create conflict from an error-like client boundary', async () => {
    const lockService = createMockLockService();
    lockService.lock
      .mockRejectedValueOnce({
        message:
          'HTTP 500: Object R3TR PROG ZTEST_INCLUDE is already locked in request DEVK900001',
      })
      .mockResolvedValue({ handle: 'LOCK_FROM_CLIENT_BOUNDARY' });
    const { ctx } = createCtx(undefined, lockService);
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    (obj as unknown as { setData(data: unknown): void }).setData(
      DEFAULT_INCLUDE_META.abapInclude,
    );
    (obj as unknown as { _pendingSource: string })._pendingSource =
      'REPORT ztest_include.';

    await obj.save({
      mode: 'create',
      transport: 'DEVK900001',
      postCreateLockRetry: { attempts: 2, delayMs: 0 },
    });

    expect(lockService.lock).toHaveBeenCalledTimes(2);
  });

  it('retries a post-create conflict from a string-only client boundary', async () => {
    const lockService = createMockLockService();
    lockService.lock
      .mockRejectedValueOnce(
        'HTTP 500: Object R3TR PROG ZTEST_INCLUDE is already locked in request DEVK900001',
      )
      .mockResolvedValue({ handle: 'LOCK_FROM_STRING_BOUNDARY' });
    const { ctx } = createCtx(undefined, lockService);
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    (obj as unknown as { setData(data: unknown): void }).setData(
      DEFAULT_INCLUDE_META.abapInclude,
    );
    (obj as unknown as { _pendingSource: string })._pendingSource =
      'REPORT ztest_include.';

    await obj.save({
      mode: 'create',
      transport: 'DEVK900001',
      postCreateLockRetry: { attempts: 2, delayMs: 0 },
    });

    expect(lockService.lock).toHaveBeenCalledTimes(2);
  });

  it('uses the transport returned by LOCK for a source write', async () => {
    const lockService = createMockLockService();
    lockService.lock.mockResolvedValue({
      handle: 'LOCK_WITH_ROOT_TRANSPORT',
      correlationNumber: 'DEVK900000',
    });
    const { ctx } = createCtx(undefined, lockService);
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    (obj as unknown as { setData(data: unknown): void }).setData(
      DEFAULT_INCLUDE_META.abapInclude,
    );
    (obj as unknown as { _pendingSource: string })._pendingSource =
      'REPORT ztest_include.';

    await obj.save({ mode: 'update', transport: 'DEVK900001' });

    expect((ctx.client as any).fetch).toHaveBeenCalledWith(
      '/sap/bc/adt/programs/includes/ztest_include/source/main?lockHandle=LOCK_WITH_ROOT_TRANSPORT&corrNr=DEVK900000',
      expect.objectContaining({ method: 'PUT', body: 'REPORT ztest_include.' }),
    );
  });

  it('AdkInclude.create with master sets contextRef to the main program', async () => {
    const { ctx, includes } = createCtx(undefined, undefined, {
      getThrows: true,
    });
    await AdkInclude.create(
      'ZTEST_INCLUDE',
      'Test Include',
      '$TMP',
      { master: 'ZTEST_PROGRAM' },
      ctx,
    );
    expect(includes.post).toHaveBeenCalledTimes(1);
    const [, bodyArg] = includes.post.mock.calls[0];
    expect(bodyArg.abapInclude.contextRef).toMatchObject({
      name: 'ZTEST_PROGRAM',
      type: 'PROG/P',
      uri: '/sap/bc/adt/programs/programs/ztest_program',
    });
  });

  it('lock delegates to lockService with correct URI and type', async () => {
    const lockService = createMockLockService();
    const { ctx } = createCtx(undefined, lockService);
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    const handle = await obj.lock('DEVK900001');
    expect(lockService.lock).toHaveBeenCalledWith(
      '/sap/bc/adt/programs/includes/ztest_include',
      expect.objectContaining({
        objectName: 'ZTEST_INCLUDE',
        transport: 'DEVK900001',
      }),
    );
    expect(handle.handle).toBe('LOCK_ABC123');
  });

  it('lock throws when no lockService in context', async () => {
    const { ctx } = createCtx();
    (ctx as any).lockService = undefined;
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    await expect(obj.lock()).rejects.toThrow('Lock not available');
  });

  it('unlock delegates to lockService.unlock after lock was acquired', async () => {
    const lockService = createMockLockService();
    const { ctx } = createCtx(undefined, lockService);
    const obj = new AdkInclude(ctx, 'ZTEST_INCLUDE');
    await obj.lock();
    await obj.unlock();
    expect(lockService.unlock).toHaveBeenCalledWith(
      '/sap/bc/adt/programs/includes/ztest_include',
      expect.objectContaining({ lockHandle: 'LOCK_ABC123' }),
    );
  });

  it('AdkInclude.delete calls includes.delete with transport + lockHandle', async () => {
    const { ctx, includes } = createCtx();
    await AdkInclude.delete(
      'ZTEST_INCLUDE',
      { transport: 'DEVK900001', lockHandle: 'LH99' },
      ctx,
    );
    expect(includes.delete).toHaveBeenCalledWith('ZTEST_INCLUDE', {
      corrNr: 'DEVK900001',
      lockHandle: 'LH99',
    });
  });
});
