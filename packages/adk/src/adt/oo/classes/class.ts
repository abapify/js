import { AdtObject } from '../../base/adt-object';
import { Kind } from '../../kind';
import { AdtCoreAttributes } from '../../namespaces/adtcore';
import {
  AbapSourceAttributes,
  SyntaxConfiguration,
} from '../../namespaces/abapsource';
import { AtomLink } from '../../namespaces/atom';
import { XMLBuilder } from 'fast-xml-parser';
import { $attr, $xmlns, $namespaces } from 'fxmlp';

/**
 * Class-specific sections
 */
interface ClassSections {
  class: {
    final: boolean;
    abstract: boolean;
    visibility: 'public' | 'protected' | 'private';
    category: string;
    hasTests: boolean;
    sharedMemoryEnabled: boolean;
  };
  includes: ClassInclude[];
}

interface ClassInclude {
  includeType:
    | 'definitions'
    | 'implementations'
    | 'macros'
    | 'testclasses'
    | 'main';
  sourceUri: string;
  name: string;
  type: string;
  changedAt?: Date;
  version?: string;
  createdAt?: Date;
  changedBy?: string;
  createdBy?: string;
  links: AtomLink[];
}

/**
 * ABAP Class ADT object with proper TypeScript types
 */
export class Class extends AdtObject<ClassSections, Kind.Class> {
  private abapoo: { modeled: boolean };
  private abapsource: AbapSourceAttributes;

  constructor(
    adtcore: AdtCoreAttributes,
    abapoo: { modeled: boolean },
    abapsource: AbapSourceAttributes,
    sections: ClassSections
  ) {
    super(adtcore, sections, Kind.Class);
    this.abapoo = abapoo;
    this.abapsource = abapsource;
  }

  // ABAP-specific getters
  get sourceUri(): string | undefined {
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

  // Class-specific getters
  get final(): boolean {
    return this.sections.class.final;
  }
  get abstract(): boolean {
    return this.sections.class.abstract;
  }
  get visibility(): 'public' | 'protected' | 'private' {
    return this.sections.class.visibility;
  }
  get category(): string {
    return this.sections.class.category;
  }
  get hasTests(): boolean {
    return this.sections.class.hasTests;
  }
  get sharedMemoryEnabled(): boolean {
    return this.sections.class.sharedMemoryEnabled;
  }
  get includes(): ClassInclude[] {
    return this.sections.includes;
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

  // XML serialization using fxmlp + fast-xml-parser with manual namespace strings
  toAdtXml(): string {
    // Use $namespaces following the README pattern
    const {
      class: classNs,
      adtcore,
      abapsource,
      atom,
    } = $namespaces([
      ['class', { recursive: true }],
      'adtcore',
      'abapsource',
      'atom',
    ]);

    const xmlObject = {
      ...classNs({
        abapClass: {
          ...$attr({
            // Namespace attributes using namespace functions
            ...classNs({
              final: this.final ? 'true' : 'false',
              abstract: this.abstract ? 'true' : 'false',
              visibility: this.visibility,
            }),
            ...adtcore({
              responsible: this.responsible,
              masterLanguage: this.masterLanguage,
              masterSystem: this.masterSystem,
              name: this.name,
              type: this.type,
              changedAt: this.changedAt.toISOString(),
              version: this.version,
              createdAt: this.createdAt.toISOString(),
              changedBy: this.changedBy,
              createdBy: this.createdBy,
              description: this.description,
            }),
            ...abapsource({
              sourceUri: this.sourceUri,
              fixPointArithmetic: this.fixPointArithmetic ? 'true' : 'false',
            }),
            ...$xmlns({
              class: 'http://www.sap.com/adt/oo/classes',
              abapsource: 'http://www.sap.com/adt/abapsource',
              adtcore: 'http://www.sap.com/adt/core',
              atom: 'http://www.w3.org/2005/Atom',
            }),
          }),

          // Package reference if exists
          ...(this.packageRef && {
            ...adtcore({
              packageRef: {
                ...$attr({
                  uri: this.packageRef.uri,
                  type: this.packageRef.type,
                  name: this.packageRef.name,
                }),
              },
            }),
          }),

          // Links
          ...(this.links.length > 0 && {
            ...atom({
              link: this.links.map((link) => ({
                ...$attr({
                  href: link.href,
                  rel: link.rel,
                  ...(link.type && { type: link.type }),
                  ...(link.title && { title: link.title }),
                  ...(link.etag && { etag: link.etag }),
                }),
              })),
            }),
          }),

          // Class includes
          ...(this.sections.includes.length > 0 && {
            ...classNs({
              include: this.sections.includes.map((include) => ({
                ...$attr({
                  ...classNs({
                    includeType: include.includeType,
                  }),
                  ...adtcore({
                    name: include.name,
                    type: include.type,
                    ...(include.changedAt && {
                      changedAt: include.changedAt.toISOString(),
                    }),
                    ...(include.version && { version: include.version }),
                    ...(include.createdAt && {
                      createdAt: include.createdAt.toISOString(),
                    }),
                    ...(include.changedBy && { changedBy: include.changedBy }),
                    ...(include.createdBy && { createdBy: include.createdBy }),
                  }),
                  ...abapsource({
                    sourceUri: include.sourceUri,
                  }),
                }),
                // Include links for this include
                ...(include.links.length > 0 && {
                  ...atom({
                    link: include.links.map((link) => ({
                      ...$attr({
                        href: link.href,
                        rel: link.rel,
                        ...(link.type && { type: link.type }),
                        ...(link.title && { title: link.title }),
                        ...(link.etag && { etag: link.etag }),
                      }),
                    })),
                  }),
                }),
              })),
            }),
          }),
        },
      }),
    };

    return Class.xmlBuilder.build(xmlObject);
  }

  // XML parsing
  static override fromAdtXml<U extends AdtObject<ClassSections, Kind.Class>>(
    xml: string,
    kind: Kind.Class
  ): U {
    const parsed = AdtObject.parseXml(xml);
    const root = parsed['class:abapClass'] as any;

    // Parse adtcore attributes
    const adtcore: AdtCoreAttributes = {
      name: root['@_adtcore:name'],
      type: root['@_adtcore:type'],
      description: root['@_adtcore:description'],
      language: root['@_adtcore:language'],
      masterLanguage: root['@_adtcore:masterLanguage'],
      masterSystem: root['@_adtcore:masterSystem'],
      abapLanguageVersion: root['@_adtcore:abapLanguageVersion'],
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
      descriptionTextLimit: root['@_adtcore:descriptionTextLimit']
        ? parseInt(root['@_adtcore:descriptionTextLimit'])
        : undefined,
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

    // Parse class-specific attributes
    const classSection = {
      final: root['@_class:final'] === 'true',
      abstract: root['@_class:abstract'] === 'true',
      visibility: root['@_class:visibility'] as
        | 'public'
        | 'private'
        | 'protected',
      category: root['@_class:category'],
      hasTests: root['@_class:hasTests'] === 'true',
      sharedMemoryEnabled: root['@_class:sharedMemoryEnabled'] === 'true',
    };

    // Parse includes
    const includesArray = Array.isArray(root['class:include'])
      ? root['class:include']
      : root['class:include']
      ? [root['class:include']]
      : [];
    const includes: ClassInclude[] = includesArray.map((include: any) => {
      const includeLinks = Array.isArray(include['atom:link'])
        ? include['atom:link']
        : include['atom:link']
        ? [include['atom:link']]
        : [];

      return {
        includeType: include['@_class:includeType'] as
          | 'definitions'
          | 'implementations'
          | 'macros'
          | 'testclasses'
          | 'main',
        sourceUri: include['@_abapsource:sourceUri'],
        name: include['@_adtcore:name'],
        type: include['@_adtcore:type'],
        changedAt: include['@_adtcore:changedAt']
          ? new Date(include['@_adtcore:changedAt'])
          : undefined,
        version: include['@_adtcore:version'],
        createdAt: include['@_adtcore:createdAt']
          ? new Date(include['@_adtcore:createdAt'])
          : undefined,
        changedBy: include['@_adtcore:changedBy'],
        createdBy: include['@_adtcore:createdBy'],
        links: includeLinks.map((link: any) => ({
          href: link['@_href'],
          rel: link['@_rel'],
          type: link['@_type'],
          title: link['@_title'],
          etag: link['@_etag'],
        })),
      };
    });

    const sections: ClassSections = {
      class: classSection,
      includes,
    };

    const cls = new this(adtcore, abapoo, abapsource, sections);

    // Parse package reference
    if (root['adtcore:packageRef']) {
      const pkgRef = root['adtcore:packageRef'];
      cls.packageRef = {
        uri: pkgRef['@_uri'],
        type: pkgRef['@_type'],
        name: pkgRef['@_name'],
      };
    }

    // Parse atom links
    const links = Array.isArray(root['atom:link'])
      ? root['atom:link']
      : [root['atom:link']].filter(Boolean);
    cls.links = links.map((link: any) => ({
      href: link['@_href'],
      rel: link['@_rel'],
      type: link['@_type'],
      title: link['@_title'],
      etag: link['@_etag'],
    }));

    // Type assertion to handle the generic return type
    return cls as unknown as U;
  }
}
