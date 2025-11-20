import { InterfaceAdtSchema } from '@abapify/adt-schemas';
import type { InterfaceType } from '@abapify/adt-schemas';

import type { AdkObjectConstructor } from '../../base/adk-object';
import { createAdkObject } from '../../base/class-factory';
import { Kind } from '../../registry';

/**
 * Base Interface from factory
 */
const BaseInterface = createAdkObject(Kind.Interface, InterfaceAdtSchema);

/**
 * ABAP Interface object
 *
 * Extends base implementation with typed getData()
 */
export class Interface extends BaseInterface {
  /**
   * Get interface data with proper typing
   * Overrides base implementation to return InterfaceType instead of unknown
   */
  override getData(): InterfaceType {
    return super.getData() as InterfaceType;
  }

  /**
   * Create Interface instance from ADT XML
   */
  static override fromAdtXml(xml: string): Interface {
    const base = BaseInterface.fromAdtXml(xml);
    const intf = Object.create(Interface.prototype);
    Object.assign(intf, base);
    return intf;
  }
}

// Export constructor type for registry
export const InterfaceConstructor: AdkObjectConstructor<Interface> = Interface;
