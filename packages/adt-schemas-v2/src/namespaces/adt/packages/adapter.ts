/**
 * Package adapter - Transform between XML and Clean API types
 */

import { parsePackageXml, buildPackageXml, type PackageXml } from './schema';
import { type Package } from './types';
import { stringToBoolean, booleanToString } from '../../../base/adapters';
import { ADT_CONTENT_TYPES } from '../../../registry/content-types';
import { type SchemaAdapter } from '../../../registry/registry';

/**
 * Package adapter implementation
 */
export const PackageAdapter: SchemaAdapter<Package, PackageXml> = {
  contentType: ADT_CONTENT_TYPES.PACKAGE,

  fromXml(xml: string): Package {
    const xmlData = parsePackageXml(xml);
    return this.toClean(xmlData);
  },

  toXml(data: Package, options?: { xmlDecl?: boolean }): string {
    const xmlData = this.toXml(data);
    return buildPackageXml(xmlData, options);
  },

  toClean(xmlData: PackageXml): Package {
    return {
      name: xmlData.name,
      uri: xmlData.uri,
      type: xmlData.type,
      description: xmlData.description,
      packageType: xmlData.attributes?.packageType,
      isEncapsulated: stringToBoolean(xmlData.attributes?.isEncapsulated),
      superPackageName: xmlData.superPackage?.name,
      links: xmlData.links,
    };
  },

  toXml(cleanData: Package): PackageXml {
    return {
      name: cleanData.name,
      uri: cleanData.uri,
      attributes: {
        isEncapsulated: booleanToString(cleanData.isEncapsulated),
      },
      links: cleanData.links,
    };
  },
};
