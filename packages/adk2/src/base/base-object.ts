import type { AdkObject } from './adk-object';
import type { BaseSpec } from './base-spec';
import { Kind } from '../kind';

/**
 * Generic base class for all ADK objects
 *
 * Provides common functionality for all ABAP objects by delegating
 * to the object specification. This eliminates code duplication across
 * different object types.
 *
 * @template TSpec - The object specification type (extends BaseSpec)
 */
export abstract class BaseObject<TSpec extends BaseSpec> implements AdkObject {
  abstract readonly kind: Kind;

  /**
   * Object specification - handles all serialization/parsing
   */
  public spec: TSpec;

  constructor(spec: TSpec) {
    this.spec = spec;
  }

  // === All properties accessed via spec ===
  // Use domain.spec.core.name, domain.spec.core.type, etc.

  // === ADK Object Interface ===

  /**
   * Serialize to ADT XML format
   */
  toAdtXml(): string {
    return this.spec.toXMLString();
  }

  // === Helper Methods ===
  // All helper methods moved to spec classes

  // === Generic Static Factory Method ===

  /**
   * Generic factory method to create ADK objects from XML
   * This is a helper that can be used by subclasses to implement their fromAdtXml methods
   *
   * Note: Domain now uses the standalone createFromXml function instead
   */
  protected static createFromXml<
    T extends BaseObject<any>,
    TSpec extends BaseSpec
  >(
    this: new (spec: TSpec) => T,
    xml: string,
    specClass: { fromXMLString(xml: string): TSpec }
  ): T {
    const spec = specClass.fromXMLString(xml);
    return new this(spec);
  }
}
