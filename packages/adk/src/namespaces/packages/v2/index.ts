/**
 * ADT Package V2 - Schema-driven implementation using ts-xml
 *
 * This version replaces decorator-based ADK with schema-driven ts-xml:
 * - No decorators
 * - No classes
 * - Pure functions for XML ↔ JSON transformation
 * - Single schema definition for bidirectional transformation
 * - Full TypeScript type inference
 * - Simpler, more functional approach
 */

export { parsePackageXml, buildPackageXml, type AdtPackage } from "./package.js";

// Re-export schemas from centralized adt-schemas package
export {
  PackagesSchema as AdtPackageSchema,
  PackagesAttributesSchema as PackageAttributesSchema,
  PackagesPackageRefSchema as PackageRefSchema,
  PackagesSuperPackageSchema as SuperPackageSchema,
  PackagesApplicationComponentSchema as ApplicationComponentSchema,
  PackagesSoftwareComponentSchema as SoftwareComponentSchema,
  PackagesTransportLayerSchema as TransportLayerSchema,
  PackagesTransportSchema as TransportSchema,
  PackagesSubPackagesSchema as SubPackagesSchema,
  pak,
} from "@abapify/adt-schemas/packages";

export { AtomLinkSchema, atom } from "@abapify/adt-schemas/atom";
export { adtcore } from "@abapify/adt-schemas/adtcore";
