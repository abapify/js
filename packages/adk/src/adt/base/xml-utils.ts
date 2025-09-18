import { $attr, $xmlns } from 'fxmlp';
import { AdtCoreType, PackageRefType } from '../../namespaces/adtcore.js';
import { AtomLinkType } from '../../namespaces/atom.js';

/**
 * Type for fxmlp namespace function
 */
type NamespaceFunction = (
  attributes: Record<string, unknown>
) => Record<string, unknown>;

/**
 * Type for parsed XML object with attributes
 */
type ParsedXmlObject = {
  [key: string]: unknown;
  [key: `@_${string}`]: string | undefined;
  'adtcore:packageRef'?: {
    '@_adtcore:uri': string;
    '@_adtcore:type': string;
    '@_adtcore:name': string;
  };
  'atom:link'?: XmlLinkObject | XmlLinkObject[];
};

/**
 * Type for XML link object
 */
type XmlLinkObject = {
  '@_href': string;
  '@_rel': string;
  '@_type'?: string;
  '@_title'?: string;
  '@_etag'?: string;
};

/**
 * Common XML serialization utilities for ADT objects
 */
export class XmlUtils {
  /**
   * Generate ADT core attributes for XML serialization
   */
  static serializeAdtCoreAttributes(
    adtcore: NamespaceFunction,
    attributes: AdtCoreAttributes
  ) {
    return adtcore({
      name: attributes.name,
      type: attributes.type,
      ...(attributes.description && { description: attributes.description }),
      ...(attributes.language && { language: attributes.language }),
      ...(attributes.masterLanguage && {
        masterLanguage: attributes.masterLanguage,
      }),
      ...(attributes.responsible && { responsible: attributes.responsible }),
      ...(attributes.changedBy && { changedBy: attributes.changedBy }),
      ...(attributes.createdBy && { createdBy: attributes.createdBy }),
      ...(attributes.changedAt && {
        changedAt: attributes.changedAt.toISOString(),
      }),
      ...(attributes.createdAt && {
        createdAt: attributes.createdAt.toISOString(),
      }),
      ...(attributes.version && { version: attributes.version }),
      ...(attributes.masterSystem && { masterSystem: attributes.masterSystem }),
      ...(attributes.abapLanguageVersion && {
        abapLanguageVersion: attributes.abapLanguageVersion,
      }),
    });
  }

  /**
   * Generate package reference XML structure
   */
  static serializePackageRef(packageRef: PackageRef) {
    return {
      'adtcore:packageRef': {
        ...$attr({
          'adtcore:uri': packageRef.uri,
          'adtcore:type': packageRef.type,
          'adtcore:name': packageRef.name,
        }),
      },
    };
  }

  /**
   * Generate atom links XML structure
   */
  static serializeAtomLinks(atom: NamespaceFunction, links: AtomLink[]) {
    if (links.length === 0) return {};

    return links.length === 1
      ? {
          'atom:link': {
            ...$attr({
              href: links[0].href,
              rel: links[0].rel,
              ...(links[0].type && { type: links[0].type }),
              ...(links[0].title && { title: links[0].title }),
              ...(links[0].etag && { etag: links[0].etag }),
            }),
          },
        }
      : {
          'atom:link': links.map((link) => ({
            ...$attr({
              href: link.href,
              rel: link.rel,
              ...(link.type && { type: link.type }),
              ...(link.title && { title: link.title }),
              ...(link.etag && { etag: link.etag }),
            }),
          })),
        };
  }

  /**
   * Generate common XML namespaces
   */
  static getCommonNamespaces() {
    return $xmlns({
      adtcore: 'http://www.sap.com/adt/core',
      atom: 'http://www.w3.org/2005/Atom',
      abapsource: 'http://www.sap.com/adt/abapsource',
      abapoo: 'http://www.sap.com/adt/oo',
    });
  }

  /**
   * Parse ADT core attributes from XML
   */
  static parseAdtCoreAttributes(root: ParsedXmlObject): AdtCoreAttributes {
    return {
      name: root['@_adtcore:name'] as string,
      type: root['@_adtcore:type'] as string,
      description: root['@_adtcore:description'],
      language: root['@_adtcore:language'],
      masterLanguage: root['@_adtcore:masterLanguage'],
      responsible: root['@_adtcore:responsible'],
      changedBy: root['@_adtcore:changedBy'],
      createdBy: root['@_adtcore:createdBy'],
      changedAt: root['@_adtcore:changedAt']
        ? new Date(root['@_adtcore:changedAt'])
        : undefined,
      createdAt: root['@_adtcore:createdAt']
        ? new Date(root['@_adtcore:createdAt'])
        : undefined,
      version: root['@_adtcore:version'] as 'active' | 'inactive' | undefined,
      masterSystem: root['@_adtcore:masterSystem'],
      abapLanguageVersion: root['@_adtcore:abapLanguageVersion'],
    };
  }

  /**
   * Parse package reference from XML
   */
  static parsePackageRef(root: ParsedXmlObject): PackageRef | undefined {
    if (!root['adtcore:packageRef']) return undefined;

    const pkgRef = root['adtcore:packageRef'];
    return {
      uri: pkgRef['@_adtcore:uri'],
      type: pkgRef['@_adtcore:type'] as 'DEVC/K',
      name: pkgRef['@_adtcore:name'],
    };
  }

  /**
   * Parse atom links from XML
   */
  static parseAtomLinks(root: ParsedXmlObject): AtomLink[] {
    if (!root['atom:link']) return [];

    const links = Array.isArray(root['atom:link'])
      ? root['atom:link']
      : [root['atom:link']].filter(Boolean);

    return links.map((link: XmlLinkObject) => ({
      href: link['@_href'],
      rel: link['@_rel'],
      type: link['@_type'],
      title: link['@_title'],
      etag: link['@_etag'],
    }));
  }
}
