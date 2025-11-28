/**
 * Base interface for all ADK objects
 *
 * This interface ensures all ADK objects can be used generically
 * by ADT clients without knowing their specific types.
 */
export interface AdkObject {
  /**
   * Object kind (e.g., 'Interface', 'Class', 'Domain')
   */
  readonly kind: string;

  /**
   * Object name (e.g., 'ZIF_TEST', 'ZCL_TEST')
   */
  readonly name: string;

  /**
   * Object type (e.g., 'INTF/OI', 'CLAS/OC', 'DOMA/DD')
   */
  readonly type: string;

  /**
   * Object description
   */
  readonly description?: string;

  /**
   * Get underlying parsed data (type depends on object kind)
   */
  getData(): unknown;

  /**
   * Serialize to ADT XML format
   */
  toAdtXml(): string;
}

/**
 * Base interface for ADK objects that can be created from XML
 */
export interface AdkObjectConstructor<T extends AdkObject> {
  /**
   * Create instance from ADT XML string
   */
  fromAdtXml(xml: string): T;
}
