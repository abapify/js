import { describe, it, expect, vi } from 'vitest';
import {
  LazyContent,
  isLazyContent,
  isImmediateContent,
  resolveContent,
  createLazyLoader,
  createCachedLazyLoader,
  resolveContentBatch,
} from './lazy-content';

describe('LazyContent', () => {
  describe('Type Guards', () => {
    it('should identify lazy content (function)', () => {
      const lazy: LazyContent = async () => 'content';
      expect(isLazyContent(lazy)).toBe(true);
      expect(isImmediateContent(lazy)).toBe(false);
    });

    it('should identify immediate content (string)', () => {
      const immediate: LazyContent = 'content';
      expect(isLazyContent(immediate)).toBe(false);
      expect(isImmediateContent(immediate)).toBe(true);
    });
  });

  describe('resolveContent', () => {
    it('should resolve immediate content', async () => {
      const content: LazyContent = 'immediate content';
      const resolved = await resolveContent(content);
      expect(resolved).toBe('immediate content');
    });

    it('should resolve lazy content', async () => {
      const content: LazyContent = async () => 'lazy content';
      const resolved = await resolveContent(content);
      expect(resolved).toBe('lazy content');
    });

    it('should handle async operations in lazy content', async () => {
      const fetchMock = vi.fn().mockResolvedValue('fetched content');
      const content: LazyContent = async () => await fetchMock();

      const resolved = await resolveContent(content);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(resolved).toBe('fetched content');
    });
  });

  describe('createLazyLoader', () => {
    it('should create a lazy loader', async () => {
      const fetchFn = vi.fn().mockResolvedValue('content');
      const loader = createLazyLoader(fetchFn);

      expect(isLazyContent(loader)).toBe(true);

      const resolved = await resolveContent(loader);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(resolved).toBe('content');
    });

    it('should call fetch function each time', async () => {
      const fetchFn = vi.fn().mockResolvedValue('content');
      const loader = createLazyLoader(fetchFn);

      await resolveContent(loader);
      await resolveContent(loader);

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('createCachedLazyLoader', () => {
    it('should cache the result', async () => {
      const fetchFn = vi.fn().mockResolvedValue('cached content');
      const loader = createCachedLazyLoader(fetchFn);

      const result1 = await resolveContent(loader);
      const result2 = await resolveContent(loader);
      const result3 = await resolveContent(loader);

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(result1).toBe('cached content');
      expect(result2).toBe('cached content');
      expect(result3).toBe('cached content');
    });

    it('should handle concurrent calls', async () => {
      let callCount = 0;
      const fetchFn = vi.fn().mockImplementation(async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return `content-${callCount}`;
      });

      const loader = createCachedLazyLoader(fetchFn);

      // Start multiple concurrent resolutions
      const promises = [
        resolveContent(loader),
        resolveContent(loader),
        resolveContent(loader),
      ];

      const results = await Promise.all(promises);

      // Should only fetch once
      expect(fetchFn).toHaveBeenCalledTimes(1);
      // All should get the same result
      expect(results).toEqual(['content-1', 'content-1', 'content-1']);
    });

    it('should handle errors', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      const loader = createCachedLazyLoader(fetchFn);

      await expect(resolveContent(loader)).rejects.toThrow('Fetch failed');

      // Should try again on next call (error not cached)
      await expect(resolveContent(loader)).rejects.toThrow('Fetch failed');
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('resolveContentBatch', () => {
    it('should resolve multiple contents in parallel', async () => {
      const contents: LazyContent[] = [
        'immediate 1',
        async () => 'lazy 1',
        'immediate 2',
        async () => 'lazy 2',
      ];

      const resolved = await resolveContentBatch(contents);

      expect(resolved).toEqual([
        'immediate 1',
        'lazy 1',
        'immediate 2',
        'lazy 2',
      ]);
    });

    it('should handle empty array', async () => {
      const resolved = await resolveContentBatch([]);
      expect(resolved).toEqual([]);
    });

    it('should handle all immediate content', async () => {
      const contents: LazyContent[] = ['a', 'b', 'c'];
      const resolved = await resolveContentBatch(contents);
      expect(resolved).toEqual(['a', 'b', 'c']);
    });

    it('should handle all lazy content', async () => {
      const contents: LazyContent[] = [
        async () => 'a',
        async () => 'b',
        async () => 'c',
      ];
      const resolved = await resolveContentBatch(contents);
      expect(resolved).toEqual(['a', 'b', 'c']);
    });

    it('should resolve in parallel (performance)', async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const contents: LazyContent[] = [
        async () => {
          await delay(50);
          return 'a';
        },
        async () => {
          await delay(50);
          return 'b';
        },
        async () => {
          await delay(50);
          return 'c';
        },
      ];

      const start = Date.now();
      await resolveContentBatch(contents);
      const duration = Date.now() - start;

      // Should take ~50ms (parallel), not ~150ms (sequential)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Real-world scenarios', () => {
    it('should support class includes with lazy loading', async () => {
      // Simulate ADT client
      const adtClient = {
        request: vi
          .fn()
          .mockResolvedValueOnce('CLASS lcl_test DEFINITION...')
          .mockResolvedValueOnce('CLASS lcl_test IMPLEMENTATION...'),
      };

      // Create class includes with lazy content
      const includes = [
        {
          includeType: 'definitions',
          sourceUri: '/sap/bc/adt/oo/classes/zcl_test/source/definitions',
          content: createCachedLazyLoader(() =>
            adtClient.request(
              '/sap/bc/adt/oo/classes/zcl_test/source/definitions'
            )
          ),
        },
        {
          includeType: 'implementations',
          sourceUri: '/sap/bc/adt/oo/classes/zcl_test/source/implementations',
          content: createCachedLazyLoader(() =>
            adtClient.request(
              '/sap/bc/adt/oo/classes/zcl_test/source/implementations'
            )
          ),
        },
      ];

      // Resolve all includes
      const contents = await resolveContentBatch(
        includes.map((inc) => inc.content!)
      );

      expect(contents).toHaveLength(2);
      expect(contents[0]).toContain('DEFINITION');
      expect(contents[1]).toContain('IMPLEMENTATION');
      expect(adtClient.request).toHaveBeenCalledTimes(2);
    });

    it('should support mixed immediate and lazy content', async () => {
      const classIncludes = [
        {
          includeType: 'main',
          content: 'CLASS zcl_test DEFINITION PUBLIC...', // Immediate
        },
        {
          includeType: 'definitions',
          content: async () => 'CLASS lcl_local DEFINITION...', // Lazy
        },
        {
          includeType: 'testclasses',
          content: async () => 'CLASS ltcl_test DEFINITION...', // Lazy
        },
      ];

      const contents = await resolveContentBatch(
        classIncludes.map((inc) => inc.content!)
      );

      expect(contents).toHaveLength(3);
      expect(contents[0]).toContain('zcl_test');
      expect(contents[1]).toContain('lcl_local');
      expect(contents[2]).toContain('ltcl_test');
    });
  });
});
