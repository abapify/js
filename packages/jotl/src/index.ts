/**
 * JOTL - JavaScript Object Transformation Language
 *
 * Type-safe, declarative transformations for JSON and JavaScript objects.
 *
 * @example
 * ```typescript
 * import { makeSchemaProxy, transform } from 'jotl';
 *
 * interface Invoice {
 *   total: number;
 *   lines: Array<{ id: string; qty: number }>;
 * }
 *
 * const src = makeSchemaProxy<Invoice>("invoice");
 *
 * const schema = {
 *   totalAmount: src.total,
 *   items: src.lines(item => ({ id: item.id, quantity: item.qty }))
 * };
 *
 * const result = transform(invoiceData, schema);
 * // { totalAmount: 1000, items: [{ id: "1", quantity: 5 }, ...] }
 * ```
 *
 * @packageDocumentation
 */

export { makeSchemaProxy, isSchemaProxy, getProxyRef, proxyToSchema } from './proxy.js';
export { transform } from './transform.js';
export type {
  SchemaNode,
  SchemaDirectives,
  SchemaProxy,
  TransformContext,
  TransformOptions,
  RefPath,
  ArrayMapper,
  ProxyMetadata,
} from './types.js';
