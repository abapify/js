/**
 * ABAP OO Class namespace types
 *
 * Namespace: http://www.sap.com/adt/oo/classes
 * Prefix: class
 */

import type { AdtCoreType } from "../../core/types";
import type { AtomLinkType } from "../../../atom/types";

/**
 * Class-specific attributes
 */
export interface ClassAttributesType {
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
export type ClassIncludeType =
  | "definitions"
  | "implementations"
  | "macros"
  | "testclasses"
  | "main";

/**
 * Class include element
 */
export interface ClassIncludeElementType extends AdtCoreType {
  includeType?: ClassIncludeType;
  sourceUri?: string;
  links?: AtomLinkType[];
}

/**
 * Complete ABAP Class structure
 */
export interface ClassType extends AdtCoreType {
  // Atom links
  links?: AtomLinkType[];

  // Class-specific attributes
  final?: string;
  abstract?: string;
  visibility?: string;
  category?: string;
  hasTests?: string;
  sharedMemoryEnabled?: string;

  // ABAP Source attributes
  sourceUri?: string;
  fixPointArithmetic?: string;
  activeUnicodeCheck?: string;

  // ABAP OO attributes
  forkable?: string;

  // Class includes
  include?: ClassIncludeElementType[];
}
