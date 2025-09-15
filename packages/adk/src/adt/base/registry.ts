import { AdtClient } from '@abapify/adt-client';
import { XMLParser } from 'fast-xml-parser';

/**
 * Base interface for all intelligent ADK objects
 */
export interface AdkObjectBase {
  readonly kind: string;
  readonly name: string;
  readonly description: string;
  readonly package: string;
  readonly author?: string;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  readonly transportRequest?: string;

  getSourceFiles(): Record<string, string>;
  getMetadata(): ObjectMetadata;
  getRawXml(): string;
  fromAdt(adtObject: Record<string, unknown>): void;
}

/**
 * Base class with XML parsing functionality for ADT objects
 */
export abstract class AdkObjectBaseImpl implements AdkObjectBase {
  abstract readonly kind: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly package: string;
  abstract readonly author?: string;
  abstract readonly createdAt?: Date;
  abstract readonly modifiedAt?: Date;
  abstract readonly transportRequest?: string;

  abstract getSourceFiles(): Record<string, string>;
  abstract getMetadata(): ObjectMetadata;
  abstract getRawXml(): string;
  abstract fromAdt(adtObject: Record<string, unknown>): void;

  /**
   * Parse XML string to JavaScript object
   */
  protected parseXml(xml: string): Record<string, unknown> {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      parseAttributeValue: true,
      trimValues: true,
      removeNSPrefix: false,
      parseTagValue: true,
      processEntities: true,
    });

    // Remove XML declaration if present
    const cleanXml = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
    return parser.parse(cleanXml);
  }

  /**
   * Parse XML and call fromAdt with parsed object
   */
  protected parseFromXml(xml: string): void {
    try {
      const parsed = this.parseXml(xml);
      this.fromAdt(parsed);
    } catch (error) {
      console.warn('Failed to parse ADT XML:', error);
    }
  }
}

/**
 * Object metadata structure
 */
export interface ObjectMetadata {
  name: string;
  description: string;
  package: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  transportRequest?: string;
  version?: string;
  language?: string;
}

/**
 * Constructor interface for ADK objects with static sapType
 */
export interface AdkObjectConstructor {
  new (metadata: ObjectMetadata, xml: string): AdkObjectBase;
  readonly sapType: string;
}

/**
 * Registry for SAP object type to constructor mapping
 */
class ObjectTypeRegistry {
  private constructors = new Map<string, AdkObjectConstructor>();

  /**
   * Register an object constructor for SAP object type
   */
  register(sapObjectType: string, constructor: AdkObjectConstructor): void {
    this.constructors.set(sapObjectType, constructor);
  }

  /**
   * Create an object instance using registered constructor
   */
  create(
    sapObjectType: string,
    metadata: ObjectMetadata,
    xml: string
  ): AdkObjectBase {
    const Constructor = this.constructors.get(sapObjectType);
    if (!Constructor) {
      throw new Error(
        `No constructor registered for SAP object type: ${sapObjectType}`
      );
    }
    return new Constructor(metadata, xml);
  }

  /**
   * Get all supported SAP object types
   */
  getSupportedTypes(): string[] {
    return Array.from(this.constructors.keys());
  }

  /**
   * Check if SAP object type is supported
   */
  isSupported(sapObjectType: string): boolean {
    return this.constructors.has(sapObjectType);
  }

  /**
   * Get registered constructor for SAP object type
   */
  getConstructor(sapObjectType: string): AdkObjectConstructor | undefined {
    return this.constructors.get(sapObjectType);
  }
}

/**
 * Global object registry instance
 */
export const objectRegistry = new ObjectTypeRegistry();

/**
 * Register all SAP object handlers from the registry
 */
export async function registerAllHandlers(): Promise<void> {
  // Dynamic import to avoid circular dependencies
  const { SUPPORTED_OBJECTS } = await import('../registry.js');

  for (const constructor of SUPPORTED_OBJECTS) {
    objectRegistry.register(constructor.sapType, constructor);
  }
}
