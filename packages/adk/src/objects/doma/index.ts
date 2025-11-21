import { DdicDomainAdtSchema } from '@abapify/adt-schemas';
import type { DomainType } from '@abapify/adt-schemas';

import type { AdkObjectConstructor } from '../../base/adk-object';
import { createAdkObject } from '../../base/class-factory';
import { Kind } from '../../registry';

/**
 * Base Domain from factory
 */
const BaseDomain = createAdkObject(Kind.Domain, DdicDomainAdtSchema);

/**
 * ABAP Domain object
 *
 * Extends base implementation with typed getData()
 */
export class Domain extends BaseDomain {
  /**
   * Get domain data with proper typing
   * Overrides base implementation to return DomainType instead of unknown
   */
  override getData(): DomainType {
    return super.getData() as DomainType;
  }

  /**
   * Create Domain instance from ADT XML
   */
  static override fromAdtXml(xml: string): Domain {
    const base = BaseDomain.fromAdtXml(xml);
    const doma = Object.create(Domain.prototype);
    Object.assign(doma, base);
    return doma;
  }
}

// Export constructor type for registry
export const DomainConstructor: AdkObjectConstructor<Domain> = Domain;
