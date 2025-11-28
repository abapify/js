import { describe, it, expect, vi } from 'vitest';
import {
  type LazyContent,
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
      const immediate: LazyContent = 'immediate content';
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

    it('should handle async lazy content', async () => {
      const content: LazyContent = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'async lazy content';
      };
      const resolved = await resolveContent(content);
      expect(resolved).toBe('async lazy content');
    });
  });

  describe('createLazyLoader', () => {
    it('should create a lazy loader', async () => {
      const fetchFn = vi.fn(async () => 'fetched content');
      const lazy = createLazyLoader(fetchFn);

      expect(isLazyContent(lazy)).toBe(true);

      const resolved = await resolveContent(lazy);
      expect(resolved).toBe('fetched content');
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should call fetch function each time (no caching)', async () => {
      const fetchFn = vi.fn(async () => 'fetched content');
      const lazy = createLazyLoader(fetchFn);

      await resolveContent(lazy);
      await resolveContent(lazy);

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('createCachedLazyLoader', () => {
    it('should create a cached lazy loader', async () => {
      const fetchFn = vi.fn(async () => 'cached content');
      const lazy = createCachedLazyLoader(fetchFn);

      expect(isLazyContent(lazy)).toBe(true);

      const resolved = await resolveContent(lazy);
      expect(resolved).toBe('cached content');
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should cache content and not refetch', async () => {
      const fetchFn = vi.fn(async () => 'cached content');
      const lazy = createCachedLazyLoader(fetchFn);

      const resolved1 = await resolveContent(lazy);
      const resolved2 = await resolveContent(lazy);
      const resolved3 = await resolveContent(lazy);

      expect(resolved1).toBe('cached content');
      expect(resolved2).toBe('cached content');
      expect(resolved3).toBe('cached content');
      expect(fetchFn).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should handle concurrent calls without duplicate fetches', async () => {
      let fetchCount = 0;
      const fetchFn = vi.fn(async () => {
        fetchCount++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return `fetch ${fetchCount}`;
      });

      const lazy = createCachedLazyLoader(fetchFn);

      // Start multiple concurrent resolutions
      const [resolved1, resolved2, resolved3] = await Promise.all([
        resolveContent(lazy),
        resolveContent(lazy),
        resolveContent(lazy),
      ]);

      // All should get the same content
      expect(resolved1).toBe('fetch 1');
      expect(resolved2).toBe('fetch 1');
      expect(resolved3).toBe('fetch 1');

      // Fetch should only be called once
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
      const fetchFn = vi.fn(async () => {
        throw new Error('Fetch failed');
      });

      const lazy = createCachedLazyLoader(fetchFn);

      await expect(resolveContent(lazy)).rejects.toThrow('Fetch failed');
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Should retry on next call (error not cached)
      await expect(resolveContent(lazy)).rejects.toThrow('Fetch failed');
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('resolveContentBatch', () => {
    it('should resolve batch of immediate content', async () => {
      const contents: LazyContent[] = ['content1', 'content2', 'content3'];
      const resolved = await resolveContentBatch(contents);

      expect(resolved).toEqual(['content1', 'content2', 'content3']);
    });

    it('should resolve batch of lazy content', async () => {
      const contents: LazyContent[] = [
        async () => 'lazy1',
        async () => 'lazy2',
        async () => 'lazy3',
      ];
      const resolved = await resolveContentBatch(contents);

      expect(resolved).toEqual(['lazy1', 'lazy2', 'lazy3']);
    });

    it('should resolve mixed immediate and lazy content', async () => {
      const contents: LazyContent[] = [
        'immediate1',
        async () => 'lazy1',
        'immediate2',
        async () => 'lazy2',
      ];
      const resolved = await resolveContentBatch(contents);

      expect(resolved).toEqual([
        'immediate1',
        'lazy1',
        'immediate2',
        'lazy2',
      ]);
    });

    it('should resolve batch in parallel', async () => {
      const startTime = Date.now();

      const contents: LazyContent[] = [
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return 'lazy1';
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return 'lazy2';
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return 'lazy3';
        },
      ];

      const resolved = await resolveContentBatch(contents);
      const duration = Date.now() - startTime;

      expect(resolved).toEqual(['lazy1', 'lazy2', 'lazy3']);
      // Should take ~50ms (parallel) not ~150ms (sequential)
      expect(duration).toBeLessThan(100);
    });

    it('should handle empty batch', async () => {
      const resolved = await resolveContentBatch([]);
      expect(resolved).toEqual([]);
    });
  });

  describe('Real-world Usage', () => {
    it('should support class include lazy loading pattern', async () => {
      // Simulate ADT client
      const mockAdtClient = {
        request: vi.fn(async (uri: string) => {
          if (uri.includes('locals_def')) {
            return 'CLASS lcl_test DEFINITION...';
          }
          if (uri.includes('locals_imp')) {
            return 'CLASS lcl_test IMPLEMENTATION...';
          }
          return 'MAIN CLASS CONTENT...';
        }),
      };

      // Simulate class include with lazy content
      const classInclude = {
        includeType: 'locals_def',
        sourceUri: '/sap/bc/adt/oo/classes/zcl_test/includes/locals_def',
        content: createCachedLazyLoader(async () => {
          return await mockAdtClient.request(
            '/sap/bc/adt/oo/classes/zcl_test/includes/locals_def'
          );
        }),
      };

      // Resolve content when needed
      const content = await resolveContent(classInclude.content);
      expect(content).toBe('CLASS lcl_test DEFINITION...');
      expect(mockAdtClient.request).toHaveBeenCalledTimes(1);

      // Subsequent access uses cache
      const content2 = await resolveContent(classInclude.content);
      expect(content2).toBe('CLASS lcl_test DEFINITION...');
      expect(mockAdtClient.request).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should support batch loading of all class includes', async () => {
      const mockAdtClient = {
        request: vi.fn(async (uri: string) => {
          if (uri.includes('locals_def')) return 'LOCALS_DEF CONTENT';
          if (uri.includes('locals_imp')) return 'LOCALS_IMP CONTENT';
          if (uri.includes('testclasses')) return 'TESTCLASSES CONTENT';
          return 'MAIN CONTENT';
        }),
      };

      const includes = [
        {
          includeType: 'locals_def',
          content: createLazyLoader(() =>
            mockAdtClient.request('/includes/locals_def')
          ),
        },
        {
          includeType: 'locals_imp',
          content: createLazyLoader(() =>
            mockAdtClient.request('/includes/locals_imp')
          ),
        },
        {
          includeType: 'testclasses',
          content: createLazyLoader(() =>
            mockAdtClient.request('/includes/testclasses')
          ),
        },
      ];

      // Load all includes in parallel
      const contents = await resolveContentBatch(
        includes.map((inc) => inc.content).filter((c): c is LazyContent => c !== undefined)
      );

      expect(contents).toEqual([
        'LOCALS_DEF CONTENT',
        'LOCALS_IMP CONTENT',
        'TESTCLASSES CONTENT',
      ]);
      expect(mockAdtClient.request).toHaveBeenCalledTimes(3);
    });
  });
});
