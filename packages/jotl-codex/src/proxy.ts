/**
 * JOTL - Schema Proxy
 * Creates a proxy that records property access as $ref paths
 */

import type { SchemaProxy, ProxyMetadata, ArrayMapper, SchemaNode } from './types.js';

const PROXY_METADATA = Symbol('proxy_metadata');

/**
 * Creates a schema proxy that records property access as $ref paths
 *
 * @example
 * const src = makeSchemaProxy<Invoice>("invoice");
 * const schema = {
 *   totalAmount: src.total,
 *   items: src.lines(item => ({ id: item.id, qty: item.qty }))
 * };
 *
 * @param root - Root reference name (e.g., "invoice", "user")
 * @param path - Initial path (for internal recursion)
 */
export function makeSchemaProxy<T>(root: string, path: string[] = []): SchemaProxy<T> {
  const metadata: ProxyMetadata = {
    root,
    path: [...path],
  };

  const handler: ProxyHandler<any> = {
    get(target, prop: string | symbol) {
      // Avoid intercepting internal properties
      if (prop === PROXY_METADATA) {
        return metadata;
      }

      if (typeof prop === 'symbol') {
        // Special handling for Symbol.toPrimitive - convert to schema node
        if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag) {
          return undefined;
        }
        return undefined;
      }

      // Special handling for common methods that should return schema node
      if (prop === 'toJSON') {
        return () => ({ $ref: buildRefPath(metadata) });
      }

      // Build new path with this property
      const newPath = [...metadata.path, prop];

      // Return a new proxy with extended path
      return makeSchemaProxy<any>(root, newPath);
    },

    apply(target, thisArg, args: any[]) {
      // Function call on a proxy indicates array mapping
      // e.g., src.items(item => ({ id: item.id }))
      const mapper = args[0] as ArrayMapper<any, any>;

      if (typeof mapper !== 'function') {
        throw new Error('Array mapper must be a function');
      }

      // Create a proxy for the array item
      const itemProxy = makeSchemaProxy<any>(`${metadata.root}.${metadata.path.join('.')}.item`, []);

      // Create a proxy for the index
      const indexProxy = makeSchemaProxy<number>(`${metadata.root}.${metadata.path.join('.')}.index`, []);

      // Execute the mapper to get the schema
      const itemSchema = mapper(itemProxy, indexProxy);

      // Return a schema node with array mapping directive
      return {
        $ref: buildRefPath(metadata),
        $schema: itemSchema,
      };
    },
  };

  // Create a callable proxy (for array mapping)
  const target = function () {};
  return new Proxy(target, handler) as SchemaProxy<T>;
}

/**
 * Builds a $ref path from metadata
 */
function buildRefPath(metadata: ProxyMetadata): string {
  if (metadata.path.length === 0) {
    return metadata.root;
  }
  return `${metadata.root}.${metadata.path.join('.')}`;
}

/**
 * Checks if a value is a schema proxy
 */
export function isSchemaProxy(value: any): value is SchemaProxy<any> {
  return typeof value === 'function' && PROXY_METADATA in value;
}

/**
 * Extracts the $ref path from a schema proxy
 */
export function getProxyRef(proxy: SchemaProxy<any>): string | undefined {
  const metadata = (proxy as any)[PROXY_METADATA] as ProxyMetadata | undefined;
  return metadata ? buildRefPath(metadata) : undefined;
}

/**
 * Converts a schema proxy to a schema node
 */
export function proxyToSchema<T>(proxy: SchemaProxy<T>): SchemaNode<T> {
  const ref = getProxyRef(proxy);
  if (!ref) {
    throw new Error('Not a valid schema proxy');
  }
  return { $ref: ref };
}
