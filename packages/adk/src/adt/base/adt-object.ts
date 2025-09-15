import { XMLParser } from 'fast-xml-parser';
import { AdtCoreAttributes, PackageRef } from '../namespaces/adtcore';
import { AtomLink } from '../namespaces/atom';
import { Kind } from '../kind';

/**
 * Base abstract class for all ADT objects with common adtcore properties
 */
export abstract class AdtObject<T = unknown, K extends Kind = Kind> {
  protected adtcore: AdtCoreAttributes;
  protected packageRef?: PackageRef;
  protected links: AtomLink[] = [];
  protected sections: T;
  readonly kind: K;

  constructor(adtcore: AdtCoreAttributes, sections: T, kind: K) {
    this.kind = kind;
    this.adtcore = adtcore;
    this.sections = sections;
  }

  // ADT Core getters
  get name(): string {
    return this.adtcore.name;
  }
  get type(): string {
    return this.adtcore.type;
  }
  get description(): string | undefined {
    return this.adtcore.description;
  }
  get language(): string | undefined {
    return this.adtcore.language;
  }
  get masterLanguage(): string | undefined {
    return this.adtcore.masterLanguage;
  }
  get responsible(): string | undefined {
    return this.adtcore.responsible;
  }
  get changedBy(): string | undefined {
    return this.adtcore.changedBy;
  }
  get createdBy(): string | undefined {
    return this.adtcore.createdBy;
  }
  get changedAt(): Date | undefined {
    return this.adtcore.changedAt;
  }
  get createdAt(): Date | undefined {
    return this.adtcore.createdAt;
  }
  get version(): 'active' | 'inactive' | undefined {
    return this.adtcore.version;
  }
  get package(): string | undefined {
    return this.packageRef?.name;
  }

  // Links
  getLinks(): AtomLink[] {
    return [...this.links];
  }
  getLink(rel: string): AtomLink | undefined {
    return this.links.find((link) => link.rel === rel);
  }

  // Sections
  getSections(): T {
    return this.sections;
  }

  // XML parsing
  protected static parseXml(xml: string): Record<string, unknown> {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false, // Keep attribute values as strings
      trimValues: true,
      removeNSPrefix: false,
      parseTagValue: false, // Keep tag values as strings
      processEntities: true,
    });

    const cleanXml = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
    return parser.parse(cleanXml);
  }

  // Abstract methods for concrete implementations
  abstract toAdtXml(): string;

  /**
   * Create an instance of the concrete ADT object from XML
   * @param xml The XML string to parse
   * @param kind The expected kind of the ADT object
   * @returns A new instance of the concrete ADT object
   */
  static fromAdtXml<U extends AdtObject<unknown, K>, K extends Kind>(
    xml: string,
    kind: K
  ): U {
    throw new Error('fromAdtXml must be implemented by concrete class');
  }
}
