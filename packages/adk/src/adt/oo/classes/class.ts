import { AdkBaseObject } from '../../base/adk-object.js';
import { AbapSourceType } from '../../../namespaces/abapsource.js';
import { AdtCoreType } from '../../../namespaces/adtcore.js';
import { AtomLinkType } from '../../../namespaces/atom.js';
import { Kind } from '../../kind.js';
import { XmlUtils } from '../../base/xml-utils.js';
import { $attr, $namespaces, $xmlns } from 'fxmlp';
import { XMLBuilder } from 'fast-xml-parser';
import { objectRegistry } from '../../base/object-registry.js';

/**
 * Input interface for creating Class instances
 * Each object type owns its own input contract
 */
export interface ClassInput {
  /** ADT core attributes - using exact internal type */
  adtcore: AdtCoreType;

  /** Class-specific attributes */
  class?: {
    final?: boolean;
    abstract?: boolean;
    visibility?: 'public' | 'protected' | 'private';
    category?: string;
    hasTests?: boolean;
    sharedMemoryEnabled?: boolean;
  };

  /** Class-specific sections - simplified format that gets converted to internal */
  sections?: {
    includes?: ClassInclude[];
  };

  /** ABAP object attributes */
  abapoo?: {
    modeled: boolean;
  };

  /** ABAP source attributes - using exact internal type */
  abapsource?: AbapSourceType;
}

/**
 * Type for parsed class XML structure
 */
type ParsedClassXml = {
  '@_adtcore:name': string;
  '@_adtcore:type': string;
  '@_adtcore:description'?: string;
  '@_adtcore:language'?: string;
  '@_adtcore:masterLanguage'?: string;
  '@_adtcore:responsible'?: string;
  '@_adtcore:changedBy'?: string;
  '@_adtcore:createdBy'?: string;
  '@_adtcore:changedAt'?: string;
  '@_adtcore:createdAt'?: string;
  '@_adtcore:version'?: string;
  '@_abapoo:modeled': string;
  '@_abapsource:sourceUri': string;
  '@_abapsource:fixPointArithmetic': string;
  '@_abapsource:activeUnicodeCheck': string;
  '@_class:final': string;
  '@_class:abstract': string;
  '@_class:visibility': string;
  '@_class:category'?: string;
  '@_class:hasTests': string;
  '@_class:sharedMemoryEnabled': string;
  'class:include'?: ParsedClassInclude | ParsedClassInclude[];
  'adtcore:packageRef'?: {
    '@_adtcore:uri': string;
    '@_adtcore:type': string;
    '@_adtcore:name': string;
  };
  'atom:link'?: ParsedAtomLink | ParsedAtomLink[];
};

/**
 * Type for parsed class include XML
 */
type ParsedClassInclude = {
  '@_class:includeType': string;
  '@_adtcore:name': string;
  '@_adtcore:type': string;
  '@_abapsource:sourceUri': string;
  '@_adtcore:changedAt'?: string;
  '@_adtcore:createdAt'?: string;
  '@_adtcore:changedBy'?: string;
  '@_adtcore:createdBy'?: string;
  '@_adtcore:version'?: string;
  'atom:link'?: ParsedAtomLink | ParsedAtomLink[];
};

/**
 * Type for parsed atom link XML
 */
type ParsedAtomLink = {
  '@_href': string;
  '@_rel': string;
  '@_type'?: string;
  '@_title'?: string;
  '@_etag'?: string;
};

/**
 * Class-specific sections
 */
interface ClassSections {
  class: {
    final: boolean;
    abstract: boolean;
    visibility: 'public' | 'protected' | 'private';
    category?: string;
    hasTests?: boolean;
    sharedMemoryEnabled?: boolean;
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
export class Class extends AdkBaseObject<ClassSections, Kind.Class> {
  /** SAP object type identifier for registry */
  static readonly sapType = 'CLAS';
  private abapoo: { modeled: boolean };
  private abapsource: AbapSourceAttributes;

  constructor(input: ClassInput) {
    // Convert input format to internal sections format
    const sections: ClassSections = {
      class: {
        final: input.class?.final || false,
        abstract: input.class?.abstract || false,
        visibility: input.class?.visibility || 'public',
        category: input.class?.category,
        hasTests: false,
        sharedMemoryEnabled: false,
      },
      includes: input.sections?.includes || [],
    };

    super({
      adtcore: input.adtcore,
      sections,
      kind: Kind.Class,
    });
    this.abapoo = input.abapoo || { modeled: false };
    this.abapsource = input.abapsource || { sourceUri: 'source/main' };
  }

  /**
   * Static factory method for easier object creation
   */
  static create(input: ClassInput): Class {
    return new Class(input);
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
  get category(): string | undefined {
    return this.sections.class.category;
  }
  get hasTests(): boolean | undefined {
    return this.sections.class.hasTests;
  }
  get sharedMemoryEnabled(): boolean | undefined {
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
    attributeValueProcessor: (name: string, val: unknown) => {
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
            // Class attributes using abapoo namespace for modeled
            'abapoo:modeled': this.abapoo.modeled ? 'true' : 'false',
            // Namespace attributes using namespace functions
            ...classNs({
              final: this.final ? 'true' : 'false',
              abstract: this.abstract ? 'true' : 'false',
              visibility: this.visibility,
            }),
            ...XmlUtils.serializeAdtCoreAttributes(adtcore, this),
            ...abapsource({
              sourceUri: this.sourceUri,
              fixPointArithmetic: this.fixPointArithmetic ? 'true' : 'false',
            }),
            ...$xmlns({
              class: 'http://www.sap.com/adt/oo/classes',
            }),
            ...XmlUtils.getCommonNamespaces(),
          }),

          // Links
          ...XmlUtils.serializeAtomLinks(atom, this.links),

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

          // Package reference if exists
          ...(this.packageRef && XmlUtils.serializePackageRef(this.packageRef)),
        },
      }),
    };

    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      Class.xmlBuilder.build(xmlObject)
    );
  }

  // XML parsing
  static override fromAdtXml<
    U extends AdkBaseObject<unknown, K>,
    K extends Kind
  >(xml: string): U {
    const parsed = AdkBaseObject.parseXml(xml);
    const root = parsed['class:abapClass'] as ParsedClassXml;

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
    const includes: ClassInclude[] = includesArray.map(
      (include: ParsedClassInclude) => {
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
          links: includeLinks.map((link: ParsedAtomLink) => ({
            href: link['@_href'],
            rel: link['@_rel'],
            type: link['@_type'],
            title: link['@_title'],
            etag: link['@_etag'],
          })),
        };
      }
    );

    const sections: ClassSections = {
      class: classSection,
      includes,
    };

    const cls = new this({
      adtcore,
      abapoo,
      abapsource,
      class: sections.class,
      sections: { includes: sections.includes },
    });

    // Parse package reference
    cls.packageRef = XmlUtils.parsePackageRef(root);

    // Parse atom links
    cls.links = XmlUtils.parseAtomLinks(root);

    // Type assertion to handle the generic return type
    return cls as unknown as U;
  }
}

// Auto-register Class with the object registry
objectRegistry.register(Class.sapType, Class);
