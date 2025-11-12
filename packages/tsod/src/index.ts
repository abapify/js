/**
 * tsod - Transform Schema Object Definition
 * Bidirectional object transformation engine
 *
 * Like Zod, but for transformations instead of validation.
 *
 * @packageDocumentation
 */

// Core exports
export { Transformer } from './transformer';
export type {
  TransformSchema,
  TransformRule,
  TransformContext,
  TransformFn,
  InitFn,
  TransformerOptions,
  TransformResult,
} from './types';

// Utilities
export { getValue, setValue, parsePath } from './core/path-resolver';

// Convenience functions
import { Transformer } from './transformer';
import type { TransformSchema, TransformerOptions } from './types';

/**
 * Create a transformer from a schema
 *
 * @example
 * ```typescript
 * const transformer = createTransformer({
 *   rules: [
 *     { from: 'name', to: 'userName' },
 *     { from: 'age', to: 'userAge' }
 *   ]
 * });
 *
 * const result = transformer.forward({ name: 'John', age: 30 });
 * ```
 */
export function createTransformer(
  schema: TransformSchema,
  options?: TransformerOptions
): Transformer {
  return new Transformer(schema, options);
}

/**
 * Quick transform function (forward direction)
 *
 * @example
 * ```typescript
 * const result = transform(
 *   { name: 'John', age: 30 },
 *   {
 *     rules: [
 *       { from: 'name', to: 'userName' },
 *       { from: 'age', to: 'userAge' }
 *     ]
 *   }
 * );
 * ```
 */
export function transform(
  source: unknown,
  schema: TransformSchema,
  options?: TransformerOptions
): Record<string, unknown> {
  const transformer = new Transformer(schema, options);
  return transformer.forward(source);
}

/**
 * Quick reverse transform function
 *
 * @example
 * ```typescript
 * const result = reverseTransform(
 *   { userName: 'John', userAge: 30 },
 *   {
 *     rules: [
 *       { from: 'name', to: 'userName' },
 *       { from: 'age', to: 'userAge' }
 *     ]
 *   }
 * );
 * // { name: 'John', age: 30 }
 * ```
 */
export function reverseTransform(
  target: unknown,
  schema: TransformSchema,
  options?: TransformerOptions
): Record<string, unknown> {
  const transformer = new Transformer(schema, options);
  return transformer.reverse(target);
}
