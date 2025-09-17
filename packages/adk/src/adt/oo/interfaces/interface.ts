import { AdtObject } from '../../base/adt-object';
import { AdtCoreAttributes } from '../../namespaces/adtcore';
import {
  AbapSourceAttributes,
  SyntaxConfiguration,
} from '../../namespaces/abapsource';
import { AtomLink } from '../../namespaces/atom';
import { Kind } from '../../kind';
import { XMLBuilder } from 'fast-xml-parser';
import { $attr, $xmlns, $namespaces } from 'fxmlp';
import { XmlUtils } from '../../base/xml-utils';
import { InterfaceInput } from '../../base/adt-object-input';
import { intf, adtcore, abapsource, atom } from '../../namespaces';

/**
 * Interface-specific sections
 */
export interface InterfaceSections {
  sourceMain?: string; // Content from source/main endpoint
  syntaxConfiguration?: SyntaxConfiguration;
}

/**
 * ABAP Interface ADT object with proper TypeScript types
 */
export class Interface extends AdtObject<InterfaceSections, Kind.Interface> {
  private abapoo: { modeled: boolean };
  private abapsource: AbapSourceAttributes;

  constructor(input: InterfaceInput) {
    super({
      adtcore: input.adtcore,
      sections: input.sections || {},
      kind: Kind.Interface,
    });
    this.abapoo = input.abapoo || { modeled: false };
    this.abapsource = input.abapsource || { sourceUri: 'source/main' };
  }

  /**
   * Static factory method for easier object creation
   */
  static create(input: InterfaceInput): Interface {
    return new Interface(input);
  }

  // ABAP-specific getters
  get sourceUri(): string {
    return this.abapsource.sourceUri;
  }
  get isModeled(): boolean {
    return this.abapoo.modeled;
  }
  get fixPointArithmetic(): boolean | undefined {
    return this.abapsource.fixPointArithmetic;
  }
  get activeUnicodeCheck(): boolean | undefined {
    return this.abapsource.activeUnicodeCheck;
  }

  // Source management
  getSourceMain(): string | undefined {
    return this.sections.sourceMain;
  }

  setSourceMain(source: string): void {
    this.sections = { ...this.sections, sourceMain: source };
  }

  // XML builder instance
  private static xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
    attributeValueProcessor: (name: string, val: any) => {
      // Ensure boolean values are always rendered as "true"/"false" strings
      if (typeof val === 'boolean') {
        return val ? 'true' : 'false';
      }
      return val;
    },
  });

  // XML serialization using fxmlp
  toAdtXml(): string {
    const xmlObject = intf({
      abapInterface: {
        ...$attr({
          // Interface attributes (use abapoo namespace for modeled)
          'abapoo:modeled': this.abapoo.modeled ? 'true' : 'false',
          // ADT Core attributes
          ...XmlUtils.serializeAdtCoreAttributes(adtcore, this),
          // ABAP Source attributes
          ...abapsource({
            sourceUri: this.sourceUri,
            ...(this.fixPointArithmetic !== undefined && {
              fixPointArithmetic: String(this.fixPointArithmetic),
            }),
            ...(this.activeUnicodeCheck !== undefined && {
              activeUnicodeCheck: String(this.activeUnicodeCheck),
            }),
          }),
          // XML namespaces
          ...$xmlns({
            intf: 'http://www.sap.com/adt/oo/interfaces',
          }),
          ...XmlUtils.getCommonNamespaces(),
        }),

        // Package reference if exists
        ...(this.packageRef && XmlUtils.serializePackageRef(this.packageRef)),

        // Links
        ...XmlUtils.serializeAtomLinks(atom, this.links),

        // Syntax configuration if exists (using typed namespace function)
        ...(this.sections.syntaxConfiguration &&
          abapsource({
            syntaxConfiguration: {
              language: {
                version:
                  this.sections.syntaxConfiguration.language.version.toString(),
                description:
                  this.sections.syntaxConfiguration.language.description,
              },
            },
          })),
      },
    });

    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      Interface.xmlBuilder.build(xmlObject)
    );
  }

  // XML parsing
  static override fromAdtXml<U extends AdtObject<unknown, K>, K extends Kind>(
    xml: string,
    kind: K
  ): U {
    const parsed = AdtObject.parseXml(xml);
    const root = parsed['intf:abapInterface'] as any;

    // Parse adtcore attributes
    const adtcore = XmlUtils.parseAdtCoreAttributes(root);

    // Parse abapoo attributes
    const abapoo = {
      modeled: root['@_abapoo:modeled'] === 'true',
    };

    // Parse abapsource attributes
    const abapsource: AbapSourceAttributes = {
      sourceUri: root['@_abapsource:sourceUri'],
      fixPointArithmetic: root['@_abapsource:fixPointArithmetic'] === 'true',
      activeUnicodeCheck: root['@_abapsource:activeUnicodeCheck'] === 'true',
    };

    // Parse sections
    const sections: InterfaceSections = {};
    if (root['abapsource:syntaxConfiguration']) {
      const syntaxConfig = root['abapsource:syntaxConfiguration'];
      sections.syntaxConfiguration = {
        language: {
          version: parseInt(
            syntaxConfig['abapsource:language']['abapsource:version']
          ),
          description:
            syntaxConfig['abapsource:language']['abapsource:description'],
        },
      };
    }

    const intf = new this({
      adtcore,
      abapoo,
      abapsource,
      sections,
    });

    // Parse package reference
    intf.packageRef = XmlUtils.parsePackageRef(root);

    // Parse atom links
    intf.links = XmlUtils.parseAtomLinks(root);

    // Type assertion to handle the generic return type
    return intf as unknown as U;

    return intf;
  }
}
