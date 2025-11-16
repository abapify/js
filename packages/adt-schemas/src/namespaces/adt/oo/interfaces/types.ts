/**
 * ABAP OO Interface namespace types
 *
 * Namespace: http://www.sap.com/adt/oo/interfaces
 * Prefix: intf
 */

import type { AdtCoreType } from "../../core/types";
import type { AtomLinkType } from "../../../atom/types";

/**
 * Interface-specific attributes
 */
export interface InterfaceAttributesType {
  abstract?: string;
  category?: string;
}

/**
 * Complete ABAP Interface structure
 */
export interface InterfaceType extends AdtCoreType {
  // Atom links
  links?: AtomLinkType[];

  // Interface-specific attributes
  abstract?: string;
  category?: string;

  // ABAP Source attributes
  sourceUri?: string;
  fixPointArithmetic?: string;
  activeUnicodeCheck?: string;

  // ABAP OO attributes
  forkable?: string;
}
