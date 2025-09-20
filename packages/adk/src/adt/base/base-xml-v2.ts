import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { xml, toXML } from '../../decorators/decorators-v2';
import { adtcore } from '../../namespaces/adtcore';
import { atom } from '../../namespaces/atom';
import type { AdtCoreType } from '../../namespaces/adtcore';
import type { AtomLinkType } from '../../namespaces/atom';

/**
 * BaseXML - Foundation for ALL ADT XML objects
 * Provides common ADT Core attributes and Atom links
 * Following the ADT XML Architecture Specification
 */
@xml()
export abstract class BaseXML {
  // ADT Core attributes (on root element)
  @adtcore
  core: AdtCoreType;

  // Atom links (child elements)
  @atom
  link?: AtomLinkType[];

  constructor(data: { core: AdtCoreType; atomLinks?: AtomLinkType[] }) {
    this.core = data.core;
    this.link = data.atomLinks || [];
  }

  // Serialize to XML string
  toXMLString(): string {
    const xmlObj = toXML(this);
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true,
      suppressBooleanAttributes: false,
    });
    return '<?xml version="1.0" encoding="UTF-8"?>' + builder.build(xmlObj);
  }

  // Parse XML string to object
  static parseXMLString(xml: string): any {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: false,
      trimValues: true,
    });
    return parser.parse(xml);
  }

  // Parse ADT Core attributes from XML root
  static parseAdtCoreAttributes(root: any): AdtCoreType {
    return {
      name: root['@_adtcore:name'],
      type: root['@_adtcore:type'],
      description: root['@_adtcore:description'],
      language: root['@_adtcore:language'],
      masterLanguage: root['@_adtcore:masterLanguage'],
      responsible: root['@_adtcore:responsible'],
      changedBy: root['@_adtcore:changedBy'],
      createdBy: root['@_adtcore:createdBy'],
      version: root['@_adtcore:version'],
      masterSystem: root['@_adtcore:masterSystem'],
      abapLanguageVersion: root['@_adtcore:abapLanguageVersion'],
      descriptionTextLimit: root['@_adtcore:descriptionTextLimit']
        ? parseInt(root['@_adtcore:descriptionTextLimit'])
        : undefined,
    };
  }

  // Parse Atom links from XML
  static parseAtomLinks(root: any): AtomLinkType[] {
    const links = root['atom:link'];
    if (!links) return [];

    const linkArray = Array.isArray(links) ? links : [links];
    return linkArray.map((link: any) => ({
      href: link.href,
      rel: link.rel,
      type: link.type,
      title: link.title,
      etag: link.etag,
    }));
  }
}
