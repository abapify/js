import { tsxml } from "ts-xml";

/**
 * Namespace constants
 */
export const PAK_NS = "http://www.sap.com/adt/packages";
export const ADTCORE_NS = "http://www.sap.com/adt/core";
export const ATOM_NS = "http://www.w3.org/2005/Atom";

/**
 * Common adtcore attribute fields (reusable mixin)
 */
export const adtCoreFields = {
  uri: { kind: "attr" as const, name: "adtcore:uri", type: "string" as const },
  type: { kind: "attr" as const, name: "adtcore:type", type: "string" as const },
  name: { kind: "attr" as const, name: "adtcore:name", type: "string" as const },
  description: { kind: "attr" as const, name: "adtcore:description", type: "string" as const },
};

/**
 * Full adtcore object fields for root package element
 */
export const adtCoreObjectFields = {
  ...adtCoreFields,
  responsible: { kind: "attr" as const, name: "adtcore:responsible", type: "string" as const },
  masterLanguage: { kind: "attr" as const, name: "adtcore:masterLanguage", type: "string" as const },
  changedAt: { kind: "attr" as const, name: "adtcore:changedAt", type: "string" as const },
  version: { kind: "attr" as const, name: "adtcore:version", type: "string" as const },
  createdAt: { kind: "attr" as const, name: "adtcore:createdAt", type: "string" as const },
  changedBy: { kind: "attr" as const, name: "adtcore:changedBy", type: "string" as const },
  createdBy: { kind: "attr" as const, name: "adtcore:createdBy", type: "string" as const },
  descriptionTextLimit: { kind: "attr" as const, name: "adtcore:descriptionTextLimit", type: "string" as const },
  language: { kind: "attr" as const, name: "adtcore:language", type: "string" as const },
};

/**
 * Atom link schema
 */
export const AtomLinkSchema = tsxml.schema({
  tag: "atom:link",
  fields: {
    href: { kind: "attr", name: "href", type: "string" },
    rel: { kind: "attr", name: "rel", type: "string" },
    title: { kind: "attr", name: "title", type: "string" },
    type: { kind: "attr", name: "type", type: "string" },
  },
} as const);

/**
 * Package attributes schema (pak:attributes)
 */
export const PackageAttributesSchema = tsxml.schema({
  tag: "pak:attributes",
  fields: {
    packageType: { kind: "attr", name: "pak:packageType", type: "string" },
    isPackageTypeEditable: { kind: "attr", name: "pak:isPackageTypeEditable", type: "string" },
    isAddingObjectsAllowed: { kind: "attr", name: "pak:isAddingObjectsAllowed", type: "string" },
    isAddingObjectsAllowedEditable: { kind: "attr", name: "pak:isAddingObjectsAllowedEditable", type: "string" },
    isEncapsulated: { kind: "attr", name: "pak:isEncapsulated", type: "string" },
    isEncapsulationEditable: { kind: "attr", name: "pak:isEncapsulationEditable", type: "string" },
    isEncapsulationVisible: { kind: "attr", name: "pak:isEncapsulationVisible", type: "string" },
    recordChanges: { kind: "attr", name: "pak:recordChanges", type: "string" },
    isRecordChangesEditable: { kind: "attr", name: "pak:isRecordChangesEditable", type: "string" },
    isSwitchVisible: { kind: "attr", name: "pak:isSwitchVisible", type: "string" },
    languageVersion: { kind: "attr", name: "pak:languageVersion", type: "string" },
    isLanguageVersionVisible: { kind: "attr", name: "pak:isLanguageVersionVisible", type: "string" },
    isLanguageVersionEditable: { kind: "attr", name: "pak:isLanguageVersionEditable", type: "string" },
  },
} as const);

/**
 * Package reference schema (used for superPackage and subPackages)
 */
export const PackageRefSchema = tsxml.schema({
  tag: "pak:packageRef",
  fields: {
    ...adtCoreFields,
  },
} as const);

/**
 * Super package schema
 */
export const SuperPackageSchema = tsxml.schema({
  tag: "pak:superPackage",
  fields: {
    ...adtCoreFields,
  },
} as const);

/**
 * Application component schema
 */
export const ApplicationComponentSchema = tsxml.schema({
  tag: "pak:applicationComponent",
  fields: {
    name: { kind: "attr", name: "pak:name", type: "string" },
    description: { kind: "attr", name: "pak:description", type: "string" },
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
    isEditable: { kind: "attr", name: "pak:isEditable", type: "string" },
  },
} as const);

/**
 * Software component schema
 */
export const SoftwareComponentSchema = tsxml.schema({
  tag: "pak:softwareComponent",
  fields: {
    name: { kind: "attr", name: "pak:name", type: "string" },
    description: { kind: "attr", name: "pak:description", type: "string" },
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
    isEditable: { kind: "attr", name: "pak:isEditable", type: "string" },
  },
} as const);

/**
 * Transport layer schema
 */
export const TransportLayerSchema = tsxml.schema({
  tag: "pak:transportLayer",
  fields: {
    name: { kind: "attr", name: "pak:name", type: "string" },
    description: { kind: "attr", name: "pak:description", type: "string" },
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
    isEditable: { kind: "attr", name: "pak:isEditable", type: "string" },
  },
} as const);

/**
 * Transport schema
 */
export const TransportSchema = tsxml.schema({
  tag: "pak:transport",
  fields: {
    softwareComponent: { kind: "elem", name: "pak:softwareComponent", schema: SoftwareComponentSchema },
    transportLayer: { kind: "elem", name: "pak:transportLayer", schema: TransportLayerSchema },
  },
} as const);

/**
 * Use accesses schema (placeholder - empty element)
 */
export const UseAccessesSchema = tsxml.schema({
  tag: "pak:useAccesses",
  fields: {
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
  },
} as const);

/**
 * Package interfaces schema (placeholder - empty element)
 */
export const PackageInterfacesSchema = tsxml.schema({
  tag: "pak:packageInterfaces",
  fields: {
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
  },
} as const);

/**
 * Sub packages container schema
 */
export const SubPackagesSchema = tsxml.schema({
  tag: "pak:subPackages",
  fields: {
    packageRefs: { kind: "elems", name: "pak:packageRef", schema: PackageRefSchema },
  },
} as const);

/**
 * Complete ADT Package schema
 */
export const AdtPackageSchema = tsxml.schema({
  tag: "pak:package",
  ns: {
    pak: PAK_NS,
    adtcore: ADTCORE_NS,
    atom: ATOM_NS,
  },
  fields: {
    // ADT core object attributes
    ...adtCoreObjectFields,

    // Atom links
    links: { kind: "elems", name: "atom:link", schema: AtomLinkSchema },

    // Package-specific elements
    attributes: { kind: "elem", name: "pak:attributes", schema: PackageAttributesSchema },
    superPackage: { kind: "elem", name: "pak:superPackage", schema: SuperPackageSchema },
    applicationComponent: { kind: "elem", name: "pak:applicationComponent", schema: ApplicationComponentSchema },
    transport: { kind: "elem", name: "pak:transport", schema: TransportSchema },
    useAccesses: { kind: "elem", name: "pak:useAccesses", schema: UseAccessesSchema },
    packageInterfaces: { kind: "elem", name: "pak:packageInterfaces", schema: PackageInterfacesSchema },
    subPackages: { kind: "elem", name: "pak:subPackages", schema: SubPackagesSchema },
  },
} as const);
