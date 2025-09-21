/**
 * ADT Core namespace types (attributes on root element)
 * Phase A minimal typing; attributes are strings as parsed from XML.
 */

export interface AdtCoreAttrs {
  name: string;
  type: string;
  version?: string;
  description?: string;
  descriptionTextLimit?: string;
  language?: string;
  masterLanguage?: string;
  masterSystem?: string;
  abapLanguageVersion?: string;
  responsible?: string;
  changedBy?: string;
  createdBy?: string;
  changedAt?: string; // ISO string in XML
  createdAt?: string; // ISO string in XML
}

export interface PackageRef {
  uri: string;
  type: 'DEVC/K';
  name: string;
}
