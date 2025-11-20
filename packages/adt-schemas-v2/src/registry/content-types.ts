/**
 * SAP ADT Content-Type constants
 *
 * Content-Type = Schema Identity + Version
 * Format: application/vnd.sap.adt.{namespace}.{version}+xml
 */

/**
 * ADT Content-Type constants
 * Use these instead of hardcoding content-type strings
 */
export const ADT_CONTENT_TYPES = {
  // Core
  CORE: 'application/vnd.sap.adt.core.v1+xml',

  // Packages
  PACKAGE: 'application/vnd.sap.adt.packages.v1+xml',

  // Object-Oriented
  CLASS: 'application/vnd.sap.adt.oo.classes.v1+xml',
  INTERFACE: 'application/vnd.sap.adt.oo.interfaces.v1+xml',

  // DDIC
  DOMAIN: 'application/vnd.sap.adt.ddic.domains.v1+xml',
  DATA_ELEMENT: 'application/vnd.sap.adt.ddic.dataelements.v1+xml',
  TABLE: 'application/vnd.sap.adt.ddic.tables.v1+xml',

  // Atom (standard)
  ATOM_FEED: 'application/atom+xml',
  ATOM_ENTRY: 'application/atom+xml;type=entry',
} as const;

/**
 * Type for all supported content-types
 */
export type AdtContentType =
  (typeof ADT_CONTENT_TYPES)[keyof typeof ADT_CONTENT_TYPES];

/**
 * Extract namespace from content-type
 *
 * @example
 * extractNamespace("application/vnd.sap.adt.packages.v1+xml") // "packages"
 */
export function extractNamespace(contentType: string): string | undefined {
  const match = contentType.match(/application\/vnd\.sap\.adt\.([^.]+)/);
  return match?.[1];
}

/**
 * Extract version from content-type
 *
 * @example
 * extractVersion("application/vnd.sap.adt.packages.v1+xml") // "v1"
 */
export function extractVersion(contentType: string): string | undefined {
  const match = contentType.match(/\.v(\d+)\+xml/);
  return match ? `v${match[1]}` : undefined;
}

/**
 * Check if content-type is supported
 */
export function isSupportedContentType(
  contentType: string
): contentType is AdtContentType {
  return Object.values(ADT_CONTENT_TYPES).includes(
    contentType as AdtContentType
  );
}
