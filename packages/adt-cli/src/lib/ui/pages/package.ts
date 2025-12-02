/**
 * Package Page
 *
 * Self-registering page for DEVC (package) objects.
 */

import { Section, Field, Box, adtLink, PackageLink } from '../components';
import { definePage } from '../router';
import AdtCorePage from './adt-core';

/**
 * Package type - matches packagesV1 schema response
 * TODO: Export proper type from adt-schemas-xsd when speci type inference is fixed
 */
export interface Package {
  name: string;
  type: string;
  description?: string;
  responsible?: string;
  attributes?: {
    packageType?: string;
    softwareComponent?: string;
    applicationComponent?: string;
    transportLayer?: string;
    isEncapsulated?: boolean;
  };
  superPackage?: { name?: string };
  transport?: {
    softwareComponent?: { name?: string };
    transportLayer?: { name?: string };
  };
  subPackages?: { packageRef?: Array<{ name?: string }> };
}

/**
 * Package Page Definition
 *
 * Self-registers with the router on import.
 */


export default definePage<Package>({
  type: 'DEVC',
  name: 'Package',
  icon: '📦',

  fetch: async (client, params) => {
    if (!params.name) throw new Error('Package name is required');
    const pkg = await client.adt.packages.get(params.name);
    return pkg as unknown as Package;
  },

  render: (pkg) => AdtCorePage(pkg, {
    icon: '📦',
    extra: Box(
      Section(
        'Package Attributes',
        Field('Package Type', pkg.attributes?.packageType),
        Field('Software Component', pkg.attributes?.softwareComponent || pkg.transport?.softwareComponent?.name),
        Field('Application Component', pkg.attributes?.applicationComponent),
        Field('Transport Layer', pkg.attributes?.transportLayer || pkg.transport?.transportLayer?.name),
        Field('Encapsulated', pkg.attributes?.isEncapsulated),
        Field('Super Package', adtLink(pkg.superPackage))
      ),
      Section(
        'Subpackages',
        ...((pkg.subPackages?.packageRef || [])
          .map(ref => ref.name)
          .filter((name): name is string => !!name)
          .map(name => PackageLink(name)))
      )
    ),
  }),
});
