/**
 * Lazy Content Loading Support
 *
 * Enables deferred loading of content (e.g., class segments, source code)
 * to optimize memory usage and performance.
 */

/**
 * Content that can be loaded immediately or on-demand
 *
 * @example
 * // Immediate content
 * const immediate: LazyContent = 'CLASS zcl_test DEFINITION...';
 *
 * // Lazy content
 * const lazy: LazyContent = async () => {
 *   return await fetchFromSap('/sap/bc/adt/oo/classes/zcl_test/source/main');
 * };
 */
export type LazyContent = string | (() => Promise<string>);

/**
 * Check if content is lazy (function) or immediate (string)
 */
export function isLazyContent(
  content: LazyContent
): content is () => Promise<string> {
  return typeof content === 'function';
}

/**
 * Check if content is immediate (string)
 */
export function isImmediateContent(content: LazyContent): content is string {
  return typeof content === 'string';
}

/**
 * Resolve lazy content to actual string
 *
 * @param content - Lazy or immediate content
 * @returns Resolved content string
 *
 * @example
 * const content = await resolveContent(lazyOrImmediate);
 */
export async function resolveContent(content: LazyContent): Promise<string> {
  if (isLazyContent(content)) {
    return await content();
  }
  return content;
}

/**
 * Create a lazy content loader from a fetch function
 *
 * @param fetchFn - Function to fetch content
 * @returns Lazy content function
 *
 * @example
 * const lazyContent = createLazyLoader(async () => {
 *   return await adtClient.request('/sap/bc/adt/oo/classes/zcl_test/source/main');
 * });
 */
export function createLazyLoader(fetchFn: () => Promise<string>): LazyContent {
  return fetchFn;
}

/**
 * Create a lazy content loader with caching
 * Content is fetched only once and cached for subsequent calls
 *
 * @param fetchFn - Function to fetch content
 * @returns Cached lazy content function
 *
 * @example
 * const cachedLazy = createCachedLazyLoader(async () => {
 *   return await expensiveFetch();
 * });
 *
 * // First call fetches
 * const content1 = await resolveContent(cachedLazy);
 * // Second call uses cache
 * const content2 = await resolveContent(cachedLazy);
 */
export function createCachedLazyLoader(
  fetchFn: () => Promise<string>
): LazyContent {
  let cache: string | null = null;
  let fetching: Promise<string> | null = null;

  return async () => {
    // Return cached value if available
    if (cache !== null) {
      return cache;
    }

    // If already fetching, wait for that promise
    if (fetching !== null) {
      return await fetching;
    }

    // Start fetching
    fetching = fetchFn();

    try {
      cache = await fetching;
      return cache;
    } finally {
      fetching = null;
    }
  };
}

/**
 * Batch resolve multiple lazy contents in parallel
 *
 * @param contents - Array of lazy or immediate contents
 * @returns Array of resolved content strings
 *
 * @example
 * const resolved = await resolveContentBatch([
 *   'immediate content',
 *   async () => await fetch1(),
 *   async () => await fetch2()
 * ]);
 */
export async function resolveContentBatch(
  contents: LazyContent[]
): Promise<string[]> {
  return Promise.all(contents.map((content) => resolveContent(content)));
}
