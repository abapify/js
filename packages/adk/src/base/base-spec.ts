import { xml, attributes, namespace, element, toSerializationData, toFastXMLObject } from '../decorators';
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
      uri: root['@_adtcore:uri'],
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
   * Extract and unwrap namespace from parsed XML object
   * Recursively strips ALL namespace prefixes from elements and attributes
   *
   * @param prefix - Primary namespace prefix to extract (e.g., 'pak', 'adtcore')
   * @param obj - Parsed XML object from fast-xml-parser
   * @returns Plain object with ALL namespace prefixes stripped from ALL keys
   */
  protected static extractNamespace(prefix: string, obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.extractNamespace(prefix, item));
    }

    const result: any = {};
    const nsPrefix = `${prefix}:`;
    const attrPrefix = `@_${prefix}:`;

    for (const [key, value] of Object.entries(obj)) {
      // Skip namespace declarations
      if (key.startsWith('@_xmlns')) continue;

      let newKey = key;
      let includeKey = false;

      // Strip primary namespace attribute prefix (@_pak:name -> name)
      if (key.startsWith(attrPrefix)) {
        newKey = key.substring(attrPrefix.length);
        includeKey = true;
      }
      // Strip primary namespace element prefix (pak:attributes -> attributes)
      else if (key.startsWith(nsPrefix)) {
        newKey = key.substring(nsPrefix.length);
        includeKey = true;
      }
      // Strip ALL other namespace prefixes (@_anyNamespace:name -> name, anyNs:element -> element)
      else if (key.startsWith('@_')) {
        // Attribute from any namespace: @_namespace:attrName -> attrName
        const attrMatch = key.match(/^@_[^:]+:(.+)$/);
        if (attrMatch) {
          newKey = attrMatch[1]; // Strip @_namespace: prefix
          includeKey = true;
        }
      }
      else if (key.includes(':')) {
        // Element from any namespace: namespace:element -> element
        const colonIndex = key.indexOf(':');
        newKey = key.substring(colonIndex + 1);
        includeKey = true;
      }

      if (includeKey) {
        // Recursively process the value
        result[newKey] = this.extractNamespace(prefix, value);
      }
    }

    return result;
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
