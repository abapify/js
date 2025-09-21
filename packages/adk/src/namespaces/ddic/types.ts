/**
 * DDIC (Data Dictionary) namespace types
 */

/**
 * Domain fixed value
 */
export interface DdicFixedValue {
  lowValue?: string;
  highValue?: string;
  description?: string;
}

/**
 * Domain data elements
 */
export interface DdicDomainData {
  dataType?: string;
  length?: string;
  decimals?: string;
  outputLength?: string;
  conversionExit?: string;
  valueTable?: string;
  fixedValues?: DdicFixedValue[];
}
