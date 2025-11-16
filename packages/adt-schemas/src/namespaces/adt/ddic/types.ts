/**
 * DDIC (Data Dictionary) namespace types
 *
 * Namespace: http://www.sap.com/adt/ddic
 * Prefix: ddic
 */

import type { AdtCoreType } from "../core/types.ts";
import type { AtomLinkType } from "../../atom/types.ts";

/**
 * Domain fixed value
 */
export interface DdicFixedValueType {
  lowValue?: string;
  highValue?: string;
  description?: string;
}

/**
 * Domain fixed values container
 */
export interface DdicFixedValuesType {
  fixedValue?: DdicFixedValueType[];
}

/**
 * Complete ABAP Domain structure
 */
export interface DdicDomainType extends AdtCoreType {
  // Atom links
  links?: AtomLinkType[];

  // DDIC domain-specific elements
  dataType?: string;
  length?: string;
  decimals?: string;
  outputLength?: string;
  conversionExit?: string;
  valueTable?: string;
  fixedValues?: DdicFixedValuesType;
}
