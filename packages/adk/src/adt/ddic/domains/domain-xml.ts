import { XMLRoot, element } from '../../../decorators';
import { BaseXML } from '../../base/base-xml';
import { ddic } from '../../../namespaces/ddic';
import type { DdicType, DdicFixedValueType } from '../../../namespaces/ddic';
import type { AdtCoreType } from '../../../namespaces/adtcore';
import type { AbapSourceType } from '../../../namespaces/abapsource';
import type { AtomLinkType } from '../../../namespaces/atom';
import type { PackageRefType } from '../../../namespaces/adtcore';
import {
  XMLParsedHelpers,
  type ExtractXMLTypeWithSchema,
  type AttrSchema,
  type ElemSchema,
} from '../../../decorators/type-inference';

/**
 * Local schema definition for DomainXML
 * Must match the actual decorated structure
 */
type DomainXMLSchema = {
  // Attributes from BaseXML (on root element)
  core: AttrSchema<'adtcore'>;
  source: AttrSchema<'abapsource'>;

  // Elements from BaseXML (child elements)
  atomLinks: ElemSchema<'atom', 'link'>;
  packageRef: ElemSchema<'adtcore', 'packageRef'>;

  // DDIC domain content (child elements with ddic namespace)
  domain: ElemSchema<'ddic', 'domain'>;
};

/**
 * DomainXML - represents the XML form of a Domain object.
 * Extends BaseXML for shared ADT XML infrastructure.
 * This is the XML representation layer - separate from the domain Domain class.
 */
@XMLRoot('ddic:domain')
export class DomainXML extends BaseXML {
  // Single domain property containing ALL ddic content as child elements
  @ddic
  @element
  domain: DdicType;

  constructor(data: {
    core: AdtCoreType;
    domain: DdicType;
    atomLinks?: AtomLinkType[];
  }) {
    // Call BaseXML constructor (no abapsource - domains don't have source code)
    super({
      core: data.core,
      atomLinks: data.atomLinks,
    });

    // Set domain-specific properties
    this.domain = data.domain;
  }

  /**
   * Create DomainXML from Domain domain object
   */
  static fromDomain(data: {
    adtcore: AdtCoreType;
    domain: DdicType;
    links?: AtomLinkType[];
    packageRef?: PackageRefType;
  }): DomainXML {
    return new DomainXML({
      core: data.adtcore,
      domain: data.domain,
      atomLinks: data.links,
      packageRef: data.packageRef,
    });
  }

  /**
   * Parse XML string to DomainXML
   */
  static fromXMLString(xml: string): DomainXML {
    // Use BaseXML's shared parsing infrastructure
    const parsed = BaseXML.parseXMLString(xml);
    const root = parsed['ddic:domain'] as DomainXMLParsedType;

    // Use BaseXML's parsing helper for ADT Core attributes
    const adtcore = BaseXML.parseAdtCoreAttributes(root);

    // Note: No abapsource parsing - domains don't have source code attributes

    // Parse DDIC content from child elements (following our @ddic @element() domain pattern)
    // Each property of DdicType becomes a <ddic:propertyName> child element
    let fixedValues: DdicFixedValueType[] | undefined;
    const fixedValuesData = (root as any)['ddic:fixedValues'];
    if (fixedValuesData && fixedValuesData['ddic:fixedValue']) {
      const fixedValueElements = Array.isArray(
        fixedValuesData['ddic:fixedValue']
      )
        ? fixedValuesData['ddic:fixedValue']
        : [fixedValuesData['ddic:fixedValue']];

      fixedValues = fixedValueElements.map((fv: any) => ({
        lowValue: fv['ddic:lowValue'],
        highValue: fv['ddic:highValue'],
        description: fv['ddic:description'],
      }));
    }

    const domain: DdicType = {
      // Parse simple elements (primitives become <ddic:property>value</ddic:property>)
      dataType: (root as any)['ddic:dataType'],
      length: DomainXMLParsed.parseNumber((root as any)['ddic:length']),
      decimals: DomainXMLParsed.parseNumber((root as any)['ddic:decimals']),
      outputLength: DomainXMLParsed.parseNumber(
        (root as any)['ddic:outputLength']
      ),
      conversionExit: (root as any)['ddic:conversionExit'],
      valueTable: (root as any)['ddic:valueTable'],
      // Parse complex elements (arrays/objects become nested structure)
      fixedValues,
    };

    // Use BaseXML parsing helpers
    const packageRef = BaseXML.parsePackageRef(root as any);
    const links = BaseXML.parseAtomLinks(root as any);

    return new DomainXML({
      core: adtcore,
      domain,
      atomLinks: links,
      packageRef: packageRef,
    });
  }

  /**
   * Convert to AdkObject (legacy compatibility)
   */
  toAdkObject() {
    return {
      adtcore: this.core,
      domain: this.domain,
      links: this.atomLinks,
      packageRef: this.packageRef,
      fixedValues: this.domain.fixedValues,
    };
  }
}

// Export parsed type for use by consumers
export type DomainXMLParsedType = ExtractXMLTypeWithSchema<
  DomainXML,
  DomainXMLSchema
>;

/**
 * Type-safe helpers for parsing string values
 */
export const DomainXMLParsed = XMLParsedHelpers;
