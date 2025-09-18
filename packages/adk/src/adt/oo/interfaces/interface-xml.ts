import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { XMLRoot, attributes, toXML } from '../../../decorators/index.js';
import { adtcore } from '../../../namespaces/adtcore.js';
import { abapoo } from '../../../namespaces/abapoo.js';
import { abapsource } from '../../../namespaces/abapsource.js';
import { atom } from '../../../namespaces/atom.js';
import type { AdtCoreType } from '../../../namespaces/adtcore.js';
import type { AbapOOType } from '../../../namespaces/abapoo.js';
import type {
  AbapSourceType,
  SyntaxConfigurationType,
} from '../../../namespaces/abapsource.js';
import type { AtomLinkType } from '../../../namespaces/atom.js';
import type { PackageRefType } from '../../../namespaces/adtcore.js';
import type { InterfaceXMLParsedType } from './interface-xml-types.js';
import { InterfaceXMLParsed } from './interface-xml-types.js';

/**
 * InterfaceXML - represents the XML form of an Interface object.
 * Handles serialization to XML and parsing from XML.
 * This is the XML representation layer - separate from the domain Interface class.
 */

@XMLRoot('intf:abapInterface')
export class InterfaceXML {
  @adtcore
  @attributes
  core: AdtCoreType;

  @abapoo
  @attributes
  oo: AbapOOType;

  @abapsource
  @attributes
  source: AbapSourceType;

  @atom
  atomLinks: AtomLinkType[];

  @adtcore
  packageRef?: PackageRefType;

  @abapsource
  syntaxConfiguration?: SyntaxConfigurationType;

  constructor(data: {
    core: AdtCoreType;
    oo: AbapOOType;
    source: AbapSourceType;
    atomLinks?: AtomLinkType[];
    packageRef?: PackageRefType;
    syntaxConfiguration?: SyntaxConfigurationType;
  }) {
    this.core = data.core;
    this.oo = data.oo;
    this.source = data.source;
    this.atomLinks = data.atomLinks || [];
    this.packageRef = data.packageRef;
    this.syntaxConfiguration = data.syntaxConfiguration;
  }
  private static xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
    attributeValueProcessor: (name: string, val: any) => {
      if (typeof val === 'boolean') {
        return val ? 'true' : 'false';
      }
      return val;
    },
  });

  /**
   * Create InterfaceXML from Interface domain data
   */
  static fromInterface(interfaceData: {
    adtcore: AdtCoreType;
    abapoo: AbapOOType;
    abapsource: AbapSourceType;
    links?: AtomLinkType[];
    packageRef?: PackageRefType;
    syntaxConfiguration?: SyntaxConfigurationType;
  }): InterfaceXML {
    return new InterfaceXML({
      core: interfaceData.adtcore,
      oo: interfaceData.abapoo,
      source: interfaceData.abapsource,
      atomLinks: interfaceData.links,
      packageRef: interfaceData.packageRef,
      syntaxConfiguration: interfaceData.syntaxConfiguration,
    });
  }

  /**
   * Serialize this InterfaceXML to ADT XML string
   */
  toXMLString(): string {
    // Generate XML object using decorator system
    const xmlObject = toXML(this);

    // Convert to XML string
    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      InterfaceXML.xmlBuilder.build(xmlObject)
    );
  }

  /**
   * Parse ADT XML string to InterfaceXML instance
   * Now with full type safety using InterfaceXMLParsedType!
   */
  static fromXMLString(xml: string): InterfaceXML {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: false,
      allowBooleanAttributes: false,
    });

    const parsed = parser.parse(xml);
    const root = parsed['intf:abapInterface'] as InterfaceXMLParsedType;

    // Parse ADT Core attributes with full type safety
    const adtcore: AdtCoreType = {
      name: root['@_adtcore:name'], // ✅ Type-safe: string
      type: root['@_adtcore:type'], // ✅ Type-safe: string
      description: root['@_adtcore:description'], // ✅ Type-safe: string | undefined
      responsible: root['@_adtcore:responsible'], // ✅ Type-safe: string | undefined
      masterLanguage: root['@_adtcore:masterLanguage'], // ✅ Type-safe: string | undefined
      masterSystem: root['@_adtcore:masterSystem'], // ✅ Type-safe: string | undefined
      abapLanguageVersion: root['@_adtcore:abapLanguageVersion'], // ✅ Type-safe: string | undefined
      changedAt: InterfaceXMLParsed.parseDate(root['@_adtcore:changedAt']), // ✅ Type-safe date parsing
      createdAt: InterfaceXMLParsed.parseDate(root['@_adtcore:createdAt']), // ✅ Type-safe date parsing
      changedBy: root['@_adtcore:changedBy'], // ✅ Type-safe: string | undefined
      createdBy: root['@_adtcore:createdBy'], // ✅ Type-safe: string | undefined
      version: InterfaceXMLParsed.parseVersion(root['@_adtcore:version']), // ✅ Type-safe version parsing
      descriptionTextLimit: InterfaceXMLParsed.parseNumber(
        root['@_adtcore:descriptionTextLimit']
      ), // ✅ Type-safe number parsing
      language: root['@_adtcore:language'], // ✅ Type-safe: string | undefined
    };

    // Parse ABAP OO attributes with type safety
    const abapoo: AbapOOType = {
      modeled: InterfaceXMLParsed.parseBoolean(root['@_abapoo:modeled']), // ✅ Type-safe boolean parsing
    };

    // Parse ABAP Source attributes with type safety
    const abapsource: AbapSourceType = {
      sourceUri: root['@_abapsource:sourceUri'], // ✅ Type-safe: string
      fixPointArithmetic: InterfaceXMLParsed.parseBoolean(
        root['@_abapsource:fixPointArithmetic']
      ), // ✅ Type-safe boolean parsing
      activeUnicodeCheck: InterfaceXMLParsed.parseBoolean(
        root['@_abapsource:activeUnicodeCheck']
      ), // ✅ Type-safe boolean parsing
    };

    // Parse package reference with type safety
    let packageRef: PackageRefType | undefined;
    const packageRefData = root['adtcore:packageRef']; // ✅ Type-safe: packageRef structure | undefined
    if (packageRefData) {
      packageRef = {
        uri: packageRefData['@_adtcore:uri'], // ✅ Type-safe: string
        type: packageRefData['@_adtcore:type'] as 'DEVC/K', // ✅ Type-safe: string -> 'DEVC/K'
        name: packageRefData['@_adtcore:name'], // ✅ Type-safe: string
      };
    }

    // Parse atom links with full type safety
    let links: AtomLinkType[] | undefined;
    const atomLinks = root['atom:link']; // ✅ Type-safe: Array<{...}> | undefined
    if (atomLinks) {
      const linksArray = Array.isArray(atomLinks) ? atomLinks : [atomLinks];
      links = linksArray
        .map((link) => ({
          href: link['@_href'], // ✅ Real SAP format: no namespace prefix in attributes
          rel: link['@_rel'], // ✅ Real SAP format: no namespace prefix in attributes
          type: link['@_type'], // ✅ Real SAP format: no namespace prefix in attributes
          title: link['@_title'], // ✅ Real SAP format: no namespace prefix in attributes
          etag: link['@_etag'], // ✅ Real SAP format: no namespace prefix in attributes
        }))
        .filter((link) => link.href); // ✅ Type-safe filtering
    }

    // Parse syntax configuration with full type safety
    let syntaxConfiguration: SyntaxConfigurationType | undefined;
    const syntaxConfig = root['abapsource:syntaxConfiguration']; // ✅ Type-safe: complex nested structure | undefined
    if (syntaxConfig) {
      const language = syntaxConfig['abapsource:language'];
      if (language) {
        const parserLink = language['atom:link'];
        syntaxConfiguration = {
          language: {
            version: parseInt(language['abapsource:version']), // ✅ Type-safe: string to number
            description: language['abapsource:description'], // ✅ Type-safe: string
            parserLink: parserLink
              ? {
                  href: parserLink['@_href'], // ✅ Real SAP format: no namespace prefix
                  rel: parserLink['@_rel'], // ✅ Real SAP format: no namespace prefix
                  type: parserLink['@_type'], // ✅ Real SAP format: no namespace prefix
                  title: parserLink['@_title'], // ✅ Real SAP format: no namespace prefix
                  etag: parserLink['@_etag'], // ✅ Real SAP format: no namespace prefix
                }
              : undefined,
          },
        };
      }
    }

    return new InterfaceXML({
      core: adtcore,
      oo: abapoo,
      source: abapsource,
      atomLinks: links,
      packageRef: packageRef,
      syntaxConfiguration: syntaxConfiguration,
    });
  }
}
