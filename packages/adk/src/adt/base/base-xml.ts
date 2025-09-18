import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { XMLRoot, attributes, toXML } from '../../decorators';
import { adtcore } from '../../namespaces/adtcore.js';
import { abapsource } from '../../namespaces/abapsource.js';
import { atom } from '../../namespaces/atom.js';
import type { AdtCoreType } from '../../namespaces/adtcore.js';
import type { AbapSourceType } from '../../namespaces/abapsource.js';
import type { AtomLinkType } from '../../namespaces/atom.js';
import type { PackageRefType } from '../../namespaces/adtcore.js';

/**
 * BaseXML - Common XML infrastructure for all ADT objects
 * Handles fast-xml-parser configuration and common ADT attributes
 * Child classes focus only on their specific attribute mappings
 */
@XMLRoot('') // Will be overridden by child classes
export abstract class BaseXML {
  // Common ADT attributes - every SAP object has these
  @adtcore
  @attributes
  core: AdtCoreType;

  // Note: abapoo attributes moved to OoXML - not all ADT objects are OO objects

  @abapsource
  @attributes
  source: AbapSourceType;

  @atom
  atomLinks?: AtomLinkType[];

  @adtcore
  packageRef?: PackageRefType;

  constructor(data: {
    core: AdtCoreType;
    source: AbapSourceType;
    atomLinks?: AtomLinkType[];
    packageRef?: PackageRefType;
  }) {
    this.core = data.core;
    this.source = data.source;
    this.atomLinks = data.atomLinks || [];
    this.packageRef = data.packageRef;
  }

  // Shared XMLBuilder configuration - all ADT objects use the same settings
  protected static xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressBooleanAttributes: false,
    attributeValueProcessor: (name: string, val: any) => {
      if (typeof val === 'boolean') {
        return val ? 'true' : 'false';
      }
      return val;
    },
  });

  // Shared XMLParser configuration - all ADT objects use the same settings
  protected static xmlParser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: false,
    allowBooleanAttributes: false,
  });

  /**
   * Serialize this XML object to ADT XML string
   * Uses decorator system + fast-xml-parser
   */
  toXMLString(): string {
    // Generate XML object using decorator system
    const xmlObject = toXML(this);

    // Convert to XML string
    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      BaseXML.xmlBuilder.build(xmlObject)
    );
  }

  /**
   * Parse common ADT Core attributes from XML root
   * Used by child classes in their parsing logic
   */
  protected static parseAdtCoreAttributes(root: any): AdtCoreType {
    return {
      name: root['@_adtcore:name'],
      type: root['@_adtcore:type'],
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

  // Note: parseAbapOOAttributes moved to OoXML - not all ADT objects have OO attributes

  /**
   * Parse common ABAP Source attributes from XML root
   * Used by child classes in their parsing logic
   */
  protected static parseAbapSourceAttributes(root: any): AbapSourceType {
    return {
      sourceUri: root['@_abapsource:sourceUri'] || 'source/main',
      fixPointArithmetic: root['@_abapsource:fixPointArithmetic'] === 'true',
      activeUnicodeCheck: root['@_abapsource:activeUnicodeCheck'] === 'true',
    };
  }

  /**
   * Parse package reference from XML root
   * Used by child classes in their parsing logic
   */
  protected static parsePackageRef(root: any): PackageRefType | undefined {
    const packageRefData = root['adtcore:packageRef'];
    if (!packageRefData) return undefined;

    return {
      uri: packageRefData['@_adtcore:uri'],
      type: packageRefData['@_adtcore:type'] as 'DEVC/K',
      name: packageRefData['@_adtcore:name'],
    };
  }

  /**
   * Parse atom links from XML root
   * Used by child classes in their parsing logic
   */
  protected static parseAtomLinks(root: any): AtomLinkType[] {
    if (!root['atom:link']) return [];

    const linksArray = Array.isArray(root['atom:link'])
      ? root['atom:link']
      : [root['atom:link']];

    return linksArray.map((link) => ({
      href: link['@_href'] || link['@_atom:href'],
      rel: link['@_rel'] || link['@_atom:rel'],
      type: link['@_type'] || link['@_atom:type'],
      title: link['@_title'] || link['@_atom:title'],
      etag: link['@_etag'] || link['@_atom:etag'],
    }));
  }

  /**
   * Parse XML string using shared parser configuration
   * Used by child classes as starting point for their parsing
   */
  protected static parseXMLString(xml: string): any {
    return BaseXML.xmlParser.parse(xml);
  }
}
