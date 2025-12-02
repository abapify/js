/**
 * /sap/bc/adt/packages/**
 * ADT Packages Contract
 *
 * GET /sap/bc/adt/packages/{name} - Get package details
 *
 * Uses generated ts-xsd schema from packagesV1.xsd.
 * Schema defines both 'package' and 'packageTree' elements.
 * Parser auto-detects root from XML.
 */

import { http } from 'speci/rest';
import { packagesV1 } from 'adt-schemas-xsd';

// ============================================================================
// Contract
// ============================================================================


export const packagesContract = {
  /**
   * Get package by name
   *
   * GET /sap/bc/adt/packages/{name}
   *
   * Returns: Package element (auto-detected from XML)
   *
   * @example
   * const pkg = await client.adt.packages.get('$TEST_TO_DELETE');
   * console.log(pkg.name, pkg.attributes.packageType);
   */
  get: (name: string) =>
    http.get(`/sap/bc/adt/packages/${encodeURIComponent(name)}`, {
      responses: { 200: packagesV1 },
      headers: { Accept: 'application/vnd.sap.adt.packages.v1+xml' },
    }),
};

export type PackagesContract = typeof packagesContract;
export type PackagesSchema = typeof packagesV1;
