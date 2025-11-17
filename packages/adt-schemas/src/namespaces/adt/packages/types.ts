/**
 * SAP Package (DEVC) namespace types
 *
 * Namespace: http://www.sap.com/adt/packages
 * Prefix: pak
 */

import type { AdtCoreType, AdtCoreBaseType } from "../core/types";
import type { AtomLinkType } from "../../atom/types";

/**
 * Package attributes (pak:attributes element)
 */
export interface PackagesAttributesType {
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
 * Application component
 */
export interface PackagesApplicationComponentType {
  name?: string;
  description?: string;
  isVisible?: string;
  isEditable?: string;
}

/**
 * Software component
 */
export interface PackagesSoftwareComponentType {
  name?: string;
  description?: string;
  isVisible?: string;
  isEditable?: string;
}

/**
 * Transport layer
 */
export interface PackagesTransportLayerType {
  name?: string;
  description?: string;
  isVisible?: string;
  isEditable?: string;
}

/**
 * Transport information
 */
export interface PackagesTransportType {
  softwareComponent?: PackagesSoftwareComponentType;
  transportLayer?: PackagesTransportLayerType;
}

/**
 * Use accesses container
 */
export interface PackagesUseAccessesType {
  isVisible?: string;
}

/**
 * Package interfaces container
 */
export interface PackagesPackageInterfacesType {
  isVisible?: string;
}

/**
 * Sub packages container
 */
export interface PackagesSubPackagesType {
  packageRefs?: AdtCoreBaseType[];
}

/**
 * Complete ADT Package structure
 * Combines adtcore attributes, atom links, and package-specific elements
 */
export interface PackagesType extends AdtCoreType {
  // Atom links
  links?: AtomLinkType[];

  // Package-specific elements
  attributes?: PackagesAttributesType;
  superPackage?: AdtCoreBaseType;
  applicationComponent?: PackagesApplicationComponentType;
  transport?: PackagesTransportType;
  useAccesses?: PackagesUseAccessesType;
  packageInterfaces?: PackagesPackageInterfacesType;
  subPackages?: PackagesSubPackagesType;
}
