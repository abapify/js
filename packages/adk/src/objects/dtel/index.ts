import type { AdkObjectConstructor } from '../../base/adk-object';
import { createAdkObject } from '../../base/class-factory';
import { createAdtSchema, AdtCoreSchema } from '@abapify/adt-schemas';
import { Kind } from '../../registry';

/**
 * Base DataElement from factory
 * Uses generic ADT core schema until specific DTEL schema is added to adt-schemas
 */
const BaseDataElement = createAdkObject(
  Kind.DataElement,
  createAdtSchema(AdtCoreSchema)
);

/**
 * ABAP Data Element object
 *
 * Note: This uses a generic ADT core schema until full DTEL schema support is added.
 * The getData() method returns unknown for now.
 */
export class DataElement extends BaseDataElement {
  /**
   * Get data element data
   * Returns unknown until proper schema is implemented
   */
  override getData(): unknown {
    return super.getData();
  }

  /**
   * Create DataElement instance from ADT XML
   */
  static override fromAdtXml(xml: string): DataElement {
    const base = BaseDataElement.fromAdtXml(xml);
    const dtel = Object.create(DataElement.prototype);
    Object.assign(dtel, base);
    return dtel;
  }
}

// Export constructor type for registry
export const DataElementConstructor: AdkObjectConstructor<DataElement> =
  DataElement;
