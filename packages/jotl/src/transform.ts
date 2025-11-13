/**
 * JOTL - Transform Engine (v0.1: Minimalistic)
 * Evaluates schema nodes against source data
 *
 * Version 0.1: Only $ref and $schema directives supported
 */

import type { SchemaNode, TransformContext, TransformOptions, SchemaDirectives } from './types.js';
import { isSchemaProxy, proxyToSchema } from './proxy.js';

/**
 * Transforms source data using a declarative schema
 *
 * @example
 * const result = transform(invoice, {
 *   totalAmount: { $ref: "invoice.total" },
 *   items: {
 *     $ref: "invoice.lines",
 *     $schema: { id: { $ref: "item.id" }, qty: { $ref: "item.qty" } }
 *   }
 * });
 *
 * @param source - Source data object
 * @param schema - Schema node defining the transformation
 * @param options - Transform options
 */
export function transform<TSource, TTarget>(
  source: TSource,
  schema: SchemaNode<TSource, TTarget>,
  options: TransformOptions = {}
): TTarget {
  const context: TransformContext = {
    root: source,
    current: source,
    path: [],
  };

  return evaluateNode(schema, context, options) as TTarget;
}

/**
 * Evaluates a schema node recursively (v0.1: $ref and $schema only)
 */
function evaluateNode(node: SchemaNode, context: TransformContext, options: TransformOptions): any {
  // Check if this is a schema proxy and convert it
  if (isSchemaProxy(node as any)) {
    node = proxyToSchema(node as any);
  }

  // Handle null/undefined
  if (node === null || node === undefined) {
    return node;
  }

  // Handle primitives
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return node;
  }

  // Handle arrays
  if (Array.isArray(node)) {
    return node.map((item) => evaluateNode(item, context, options));
  }

  // Handle objects (schema nodes or plain objects)
  if (typeof node === 'object') {
    const directives = node as SchemaDirectives;

    // Handle $ref directive
    if (directives.$ref) {
      const value = resolveRef(directives.$ref, context, options);

      // Apply nested $schema if present
      if (directives.$schema) {
        // Check if value is an array (array mapping)
        if (Array.isArray(value)) {
          return value.map((item, index) => {
            const itemContext: TransformContext = {
              root: item, // Use item as new root for nested resolution
              current: item,
              path: [...context.path, String(index)],
            };
            return evaluateNode(directives.$schema!, itemContext, options);
          });
        } else {
          // Object mapping - use value as new root
          const nestedContext: TransformContext = {
            root: value,
            current: value,
            path: [...context.path, directives.$ref],
          };
          return evaluateNode(directives.$schema, nestedContext, options);
        }
      }

      return value;
    }

    // Plain object - recursively evaluate all properties
    const result: any = {};
    for (const [key, value] of Object.entries(node)) {
      // Skip directive keys that start with $
      if (key.startsWith('$')) {
        continue;
      }

      const evaluated = evaluateNode(value, context, options);

      // Only include defined values
      if (evaluated !== undefined) {
        result[key] = evaluated;
      }
    }

    return result;
  }

  return node;
}

/**
 * Resolves a $ref path to a value in the source data
 * Supports dot notation (e.g., "user.profile.name")
 */
function resolveRef(ref: string, context: TransformContext, options: TransformOptions): any {
  const parts = ref.split('.');
  let value: any = context.root;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (value === null || value === undefined) {
      if (options.strict) {
        throw new Error(`Cannot resolve path "${ref}" - value is null/undefined at "${part}"`);
      }
      return undefined;
    }

    // Check if property exists
    if (!(part in value) && options.strict) {
      throw new Error(`Cannot resolve path "${ref}" - property "${part}" does not exist`);
    }

    value = value[part];
  }

  return value;
}
