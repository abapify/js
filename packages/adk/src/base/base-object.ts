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
}

/**
 * Generic helper function to create ADK objects from XML
 * 
 * This is extracted as a standalone function instead of a static method
 * to avoid TS4094 errors (exported anonymous classes cannot have private/protected members).
 * 
 * @example
 * ```typescript
 * const domain = createAdkObjectFromXml(Domain, DomainSpec, xmlString);
 * ```
 */
export function createAdkObjectFromXml<
  T extends BaseObject<TSpec>,
  TSpec extends BaseSpec
>(
  ObjectClass: new (spec: TSpec) => T,
  specClass: { fromXMLString(xml: string): TSpec },
  xml: string
): T {
  const spec = specClass.fromXMLString(xml);
  return new ObjectClass(spec);
}
