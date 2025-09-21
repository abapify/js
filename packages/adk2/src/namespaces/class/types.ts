/**
 * ABAP Class namespace types
 */

/**
 * Class-specific attributes (flattened on root)
 */
export interface ClassAttrs {
  final?: string;
  abstract?: string;
  visibility?: string;
  category?: string;
  hasTests?: string;
  sharedMemoryEnabled?: string;
}

/**
 * Class include types
 */
export type IncludeType =
  | 'definitions'
  | 'implementations'
  | 'macros'
  | 'testclasses'
  | 'main';

/**
 * Class include element
 */
export interface ClassInclude {
  includeType: IncludeType;
  sourceUri?: string;
  name?: string;
  type?: string;
  changedAt?: string;
  version?: string;
  createdAt?: string;
  changedBy?: string;
  createdBy?: string;
  // Atom links are handled by BaseSpec
}
