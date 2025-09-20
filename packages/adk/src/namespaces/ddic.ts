/**
 * Domain fixed value interface (for ddic:fixedValue elements)
 */
export interface DdicFixedValueType {
  lowValue: string;
  highValue?: string;
  description?: string;
}

// DDIC attributes (none - ddic namespace doesn't have attributes, only elements)
export interface DdicAttributes {
  // No namespace-level attributes for ddic
}

// DDIC elements - these become direct child elements of the root
export interface DdicElements {
  /** Data type (e.g., 'CHAR', 'NUMC', 'DATS') - becomes <ddic:dataType> */
  dataType?: string;

  /** Field length - becomes <ddic:length> */
  length?: number;

  /** Number of decimal places - becomes <ddic:decimals> */
  decimals?: number;

  /** Output length - becomes <ddic:outputLength> */
  outputLength?: number;

  /** Conversion exit - becomes <ddic:conversionExit> */
  conversionExit?: string;

  /** Value table name - becomes <ddic:valueTable> */
  valueTable?: string;

  /** Fixed values container - becomes <ddic:fixedValues> with <ddic:fixedValue> children */
  fixedValues?: {
    fixedValue: DdicFixedValueType[];
  };
}

/**
 * DDIC namespace (ddic:*) - Smart namespace with automatic attribute/element detection
 * Based on actual XML: <ddic:domain> root with <ddic:dataType>, <ddic:length>, etc. as direct children
 */
export type DdicType = DdicAttributes & DdicElements;

// DDIC decorator - smart namespace with automatic attribute/element detection
import { createNamespace } from '../decorators/decorators-v2';

export const ddic = createNamespace<DdicElements, DdicAttributes>({
  name: 'ddic',
  uri: 'http://www.sap.com/adt/ddic',
});
