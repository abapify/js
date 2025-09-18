import { AdkObject, AdkObjectConstructor } from './adk-object.js';

/**
 * Registry for mapping SAP object types to ADK constructors
 * Pure mapping with no runtime dependencies or "intelligent" features
 */
class ObjectTypeRegistry {
  private constructors = new Map<string, AdkObjectConstructor>();

  /**
   * Register a constructor for a SAP object type
   */
  register(sapType: string, constructor: AdkObjectConstructor): void {
    const normalizedType = sapType.toUpperCase();

    if (this.constructors.has(normalizedType)) {
      console.warn(
        `Object type ${normalizedType} is already registered, overwriting`
      );
    }

    this.constructors.set(normalizedType, constructor);
  }

  /**
   * Create an ADK object from XML using registered constructor
   */
  createFromXml(sapType: string, xml: string): AdkObject {
    const normalizedType = sapType.toUpperCase();
    const Constructor = this.constructors.get(normalizedType);

    if (!Constructor) {
      throw new Error(
        `Unsupported object type: ${sapType}. ` +
          `Supported types: ${this.getSupportedTypes().join(', ')}`
      );
    }

    try {
      return Constructor.fromAdtXml(xml);
    } catch (error) {
      throw new Error(
        `Failed to create ${sapType} object from XML: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get all supported SAP object types
   */
  getSupportedTypes(): string[] {
    return Array.from(this.constructors.keys()).sort();
  }

  /**
   * Check if SAP object type is supported
   */
  isSupported(sapType: string): boolean {
    return this.constructors.has(sapType.toUpperCase());
  }

  /**
   * Get constructor for SAP object type
   */
  getConstructor(sapType: string): AdkObjectConstructor | undefined {
    return this.constructors.get(sapType.toUpperCase());
  }

  /**
   * Get registration info for debugging
   */
  getRegistrationInfo(): Array<{ sapType: string; constructorName: string }> {
    return Array.from(this.constructors.entries()).map(
      ([sapType, constructor]) => ({
        sapType,
        constructorName: constructor.constructor.name || 'Anonymous',
      })
    );
  }
}

/**
 * Global object registry instance
 * ADK objects auto-register themselves when imported
 */
export const objectRegistry = new ObjectTypeRegistry();
