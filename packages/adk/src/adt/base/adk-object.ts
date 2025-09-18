import { XMLParser } from 'fast-xml-parser';
import { AdtCoreType } from '../../namespaces/adtcore.js';
import { AtomLinkType } from '../../namespaces/atom.js';
import { Kind } from '../kind.js';

/**
 * Client-agnostic interface that any ADK object must implement
 * This allows ADT client to work with objects without knowing specific types
 *
 * ADK objects are pure data models - they only handle XML serialization/parsing
 * All client operations (CRUD, transport, etc.) are handled by ADT client
 */
export interface AdkObject {
  readonly kind: Kind;
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly package?: string;

  /**
   * Serialize to ADT XML format for API calls
   * This is the only client-facing method - pure data transformation
   */
  toAdtXml(): string;
}

/**
 * Input interface for AdkBaseObject constructor
 */
export interface AdkObjectInput<T = unknown, K extends Kind = Kind> {
  kind: K;
  adtcore: AdtCoreType;
  sections: T;
  links?: AtomLinkType[];
}

/**
 * Constructor interface for ADK objects that can be created from XML
 */
export interface AdkObjectConstructor {
  /**
   * Create object instance from ADT XML
   */
  fromAdtXml(xml: string): AdkObject;

  /**
   * SAP object type identifier (e.g., 'CLAS', 'INTF', 'DOMA')
   */
  readonly sapType: string;
}

/**
 * Base abstract class for all ADK objects with common adtcore properties
 * Implements AdkObject interface for client compatibility
 */
export abstract class AdkBaseObject<T = unknown, K extends Kind = Kind>
  implements AdkObject
{
  protected adtcore: AdtCoreType;
  protected links: AtomLinkType[] = [];
  protected sections: T;
  readonly kind: K;

  constructor(input: AdkObjectInput<T, K>) {
    this.kind = input.kind;
    this.adtcore = input.adtcore;
    this.sections = input.sections;
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
    return this.adtcore.packageRef?.name;
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
  static fromAdtXml<U extends AdkBaseObject<unknown, K>, K extends Kind>(
    _xml: string,
    _kind: K
  ): U {
    throw new Error('fromAdtXml must be implemented by concrete class');
  }
}
