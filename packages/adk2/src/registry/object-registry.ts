import type { AdkObject, AdkObjectConstructor } from '../base/adk-object';

/**
 * Generic object registry - kind-independent
 *
 * Provides a generic mechanism for registering and creating objects
 * without knowing about specific object types.
 */
export class ObjectRegistry {
  private static readonly constructors = new Map<
    string,
    AdkObjectConstructor<AdkObject>
  >();

  /**
   * Get constructor for a given object kind
   */
  static getConstructor(
    kind: string
  ): AdkObjectConstructor<AdkObject> | undefined {
    return this.constructors.get(kind);
  }

  /**
   * Create object instance from XML using the appropriate constructor
   * Falls back to generic factory for objects that don't have fromAdtXml method
   */
  static fromAdtXml(kind: string, xml: string): AdkObject | undefined {
    const constructor = this.getConstructor(kind);
    if (!constructor) return undefined;

    // Try the static fromAdtXml method first
    if (constructor.fromAdtXml) {
      return constructor.fromAdtXml(xml);
    }

    // Fall back to generic factory for objects without fromAdtXml
    // For now, just return undefined - the registry pattern is being phased out
    // in favor of direct use of the generic factory
    return undefined;
  }

  /**
   * Register a new object type
   */
  static register(
    kind: string,
    constructor: AdkObjectConstructor<AdkObject>
  ): void {
    this.constructors.set(kind, constructor);
  }

  /**
   * Get all registered object kinds
   */
  static getRegisteredKinds(): string[] {
    return Array.from(this.constructors.keys());
  }

  /**
   * Check if a kind is registered
   */
  static isRegistered(kind: string): boolean {
    return this.constructors.has(kind);
  }
}

/**
 * Generic factory function to create objects by kind
 */
export function createObject(kind: string): AdkObject | undefined {
  const constructor = ObjectRegistry.getConstructor(kind);
  if (!constructor) {
    return undefined;
  }

  // Create a new instance using the constructor
  // We need to use 'new' with the constructor, but TypeScript needs help
  const ObjectConstructor = constructor as unknown as new () => AdkObject;
  return new ObjectConstructor();
}
