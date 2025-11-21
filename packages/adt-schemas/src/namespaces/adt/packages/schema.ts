import { createNamespace, createAdtSchema } from "../../../base/namespace";
import { AdtCoreObjectFields, AdtCoreFields, adtcore } from "../core/schema";
import { AtomLinkSchema, atom } from "../../atom/schema";

/**
 * SAP Package namespace schemas
 *
 * Namespace: http://www.sap.com/adt/packages
 * Prefix: pak
 */

/**
 * Package namespace object
 * Use pak.uri for namespace URI, pak.prefix for prefix
 */
export const pak = createNamespace({
  uri: "http://www.sap.com/adt/packages",
  prefix: "pak",
});

/**
 * Package attributes schema (pak:attributes)
 */
export const PackagesAttributesSchema = pak.schema({
  tag: "pak:attributes",
  fields: {
    packageType: pak.attr("packageType"),
    isPackageTypeEditable: pak.attr("isPackageTypeEditable"),
    isAddingObjectsAllowed: pak.attr("isAddingObjectsAllowed"),
    isAddingObjectsAllowedEditable: pak.attr("isAddingObjectsAllowedEditable"),
    isEncapsulated: pak.attr("isEncapsulated"),
    isEncapsulationEditable: pak.attr("isEncapsulationEditable"),
    isEncapsulationVisible: pak.attr("isEncapsulationVisible"),
    recordChanges: pak.attr("recordChanges"),
    isRecordChangesEditable: pak.attr("isRecordChangesEditable"),
    isSwitchVisible: pak.attr("isSwitchVisible"),
    languageVersion: pak.attr("languageVersion"),
    isLanguageVersionVisible: pak.attr("isLanguageVersionVisible"),
    isLanguageVersionEditable: pak.attr("isLanguageVersionEditable"),
  },
} as const);

/**
 * Package reference schema
 */
export const PackagesPackageRefSchema = pak.schema({
  tag: "pak:packageRef",
  fields: AdtCoreFields,
} as const);

/**
 * Super package schema
 */
export const PackagesSuperPackageSchema = pak.schema({
  tag: "pak:superPackage",
  fields: AdtCoreFields,
} as const);

/**
 * Application component schema
 */
export const PackagesApplicationComponentSchema = pak.schema({
  tag: "pak:applicationComponent",
  fields: {
    name: pak.attr("name"),
    description: pak.attr("description"),
    isVisible: pak.attr("isVisible"),
    isEditable: pak.attr("isEditable"),
  },
} as const);

/**
 * Software component schema
 */
export const PackagesSoftwareComponentSchema = pak.schema({
  tag: "pak:softwareComponent",
  fields: {
    name: pak.attr("name"),
    description: pak.attr("description"),
    isVisible: pak.attr("isVisible"),
    isEditable: pak.attr("isEditable"),
  },
} as const);

/**
 * Transport layer schema
 */
export const PackagesTransportLayerSchema = pak.schema({
  tag: "pak:transportLayer",
  fields: {
    name: pak.attr("name"),
    description: pak.attr("description"),
    isVisible: pak.attr("isVisible"),
    isEditable: pak.attr("isEditable"),
  },
} as const);

/**
 * Transport schema
 */
export const PackagesTransportSchema = pak.schema({
  tag: "pak:transport",
  fields: {
    softwareComponent: pak.elem("softwareComponent", PackagesSoftwareComponentSchema),
    transportLayer: pak.elem("transportLayer", PackagesTransportLayerSchema),
  },
} as const);

/**
 * Use accesses schema
 */
export const PackagesUseAccessesSchema = pak.schema({
  tag: "pak:useAccesses",
  fields: {
    isVisible: pak.attr("isVisible"),
  },
} as const);

/**
 * Package interfaces schema
 */
export const PackagesPackageInterfacesSchema = pak.schema({
  tag: "pak:packageInterfaces",
  fields: {
    isVisible: pak.attr("isVisible"),
  },
} as const);

/**
 * Sub packages container schema
 */
export const PackagesSubPackagesSchema = pak.schema({
  tag: "pak:subPackages",
  fields: {
    packageRefs: pak.elems("packageRef", PackagesPackageRefSchema),
  },
} as const);

/**
 * Complete ADT Package schema
 */
export const PackagesSchema = pak.schema({
  tag: "pak:package",
  ns: {
    pak: pak.uri,
    adtcore: adtcore.uri,
    atom: atom.uri,
  },
  fields: {
    // ADT core object attributes (spread from shared definition)
    ...AdtCoreObjectFields,

    // Atom links
    links: { kind: "elems" as const, name: "atom:link", schema: AtomLinkSchema },

    // Package-specific elements
    attributes: pak.elem("attributes", PackagesAttributesSchema),
    superPackage: pak.elem("superPackage", PackagesSuperPackageSchema),
    applicationComponent: pak.elem("applicationComponent", PackagesApplicationComponentSchema),
    transport: pak.elem("transport", PackagesTransportSchema),
    useAccesses: pak.elem("useAccesses", PackagesUseAccessesSchema),
    packageInterfaces: pak.elem("packageInterfaces", PackagesPackageInterfacesSchema),
    subPackages: pak.elem("subPackages", PackagesSubPackagesSchema),
  },
} as const);

/**
 * SAP Package ADT Schema
 *
 * Provides bidirectional XML ↔ TypeScript transformation for SAP packages
 *
 * @example
 * ```typescript
 * // Parse XML to typed object
 * const packageObj = PackageAdtSchema.fromAdtXml(xmlString);
 * console.log(packageObj.name); // "ZTEST_PACKAGE"
 *
 * // Build XML from typed object
 * const xml = PackageAdtSchema.toAdtXml(packageObj, { xmlDecl: true });
 * ```
 */
export const PackageAdtSchema = createAdtSchema(PackagesSchema);
