/**
 * JOTL - JavaScript Object Transformation Language
 * Core type definitions for declarative, type-safe object transformations
 *
 * Version: 0.1.0 - Only $ref and $schema are implemented
 * Future directives are defined here but not yet supported by the transform engine
 */

/**
 * A reference path in dot notation (e.g., "user.profile.name")
 */
export type RefPath = string;

/**
 * Core schema node directives
 *
 * @remarks
 * v0.1 implements: $ref, $schema
 * Future: $const, $value, $if, $as, $type, $merge, $default
 */
export interface SchemaDirectives<TSource = any, TTarget = any> {
  /** Reference to a source path or proxy (v0.1: ✅ implemented) */
  $ref?: RefPath;

  /** Nested mapping to apply to the referenced value (v0.1: ✅ implemented) */
  $schema?: SchemaNode<TSource, TTarget>;

  /** Literal constant value (v0.2+: planned) */
  $const?: any;

  /** Computed function value (v0.2+: planned) */
  $value?: (source: TSource, context?: TransformContext) => TTarget;

  /** Conditional predicate - if false, exclude this field (v0.2+: planned) */
  $if?: (source: TSource, context?: TransformContext) => boolean;

  /** Optional alias/variable name for context (v0.2+: planned) */
  $as?: string;

  /** Optional type annotation (for validation) (v0.3+: planned) */
  $type?: string;

  /** Merge strategy for objects (v0.3+: planned) */
  $merge?: 'shallow' | 'deep';

  /** Default value if source is undefined/null (v0.2+: planned) */
  $default?: any;
}

/**
 * A schema node can be:
 * - An object with directives
 * - A nested schema object
 * - An array schema
 * - A literal value
 */
export type SchemaNode<TSource = any, TTarget = any> =
  | SchemaDirectives<TSource, TTarget>
  | { [K in keyof TTarget]: SchemaNode<TSource, TTarget[K]> }
  | SchemaNode<TSource, any>[]
  | string
  | number
  | boolean
  | null;

/**
 * Transform context passed through recursive evaluation
 */
export interface TransformContext {
  /** Root source object */
  root: any;

  /** Current source object */
  current: any;

  /** Parent source object (v0.2+: for advanced use cases) */
  parent?: any;

  /** Named variables from $as directives (v0.2+: planned) */
  variables?: Record<string, any>;

  /** Current path in the source object */
  path: string[];
}

/**
 * Options for the transform function
 *
 * @remarks
 * v0.1 implements: strict
 * Future: resolver, variables
 */
export interface TransformOptions {
  /** Strict mode - throw on missing paths (v0.1: ✅ implemented) */
  strict?: boolean;

  /** Custom resolver for $ref paths (v0.2+: planned) */
  resolver?: (path: RefPath, context: TransformContext) => any;

  /** Initial context variables (v0.2+: planned) */
  variables?: Record<string, any>;
}

/**
 * Proxy handler metadata stored during schema authoring
 */
export interface ProxyMetadata {
  /** Root reference name */
  root: string;

  /** Current path being built */
  path: string[];

  /** Whether this is an array context */
  isArray?: boolean;
}

/**
 * Deep schema proxy that recursively wraps all properties
 */
type DeepSchemaProxy<T> = T extends Array<infer TItem>
  ? {
      /** Array mapping function */
      (mapper: ArrayMapper<TItem, any>): SchemaNode<TItem, any>;
      /** Internal metadata (not accessible at runtime) */
      readonly __proxy_metadata?: ProxyMetadata;
    }
  : T extends object
  ? {
      [K in keyof T]: DeepSchemaProxy<T[K]>;
    } & {
      /** Internal metadata (not accessible at runtime) */
      readonly __proxy_metadata?: ProxyMetadata;
    }
  : T;

/**
 * Schema proxy type that records property access
 *
 * For arrays, adds a callable signature for mapping
 */
export type SchemaProxy<T> = DeepSchemaProxy<T>;

/**
 * Array mapping function signature
 */
export type ArrayMapper<TItem, TResult> = (item: SchemaProxy<TItem>, index?: SchemaProxy<number>) => SchemaNode<TItem, TResult>;
