import { xml, attributes, namespace, element } from 'xmld';
import { toSerializationData, toFastXMLObject } from 'xmld';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

import type { AdtCoreAttrs } from '../namespaces/adtcore';
import { AtomLink } from '../namespaces/atom';

/**
 * BaseSpec - Shared foundation for all ADT specification objects
 *
 * Uses xmld decorators for automatic XML parsing/serialization:
 * - ADT Core attributes (flattened on root)
 * - Atom links (child elements)
 * - Automatic parsing via decorators - NO MANUAL PARSING NEEDED!
 */
@xml
export abstract class BaseSpec {
  // ADT Core attributes (flattened on root)
  @attributes
  @namespace('adtcore', 'http://www.sap.com/adt/core')
  core!: AdtCoreAttrs;

  // Atom links (child elements)
  @namespace('atom', 'http://www.w3.org/2005/Atom')
  @element({ array: true, name: 'link' })
  links?: AtomLink[];

  /**
   * Serialize to XML string using xmld -> fast-xml-parser pipeline
   */
  toXMLString(pretty = true): string {
    const data = toSerializationData(this);
    const xmlObject = toFastXMLObject(data);

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: pretty,
      indentBy: '  ',
      suppressEmptyNode: true,
    });
    const xml = builder.build(xmlObject);
    return xml.startsWith('<?xml')
      ? xml
      : `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
  }

  /**
   * Shared XML parsing utilities - eliminates duplication across XML classes
   */
  static parseXMLToObject(xml: string): any {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false,
      trimValues: true,
      removeNSPrefix: false,
      parseTagValue: false,
      processEntities: true,
    });

    const cleanXml = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
    return parser.parse(cleanXml);
  }

  /**
   * Parse adtcore attributes from root (shared utility)
   */
  static parseAdtCoreAttributes(root: any): AdtCoreAttrs {
    return {
      name: root['@_adtcore:name'],
      type: root['@_adtcore:type'],
      version: root['@_adtcore:version'],
      description: root['@_adtcore:description'],
      descriptionTextLimit: root['@_adtcore:descriptionTextLimit'],
      language: root['@_adtcore:language'],
      masterLanguage: root['@_adtcore:masterLanguage'],
      masterSystem: root['@_adtcore:masterSystem'],
      abapLanguageVersion: root['@_adtcore:abapLanguageVersion'],
      responsible: root['@_adtcore:responsible'],
      changedBy: root['@_adtcore:changedBy'],
      createdBy: root['@_adtcore:createdBy'],
      changedAt: root['@_adtcore:changedAt'],
      createdAt: root['@_adtcore:createdAt'],
    };
  }

  /**
   * Parse atom links from root (shared utility)
   */
  static parseAtomLinks(root: any): AtomLink[] {
    const rawLinks = root['atom:link'];
    if (!rawLinks) return [];

    const linkArray = Array.isArray(rawLinks) ? rawLinks : [rawLinks];
    return linkArray.map((link: any) => {
      const atomLink = new AtomLink();
      atomLink.href = link['@_href'];
      atomLink.rel = link['@_rel'];
      atomLink.type = link['@_type'];
      atomLink.title = link['@_title'];
      atomLink.etag = link['@_etag'];
      return atomLink;
    });
  }

  /**
   * Generic fromXMLString method - subclasses should override with specific parsing
   */
  static fromXMLString<T extends BaseSpec>(this: new () => T, xml: string): T {
    throw new Error(
      `${this.name}.fromXMLString() must be implemented by subclass`
    );
  }
}
