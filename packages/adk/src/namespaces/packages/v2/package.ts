import { parse, build } from "ts-xml";
import { PackagesSchema, type PackagesType } from "@abapify/adt-schemas/packages";

/**
 * ADT Package type (exported for convenience)
 */
export type AdtPackage = PackagesType;

/**
 * Parse ADT Package XML to typed JSON
 */
export function parsePackageXml(xml: string): AdtPackage {
  return parse(PackagesSchema, xml);
}

/**
 * Build ADT Package XML from typed JSON
 */
export function buildPackageXml(
  data: AdtPackage,
  options?: { xmlDecl?: boolean; encoding?: string }
): string {
  return build(PackagesSchema, data, options);
}
