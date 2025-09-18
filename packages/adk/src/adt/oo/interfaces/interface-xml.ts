import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { XMLRoot, attributes, toXML } from '../../../decorators';
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
import {
  XMLParsedHelpers,
  type ExtractXMLTypeWithSchema,
  type AttrSchema,
  type ElemSchema,
  type SyntaxConfigurationSchema,
} from '../../../decorators/type-inference.js';

/**
 * Local schema definition for InterfaceXML
 * Much cleaner than global module augmentation!
 */
type InterfaceXMLSchema = {
  // Attributes - much shorter!
  core: AttrSchema<'adtcore'>;
  oo: AttrSchema<'abapoo'>;
  source: AttrSchema<'abapsource'>;

  // Simple elements - concise!
  atomLinks: ElemSchema<'atom', 'link'>;
  packageRef: ElemSchema<'adtcore', 'packageRef'>;

  // Complex reusable schema - one line!
  syntaxConfiguration: SyntaxConfigurationSchema;
};

/**
 * InterfaceXML - represents the XML form of an Interface object.
 * Handles serialization to XML and parsing from XML.
 * This is the XML representation layer - separate from the domain Interface class.
 */

@XMLRoot('intf:abapInterface')
export class InterfaceXML {
  // Properties with decorators for runtime XML handling
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
  atomLinks?: AtomLinkType[];

  // Optional elements
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
    // ✅ PROPER: Normal type-safe assignments - no casting needed!
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
    attributeValueProcessor: (name: string, val: unknown) => {
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
   * Uses schema-generated InterfaceXMLParsedType for type safety
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
          href: link['@_href'] || link['@_atom:href'], // ✅ Handle both formats: with/without namespace prefix
          rel: link['@_rel'] || link['@_atom:rel'], // ✅ Handle both formats: with/without namespace prefix
          type: link['@_type'] || link['@_atom:type'], // ✅ Handle both formats: with/without namespace prefix
          title: link['@_title'] || link['@_atom:title'], // ✅ Handle both formats: with/without namespace prefix
          etag: link['@_etag'] || link['@_atom:etag'], // ✅ Handle both formats: with/without namespace prefix
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

/**
 * Automatically generated XML parsed type from the local schema
 * Clean, explicit, and no global pollution!
 */
export type InterfaceXMLParsedType = ExtractXMLTypeWithSchema<
  InterfaceXML,
  InterfaceXMLSchema
>;

/**
 * Type-safe helpers for parsing string values
 */
export const InterfaceXMLParsed = XMLParsedHelpers;
