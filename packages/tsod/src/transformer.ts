/**
 * tsod - Transform Schema Object Definition
 * Core transformation engine
 */

import type {
  TransformSchema,
  TransformRule,
  TransformContext,
  TransformerOptions,
} from './types';
import { getValue, setValue, parsePath } from './core/path-resolver';

/**
 * Bidirectional object transformer
 *
 * Transforms objects according to a schema in both directions:
 * - forward: source → target
 * - reverse: target → source
 *
 * @example
 * ```typescript
 * const schema = {
 *   rules: [
 *     { from: 'name', to: 'userName' },
 *     { from: 'age', to: 'userAge' }
 *   ]
 * };
 *
 * const transformer = new Transformer(schema);
 * const target = transformer.forward({ name: 'John', age: 30 });
 * // { userName: 'John', userAge: 30 }
 * ```
 */
export class Transformer {
  private readonly options: Required<TransformerOptions>;

  constructor(
    private readonly schema: TransformSchema,
    options: TransformerOptions = {}
  ) {
    this.options = {
      skipUndefined: true,
      skipNull: false,
      strict: false,
      pathSeparator: '.',
      arrayMarker: '[]',
      ...options,
    };
  }

  /**
   * Transform source object to target format
   */
  forward(source: unknown): Record<string, unknown> {
    const target = this.schema.init?.('forward') ?? {};

    if (typeof target !== 'object' || target === null) {
      throw new Error('init() must return an object');
    }

    this.applyRules(
      source,
      target as Record<string, unknown>,
      this.schema.rules,
      'forward',
      []
    );

    return target as Record<string, unknown>;
  }

  /**
   * Transform target object back to source format
   */
  reverse(target: unknown): Record<string, unknown> {
    const source = this.schema.init?.('reverse') ?? {};

    if (typeof source !== 'object' || source === null) {
      throw new Error('init() must return an object');
    }

    this.applyRules(
      target,
      source as Record<string, unknown>,
      this.schema.rules,
      'reverse',
      []
    );

    return source as Record<string, unknown>;
  }

  /**
   * Apply transformation rules recursively
   */
  private applyRules(
    source: unknown,
    target: Record<string, unknown>,
    rules: readonly TransformRule[],
    direction: 'forward' | 'reverse',
    pathStack: readonly string[]
  ): void {
    for (const rule of rules) {
      const sourcePath = direction === 'forward' ? rule.from : rule.to;
      const targetPath = direction === 'forward' ? rule.to : rule.from;

      const value = getValue(source, sourcePath, this.options.arrayMarker);

      // Skip undefined/null based on options
      if (value === undefined && this.options.skipUndefined) continue;
      if (value === null && this.options.skipNull) continue;
      if (value === undefined && !this.options.strict) continue;

      // Parse paths to check if array
      const { isArray: sourceIsArray } = parsePath(
        sourcePath,
        this.options.arrayMarker
      );
      const { isArray: targetIsArray } = parsePath(
        targetPath,
        this.options.arrayMarker
      );

      // Handle arrays
      if (sourceIsArray && Array.isArray(value)) {
        const transformedArray = this.transformArray(
          value,
          rule,
          direction,
          [...pathStack, sourcePath]
        );

        setValue(target, targetPath, transformedArray, this.options.arrayMarker);
        continue;
      }

      // Handle nested rules (complex objects)
      if (rule.rules && value !== null && typeof value === 'object') {
        const nested: Record<string, unknown> = {};
        this.applyRules(
          value,
          nested,
          rule.rules,
          direction,
          [...pathStack, sourcePath]
        );

        setValue(target, targetPath, nested, this.options.arrayMarker);
        continue;
      }

      // Apply transformation function
      const transformFn =
        direction === 'forward' ? rule.transform : rule.reverse;

      const context: TransformContext = {
        direction,
        path: [...pathStack, sourcePath],
        parent: source,
        root: source,
      };

      const transformed = transformFn ? transformFn(value, context) : value;

      setValue(target, targetPath, transformed, this.options.arrayMarker);
    }
  }

  /**
   * Transform array elements
   */
  private transformArray(
    items: readonly unknown[],
    rule: TransformRule,
    direction: 'forward' | 'reverse',
    pathStack: readonly string[]
  ): unknown[] {
    return items.map((item, index) => {
      // If nested rules exist, transform each item
      if (rule.rules) {
        const nested: Record<string, unknown> = {};
        this.applyRules(
          item,
          nested,
          rule.rules,
          direction,
          [...pathStack, `[${index}]`]
        );
        return nested;
      }

      // Apply transformation function to each item
      const transformFn =
        direction === 'forward' ? rule.transform : rule.reverse;

      if (transformFn) {
        const context: TransformContext = {
          direction,
          path: [...pathStack, `[${index}]`],
          parent: items,
          root: items,
        };
        return transformFn(item, context);
      }

      return item;
    });
  }
}
