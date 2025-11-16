/**
 * ADT Core namespace types
 *
 * These are the INPUT types that match the schema structure.
 * Used for both parsing (XML → JSON) and building (JSON → XML).
 */

/**
 * Core ADT object attributes
 * Used as attributes on the root element of most ADT objects
 */
export interface AdtCoreType {
  uri?: string;
  name?: string;
  type?: string;
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
  changedAt?: string; // ISO 8601 string
  createdAt?: string; // ISO 8601 string
}

/**
 * Package reference (used in various contexts)
 */
export interface AdtCorePackageRefType {
  uri?: string;
  type?: string;
  name?: string;
  description?: string;
}
