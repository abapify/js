import type { BaseSpec } from './base-spec';
import type { BaseObject } from './base-object';

/**
 * Generic factory function to create any ADK object from XML
 *
 * This is a standalone factory that doesn't require inheritance.
 * It can create any object that follows the ADK pattern.
 */
export function createFromXml<
  TObject extends BaseObject<TSpec>,
  TSpec extends BaseSpec
>(
  xml: string,
  ObjectClass: new (spec: TSpec) => TObject,
  SpecClass: { fromXMLString(xml: string): TSpec }
): TObject {
  const spec = SpecClass.fromXMLString(xml);
  return new ObjectClass(spec);
}

/**
 * Usage examples:
 *
 * const myDomain = createFromXml(xmlString, Domain, DomainSpec);
 * const myClass = createFromXml(xmlString, Class, ClassSpec);
 * const myInterface = createFromXml(xmlString, Interface, IntfSpec);
 */
