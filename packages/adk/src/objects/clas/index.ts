import { ClassAdtSchema } from '@abapify/adt-schemas';
import type { ClassType } from '@abapify/adt-schemas';

import type { AdkObjectConstructor } from '../../base/adk-object';
import { createAdkObject } from '../../base/class-factory';
import { Kind } from '../../registry';

/**
 * Base Class from factory
 */
const BaseClass = createAdkObject(Kind.Class, ClassAdtSchema);

/**
 * ABAP Class object
 *
 * Extends base implementation with typed getData()
 */
export class Class extends BaseClass {
  /**
   * Get class data with proper typing
   * Overrides base implementation to return ClassType instead of unknown
   */
  override getData(): ClassType {
    return super.getData() as ClassType;
  }

  /**
   * Create Class instance from ADT XML
   */
  static override fromAdtXml(xml: string): Class {
    const base = BaseClass.fromAdtXml(xml);
    const cls = Object.create(Class.prototype);
    Object.assign(cls, base);
    return cls;
  }
}

// Export constructor type for registry
export const ClassConstructor: AdkObjectConstructor<Class> = Class;
