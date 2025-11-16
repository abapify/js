import { tsxml } from "../../src/index.ts";
import { adtCoreObjectFields, ADTCORE_NS } from "./adtcore.schema.ts";
import { AtomLink, ATOM_NS } from "./atom.schema.ts";

/**
 * SAP Package (pak) namespace schemas
 * Specific to SAP ABAP Development packages
 */

// Namespace URI
export const PAK_NS = "http://www.sap.com/adt/packages";

// Software component (reusable for both softwareComponent and transportLayer)
const SoftwareComponent = tsxml.schema({
  tag: "pak:softwareComponent",
  fields: {
    name: { kind: "attr", name: "pak:name", type: "string" },
    description: { kind: "attr", name: "pak:description", type: "string" },
    isVisible: { kind: "attr", name: "pak:isVisible", type: "boolean" },
    isEditable: { kind: "attr", name: "pak:isEditable", type: "boolean" },
  },
} as const);

// Transport layer (same structure as software component but different tag)
const TransportLayer = tsxml.schema({
  tag: "pak:transportLayer",
  fields: {
    name: { kind: "attr", name: "pak:name", type: "string" },
    description: { kind: "attr", name: "pak:description", type: "string" },
    isVisible: { kind: "attr", name: "pak:isVisible", type: "boolean" },
    isEditable: { kind: "attr", name: "pak:isEditable", type: "boolean" },
  },
} as const);

// Transport
const Transport = tsxml.schema({
  tag: "pak:transport",
  fields: {
    softwareComponent: {
      kind: "elem",
      name: "pak:softwareComponent",
      schema: SoftwareComponent,
    },
    transportLayer: {
      kind: "elem",
      name: "pak:transportLayer",
      schema: TransportLayer,
    },
  },
} as const);

// Package attributes
const PakAttributes = tsxml.schema({
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

// Super package
const SuperPackage = tsxml.schema({
  tag: "pak:superPackage",
  fields: {
    uri: { kind: "attr", name: "adtcore:uri", type: "string" },
    type: { kind: "attr", name: "adtcore:type", type: "string" },
    name: { kind: "attr", name: "adtcore:name", type: "string" },
    description: { kind: "attr", name: "adtcore:description", type: "string" },
  },
} as const);

// Application component
const ApplicationComponent = tsxml.schema({
  tag: "pak:applicationComponent",
  fields: {
    name: { kind: "attr", name: "pak:name", type: "string" },
    description: { kind: "attr", name: "pak:description", type: "string" },
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
    isEditable: { kind: "attr", name: "pak:isEditable", type: "string" },
  },
} as const);

// Use accesses
const UseAccesses = tsxml.schema({
  tag: "pak:useAccesses",
  fields: {
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
  },
} as const);

// Package interfaces
const PackageInterfaces = tsxml.schema({
  tag: "pak:packageInterfaces",
  fields: {
    isVisible: { kind: "attr", name: "pak:isVisible", type: "string" },
  },
} as const);

// Package reference
const PackageRef = tsxml.schema({
  tag: "pak:packageRef",
  fields: {
    uri: { kind: "attr", name: "adtcore:uri", type: "string" },
    type: { kind: "attr", name: "adtcore:type", type: "string" },
    name: { kind: "attr", name: "adtcore:name", type: "string" },
    description: { kind: "attr", name: "adtcore:description", type: "string" },
  },
} as const);

// Sub packages
const SubPackages = tsxml.schema({
  tag: "pak:subPackages",
  fields: {
    packageRef: { kind: "elems", name: "pak:packageRef", schema: PackageRef },
  },
} as const);

/**
 * Main SAP Package Schema
 * Composes all the above schemas with adtcore fields
 */
export const SapPackageSchema = tsxml.schema({
  tag: "pak:package",
  ns: {
    pak: PAK_NS,
    adtcore: ADTCORE_NS,
    atom: ATOM_NS,
  },
  fields: {
    // Spread adtcore common fields
    ...adtCoreObjectFields,

    // Package-specific children
    links: { kind: "elems", name: "atom:link", schema: AtomLink },
    attributes: { kind: "elem", name: "pak:attributes", schema: PakAttributes },
    superPackage: { kind: "elem", name: "pak:superPackage", schema: SuperPackage },
    applicationComponent: { kind: "elem", name: "pak:applicationComponent", schema: ApplicationComponent },
    transport: { kind: "elem", name: "pak:transport", schema: Transport },
    useAccesses: { kind: "elem", name: "pak:useAccesses", schema: UseAccesses },
    packageInterfaces: { kind: "elem", name: "pak:packageInterfaces", schema: PackageInterfaces },
    subPackages: { kind: "elem", name: "pak:subPackages", schema: SubPackages },
  },
} as const);

// Export individual schemas for reuse
export {
  SoftwareComponent,
  TransportLayer,
  Transport,
  PakAttributes,
  SuperPackage,
  ApplicationComponent,
  UseAccesses,
  PackageInterfaces,
  PackageRef,
  SubPackages,
};
