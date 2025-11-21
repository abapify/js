/**
 * DDIC (Data Dictionary) namespace types
 *
 * Namespace: http://www.sap.com/adt/ddic (general)
 * Domain namespace: http://www.sap.com/dictionary/domain
 * Prefix: doma
 */

import type { AdtCoreType } from '../core/types';
import type { AtomLinkType } from '../../atom/types';

/**
 * Text element wrapper (for elements with text content)
 */
interface TextElement {
  text?: string;
}

/**
 * Domain type information (nested under content)
 */
export interface DomaTypeInformationType {
  datatype?: TextElement;
  length?: TextElement;
  decimals?: TextElement;
}

/**
 * Domain output information (nested under content)
 */
export interface DomaOutputInformationType {
  length?: TextElement;
  style?: TextElement;
  conversionExit?: TextElement;
  signExists?: TextElement;
  lowercase?: TextElement;
  ampmFormat?: TextElement;
}

/**
 * Domain fixed value
 */
export interface DdicFixedValueType {
  position?: TextElement;
  low?: TextElement;
  high?: TextElement;
  text?: TextElement;
}

/**
 * Domain fixed values container
 */
export interface DomaFixValuesType {
  fixValue?: DdicFixedValueType[];
}

/**
 * Domain value information (nested under content)
 */
export interface DomaValueInformationType {
  valueTableRef?: TextElement;
  appendExists?: TextElement;
  fixValues?: DomaFixValuesType;
}

/**
 * Domain content (contains all domain-specific data)
 */
export interface DomaContentType {
  typeInformation?: DomaTypeInformationType;
  outputInformation?: DomaOutputInformationType;
  valueInformation?: DomaValueInformationType;
}

/**
 * Complete ABAP Domain structure
 */
export interface DdicDomainType extends AdtCoreType {
  // Atom links
  links?: AtomLinkType[];

  // Domain content (all domain-specific data is nested here)
  content?: DomaContentType;
}
