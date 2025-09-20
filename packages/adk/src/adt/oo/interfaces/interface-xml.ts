import {
  xml,
  root,
  namespace,
  name,
  element,
  toXML,
} from '../../../decorators/decorators-v2';
import { BaseXML } from '../../base/base-xml-v2';
import { OoXML } from '../oo-xml';
import { intf } from '../../../namespaces/intf';
import type { AdtCoreType, PackageRefType } from '../../../namespaces/adtcore';
import type { AbapOOType } from '../../../namespaces/abapoo';
import type {
  AbapSourceType,
  SyntaxConfigurationType,
} from '../../../namespaces/abapsource';
import type { AtomLinkType } from '../../../namespaces/atom';

/**
 * InterfaceXML - represents the XML form of an Interface object using v2 decorators.
 * Uses flat class structure with explicit parent-child relationships.
 * This is the XML representation layer - separate from the domain Interface class.
 */
@xml()
export class InterfaceXML extends OoXML {
  // Root element - using intf namespace decorator
  @root
  @intf
  @name('abapInterface')
  interface: any = {};

  // Backward compatibility getter for atomLinks
  get atomLinks(): AtomLinkType[] | undefined {
    return this.link;
  }

  // Backward compatibility getter for packageRef (it's part of core)
  get packageRef(): PackageRefType | undefined {
    return this.core.packageRef;
  }

  constructor(data: {
    core: AdtCoreType; // packageRef is already part of this
    oo: AbapOOType;
    source: AbapSourceType; // syntaxConfiguration is already part of this
    atomLinks?: AtomLinkType[];
  }) {
    // Call OoXML constructor (gets adtcore + abapsource + abapoo + atomLinks)
    super({
      core: data.core, // packageRef already included
      source: data.source, // syntaxConfiguration already included
      oo: data.oo,
      atomLinks: data.atomLinks,
    });
  }

  /**
   * Create InterfaceXML from Interface domain data
   */
  static fromInterface(interfaceData: {
    adtcore: AdtCoreType; // packageRef is part of this
    abapoo: AbapOOType;
    abapsource: AbapSourceType; // syntaxConfiguration is part of this
    links?: AtomLinkType[];
  }): InterfaceXML {
    return new InterfaceXML({
      core: interfaceData.adtcore, // packageRef already included
      oo: interfaceData.abapoo,
      source: interfaceData.abapsource, // syntaxConfiguration already included
      atomLinks: interfaceData.links,
    });
  }

  /**
   * Parse XML string to InterfaceXML (simplified version)
   */
  static fromXMLString(xml: string): InterfaceXML {
    // Use BaseXML's shared parsing infrastructure
    const parsed = BaseXML.parseXMLString(xml);
    const root = parsed['intf:abapInterface'];

    // Parse basic attributes using BaseXML methods
    const coreAttributes = BaseXML.parseAdtCoreAttributes(root);
    const atomLinks = BaseXML.parseAtomLinks(root);

    // Parse packageRef element (part of adtcore namespace)
    let packageRef: PackageRefType | undefined;
    const packageRefData = root['adtcore:packageRef'];
    if (packageRefData) {
      packageRef = {
        uri: packageRefData['@_adtcore:uri'],
        type: packageRefData['@_adtcore:type'] as 'DEVC/K',
        name: packageRefData['@_adtcore:name'],
      };
    }

    // Combine core attributes and elements
    const core: AdtCoreType = { ...coreAttributes, packageRef };

    // Parse interface-specific abapoo attributes
    const oo: AbapOOType = {
      modeled: root['@_abapoo:modeled'] === 'true',
    };

    // Parse syntax configuration
    let syntaxConfiguration: SyntaxConfigurationType | undefined;
    const syntaxConfigData = root['abapsource:syntaxConfiguration'];
    if (syntaxConfigData && syntaxConfigData['abapsource:language']) {
      const languageData = syntaxConfigData['abapsource:language'];
      syntaxConfiguration = {
        language: {
          version: parseInt(languageData['abapsource:version']) || 5,
          description: languageData['abapsource:description'] || '',
        },
      };
    }

    // Parse abapsource attributes and include syntaxConfiguration
    const source: AbapSourceType = {
      sourceUri: root['@_abapsource:sourceUri'],
      fixPointArithmetic: root['@_abapsource:fixPointArithmetic'] === 'true',
      activeUnicodeCheck: root['@_abapsource:activeUnicodeCheck'] === 'true',
      syntaxConfiguration, // Include syntaxConfiguration in source
    };

    return new InterfaceXML({
      core, // packageRef already included
      oo,
      source, // syntaxConfiguration already included
      atomLinks,
    });
  }

  // Convert to ADK object interface for compatibility
  toAdkObject() {
    return {
      kind: 'Interface' as const,
      name: this.core.name,
      type: this.core.type,
      description: this.core.description,
    };
  }
}
