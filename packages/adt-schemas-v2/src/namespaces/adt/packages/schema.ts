/**
 * SAP Package namespace schemas (Technical - matches XML structure)
 *
 * Namespace: http://www.sap.com/adt/packages
 * Prefix: pak
 * Content-Type: application/vnd.sap.adt.packages.v1+xml
 */

import {
  createNamespace,
  parse,
  build,
  type InferSchema,
} from '../../../base/namespace';
import { adtcore, AdtCoreObjectFields } from '../core/schema';
import { atom, AtomLinkSchema } from '../../atom/schema';

/**
 * Package namespace object
 */
export const pak = createNamespace({
  uri: 'http://www.sap.com/adt/packages',
  prefix: 'pak',
});

/**
 * Package attributes schema (pak:attributes)
 */
export const PackageAttributesSchema = pak.schema({
  tag: 'pak:attributes',
  fields: {
    packageType: pak.attr('packageType'),
    isPackageTypeEditable: pak.attr('isPackageTypeEditable'),
    isAddingObjectsAllowed: pak.attr('isAddingObjectsAllowed'),
    isAddingObjectsAllowedEditable: pak.attr('isAddingObjectsAllowedEditable'),
    isEncapsulated: pak.attr('isEncapsulated'),
    isEncapsulationEditable: pak.attr('isEncapsulationEditable'),
    isEncapsulationVisible: pak.attr('isEncapsulationVisible'),
    recordChanges: pak.attr('recordChanges'),
    isRecordChangesEditable: pak.attr('isRecordChangesEditable'),
    isSwitchVisible: pak.attr('isSwitchVisible'),
    languageVersion: pak.attr('languageVersion'),
    isLanguageVersionVisible: pak.attr('isLanguageVersionVisible'),
    isLanguageVersionEditable: pak.attr('isLanguageVersionEditable'),
  },
} as const);

/**
 * Super package schema
 */
export const PackageSuperPackageSchema = pak.schema({
  tag: 'pak:superPackage',
  fields: {
    name: adtcore.attr('name'),
    uri: adtcore.attr('uri'),
    type: adtcore.attr('type'),
  },
} as const);

/**
 * Application component schema
 */
export const PackageApplicationComponentSchema = pak.schema({
  tag: 'pak:applicationComponent',
  fields: {
    name: pak.attr('name'),
    description: pak.attr('description'),
    isVisible: pak.attr('isVisible'),
    isEditable: pak.attr('isEditable'),
  },
} as const);

/**
 * Complete Package schema (Technical - matches XML structure)
 */
export const PackageSchema = pak.schema({
  tag: 'pak:package',
  ns: {
    pak: pak.uri,
    adtcore: adtcore.uri,
    atom: atom.uri,
  },
  fields: {
    // ADT core attributes (flat)
    ...AdtCoreObjectFields,

    // Atom links
    links: {
      kind: 'elems' as const,
      name: 'atom:link',
      schema: AtomLinkSchema,
    },

    // Package-specific elements (nested)
    attributes: pak.elem('attributes', PackageAttributesSchema),
    superPackage: pak.elem('superPackage', PackageSuperPackageSchema),
    applicationComponent: pak.elem(
      'applicationComponent',
      PackageApplicationComponentSchema
    ),
  },
} as const);

/**
 * Technical type (generated from schema - matches XML structure)
 * Use this for direct XML manipulation
 */
export type PackageXml = InferSchema<typeof PackageSchema>;

/**
 * Parse XML to technical type
 */
export function parsePackageXml(xml: string): PackageXml {
  return parse(PackageSchema, xml);
}

/**
 * Build XML from technical type
 */
export function buildPackageXml(
  data: PackageXml,
  options?: { xmlDecl?: boolean }
): string {
  return build(PackageSchema, data, options);
}
