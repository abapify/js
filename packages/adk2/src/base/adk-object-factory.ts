import type { BaseSpec } from './base-spec';
import { BaseObject } from './base-object';
import type { Kind } from '../kind';
import type { AdkObjectConstructor } from './adk-object';

/**
 * Generic factory for creating ADK object classes
 *
 * Eliminates boilerplate by generating classes that follow the standard pattern:
 * - Extend BaseObject<TSpec>
 * - Have a readonly kind property
 * - Constructor that accepts optional spec
 * - Use spec property for all data access
 */
export function createAdkObjectClass<
  TSpec extends BaseSpec,
  TKind extends Kind
>(kind: TKind, specClass: new () => TSpec) {
  return class extends BaseObject<TSpec> {
    readonly kind = kind;

    constructor(spec?: TSpec) {
      super(spec ?? new specClass());
    }
  };
}

/**
 * Helper type for ADK object classes created by the factory
 */
export type AdkObjectClass<
  TSpec extends BaseSpec,
  TKind extends Kind
> = ReturnType<typeof createAdkObjectClass<TSpec, TKind>>;

/**
 * Enhanced factory that also provides static factory methods
 */
export function createAdkObjectClassWithFactory<
  TSpec extends BaseSpec,
  TKind extends Kind
>(
  kind: TKind,
  specClass: new () => TSpec & { fromXMLString(xml: string): TSpec }
) {
  const AdkClass = class extends BaseObject<TSpec> {
    readonly kind = kind;

    constructor(spec?: TSpec) {
      super(spec ?? new specClass());
    }

    /**
     * Create instance from XML string
     */
    static fromAdtXml(xml: string) {
      const spec = specClass.fromXMLString(xml);
      return new this(spec);
    }
  };

  return AdkClass as typeof AdkClass &
    AdkObjectConstructor<InstanceType<typeof AdkClass>>;
}
