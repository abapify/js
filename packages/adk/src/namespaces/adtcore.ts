/**
 * Package reference element (adtcore:packageRef)
 */
export interface PackageRefType {
  uri: string;
  type: 'DEVC/K';
  name: string;
}

/**
 * ADT Core namespace (adtcore:*) - Common attributes and elements for all ADT objects
 * Based on XML: adtcore:name, adtcore:type, adtcore:changedAt (attributes) + adtcore:packageRef (element)
 */
export interface AdtCoreType {
  name: string;
  type: string;
  description?: string;
  descriptionTextLimit?: number;
  language?: string;
  masterLanguage?: string;
  masterSystem?: string;
  abapLanguageVersion?: string;
  responsible?: string;
  changedBy?: string;
  createdBy?: string;
  changedAt?: Date;
  createdAt?: Date;
  version?: 'active' | 'inactive';

  // Nested adtcore elements
  packageRef?: PackageRefType;
}

// ADT Core namespace URI
export const ADTCORE_NAMESPACE_URI = 'http://www.sap.com/adt/core';

// ADT Core decorator
import { namespace } from '../decorators';
export const adtcore = namespace('adtcore', ADTCORE_NAMESPACE_URI);
