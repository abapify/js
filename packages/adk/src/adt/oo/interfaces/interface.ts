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

const { intf, adtcore, abapsource, atom } = $namespaces([
  ['intf', { recursive: true }],
  'adtcore',
  'abapsource',
  'atom',
]);

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

  constructor(
    adtcore: AdtCoreAttributes,
    abapoo: { modeled: boolean },
    abapsource: AbapSourceAttributes,
    sections: InterfaceSections = {}
  ) {
    super(adtcore, sections, Kind.Interface);
    this.abapoo = abapoo;
    this.abapsource = abapsource;
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
    const xmlObject = {
      'intf:abapInterface': {
        ...$attr({
          // Interface attributes
          ...intf({
            modeled: this.abapoo.modeled ? 'true' : 'false',
          }),
          // ADT Core attributes
          ...adtcore({
            name: this.name,
            type: this.type,
            ...(this.description && { description: this.description }),
            ...(this.language && { language: this.language }),
            ...(this.masterLanguage && { masterLanguage: this.masterLanguage }),
            ...(this.responsible && { responsible: this.responsible }),
            ...(this.changedBy && { changedBy: this.changedBy }),
            ...(this.createdBy && { createdBy: this.createdBy }),
            ...(this.changedAt && { changedAt: this.changedAt.toISOString() }),
            ...(this.createdAt && { createdAt: this.createdAt.toISOString() }),
            ...(this.version && { version: this.version }),
          }),
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
            abapsource: 'http://www.sap.com/adt/abapsource',
            adtcore: 'http://www.sap.com/adt/core',
            atom: 'http://www.w3.org/2005/Atom',
            abapoo: 'http://www.sap.com/adt/oo/adtcore',
          }),
        }),

        // Package reference if exists
        ...(this.packageRef && {
          'adtcore:packageRef': {
            ...$attr({
              'adtcore:uri': this.packageRef.uri,
              'adtcore:type': this.packageRef.type,
              'adtcore:name': this.packageRef.name,
            }),
          },
        }),

        // Links
        ...(this.links.length > 0 && {
          'atom:link': this.links.map((link) => ({
            ...$attr({
              href: link.href,
              rel: link.rel,
              ...(link.type && { type: link.type }),
              ...(link.title && { title: link.title }),
              ...(link.etag && { etag: link.etag }),
            }),
          })),
        }),

        // Syntax configuration if exists
        ...(this.sections.syntaxConfiguration && {
          'abapsource:syntaxConfiguration': {
            'abapsource:language': {
              'abapsource:version':
                this.sections.syntaxConfiguration.language.version.toString(),
              'abapsource:description':
                this.sections.syntaxConfiguration.language.description,
            },
          },
        }),
      },
    };

    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      Interface.xmlBuilder.build(xmlObject)
    );
  }

  // XML parsing
  static override fromAdtXml<
    U extends AdtObject<InterfaceSections, Kind.Interface>
  >(xml: string, kind: Kind.Interface): U {
    const parsed = AdtObject.parseXml(xml);
    const root = parsed['intf:abapInterface'] as any;

    // Parse adtcore attributes
    const adtcore: AdtCoreAttributes = {
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
      version: root['@_adtcore:version'],
    };

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

    const intf = new this(adtcore, abapoo, abapsource, sections);

    // Parse package reference
    if (root['adtcore:packageRef']) {
      const pkgRef = root['adtcore:packageRef'];
      intf.packageRef = {
        uri: pkgRef['@_adtcore:uri'],
        type: pkgRef['@_adtcore:type'],
        name: pkgRef['@_adtcore:name'],
      };
    }

    // Parse atom links
    const links = Array.isArray(root['atom:link'])
      ? root['atom:link']
      : [root['atom:link']].filter(Boolean);
    intf.links = links.map((link: any) => ({
      href: link['@_href'],
      rel: link['@_rel'],
      type: link['@_type'],
      title: link['@_title'],
      etag: link['@_etag'],
    }));

    // Type assertion to handle the generic return type
    return intf as unknown as U;

    return intf;
  }
}
