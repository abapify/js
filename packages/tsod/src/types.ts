/**
 * tsod - Transform Schema Object Definition
 * Core type definitions
 */

/**
 * Transformation context passed to transform functions
 */
export interface TransformContext {
  /** Direction of transformation */
  direction: 'forward' | 'reverse';
  /** Current path in the object tree */
  path: readonly string[];
  /** Parent object reference */
  parent?: unknown;
  /** Root source object */
  root: unknown;
}

/**
 * Transform function signature
 */
export type TransformFn<TSource = unknown, TTarget = unknown> = (
  value: TSource,
  context: TransformContext
) => TTarget;

/**
 * Rule for transforming a single field
 */
export interface TransformRule {
  /** Source path (e.g., 'user.name' or 'items[]') */
  from: string;

  /** Target path (e.g., 'userName' or 'data.items[]') */
  to: string;

  /** Optional forward transformation function */
  transform?: TransformFn;

  /** Optional reverse transformation function (if different from forward) */
  reverse?: TransformFn;

  /** Nested rules for complex objects/arrays */
  rules?: readonly TransformRule[];
}

/**
 * Schema initialization function
 */
export type InitFn<T = unknown> = (direction: 'forward' | 'reverse') => T;

/**
 * Complete transformation schema
 */
export interface TransformSchema {
  /** Array of transformation rules */
  rules: readonly TransformRule[];

  /** Optional initialization function for target object */
  init?: InitFn;
}

/**
 * Options for transformer behavior
 */
export interface TransformerOptions {
  /** Skip undefined values in transformation */
  skipUndefined?: boolean;

  /** Skip null values in transformation */
  skipNull?: boolean;

  /** Strict mode: throw errors on missing paths */
  strict?: boolean;

  /** Custom path separator (default: '.') */
  pathSeparator?: string;

  /** Array marker (default: '[]') */
  arrayMarker?: string;
}

/**
 * Result of a transformation with metadata
 */
export interface TransformResult<T = unknown> {
  /** Transformed data */
  data: T;

  /** Paths that were processed */
  processedPaths: readonly string[];

  /** Paths that were skipped */
  skippedPaths: readonly string[];

  /** Any warnings during transformation */
  warnings: readonly string[];
}
