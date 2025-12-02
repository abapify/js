/**
 * ADK v2 - Base Types
 */

/**
 * Base interface for all ABAP objects
 */
export interface AbapObject {
  readonly kind: string;
  readonly name: string;
  readonly package: string;
  readonly description: string;
  
  /**
   * ADT object type (e.g., 'DEVC/K', 'CLAS/OC')
   */
  readonly type: string;
}
