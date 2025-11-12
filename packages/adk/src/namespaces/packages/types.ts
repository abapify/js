/**
 * Package (DEVC) data types
 */

/**
 * Core package data from DEVC table
 */
export interface DevcData {
  /** Package name (DEVCLASS) */
  devclass: string;
  /** Package description (CTEXT) */
  ctext?: string;
  /** Parent package (PARENTCL) */
  parentcl?: string;
  /** Package type */
  dlvunit?: string;
  /** Component */
  component?: string;
}

/**
 * ADT Package attributes (pak:attributes)
 */
export interface PackageAttributes {
  packageType?: string;
  isPackageTypeEditable?: string;
  isAddingObjectsAllowed?: string;
  isAddingObjectsAllowedEditable?: string;
  isEncapsulated?: string;
  isEncapsulationEditable?: string;
  isEncapsulationVisible?: string;
  recordChanges?: string;
  isRecordChangesEditable?: string;
  isSwitchVisible?: string;
  languageVersion?: string;
  isLanguageVersionVisible?: string;
  isLanguageVersionEditable?: string;
}

/**
 * Package reference (used in subpackages and superpackage)
 */
export interface PackageRef {
  uri?: string;
  type?: string;
  name?: string;
  description?: string;
}

/**
 * Application component
 */
export interface ApplicationComponent {
  name?: string;
  description?: string;
  isVisible?: string;
  isEditable?: string;
}

/**
 * Software component
 */
export interface SoftwareComponent {
  name?: string;
  description?: string;
  isVisible?: string;
  isEditable?: string;
}

/**
 * Transport layer
 */
export interface TransportLayer {
  name?: string;
  description?: string;
  isVisible?: string;
  isEditable?: string;
}

/**
 * Transport information
 */
export interface Transport {
  softwareComponent?: SoftwareComponent;
  transportLayer?: TransportLayer;
}

/**
 * Package namespace elements (pak:)
 * This interface groups all pak: namespace child elements
 */
export interface PakNamespace {
  /** Package attributes */
  attributes?: PackageAttributes;
  /** Super package reference */
  superPackage?: PackageRef;
  /** Application component */
  applicationComponent?: ApplicationComponent;
  /** Transport information */
  transport?: Transport;
  /** Subpackages */
  subPackages?: PackageRef[];
}

/**
 * Complete package data from ADT API
 */
export interface PackageData {
  /** Package name */
  name: string;
  /** Package description */
  description?: string;
  /** Package type */
  type?: string;
  /** Responsible user */
  responsible?: string;
  /** Master language */
  masterLanguage?: string;
  /** Created at */
  createdAt?: string;
  /** Created by */
  createdBy?: string;
  /** Changed at */
  changedAt?: string;
  /** Changed by */
  changedBy?: string;
  /** Version */
  version?: string;
  /** Language */
  language?: string;
  /** Package attributes */
  attributes?: PackageAttributes;
  /** Super package */
  superPackage?: PackageRef;
  /** Application component */
  applicationComponent?: ApplicationComponent;
  /** Transport information */
  transport?: Transport;
  /** Subpackages */
  subPackages?: PackageRef[];
}
