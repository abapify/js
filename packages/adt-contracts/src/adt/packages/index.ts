/**
 * /sap/bc/adt/packages/**
 * ADT Packages Contract
 *
 * Full CRUD operations for ABAP packages (DEVC).
 *
 * Uses the crud() helper with packagesV1 schema.
 * Package names are case-sensitive (uppercase) — no lowercase transform.
 *
 * @example
 * const pkg = await client.adt.packages.get('ZABAPGIT_EXAMPLES');
 * console.log(pkg.package?.name, pkg.package?.attributes?.packageType);
 *
 * // Create a new package
 * await client.adt.packages.post({ corrNr: 'DEVK900001' });
 */

import { contract, http } from '../../base';
import { crud } from '../../helpers/crud';
import { packagesV1 } from '../../schemas';

import type { InferTypedSchema } from '../../schemas';

/**
 * Package response type - inferred from packagesV1 schema
 * Use this type for package data throughout the codebase
 */
export type Package = InferTypedSchema<typeof packagesV1>;

const packageCrudContract = crud({
  basePath: '/sap/bc/adt/packages',
  schema: packagesV1,
  contentType: 'application/vnd.sap.adt.packages.v2+xml',
  accept:
    'application/vnd.sap.adt.packages.v2+xml, application/vnd.sap.adt.packages.v1+xml',
  nameTransform: (n) => encodeURIComponent(n), // preserve case (packages are uppercase)
});

/**
 * Typed package operations which are not CRUD-shaped. The discovery document
 * advertises this as `/sap/bc/adt/packages/$tree{?packagename,type}`.
 */
export const packagesContract = contract({
  ...packageCrudContract,
  tree: (params: { packagename: string; type: 'sub' | 'super' }) =>
    http.get('/sap/bc/adt/packages/$tree', {
      query: params,
      responses: { 200: packagesV1 },
      headers: { Accept: 'application/vnd.sap.adt.packages.v2+xml' },
    }),
});

export type PackagesContract = typeof packagesContract;
export type PackagesSchema = typeof packagesV1;
