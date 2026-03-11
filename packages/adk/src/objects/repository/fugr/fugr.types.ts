/**
 * FUGR - ABAP Function Group
 *
 * Public interface for ABAP Function Group objects.
 * Based on ADT fugr:abapFunctionGroup XML structure.
 */

import type { AbapObject } from '../../../base/types';
import type { AdtObjectReference } from '../../../base/model';

/**
 * ABAP Function Group interface
 *
 * Plugins work with this interface - implementation is internal.
 * Mirrors ADT fugr:abapFunctionGroup structure.
 */
export interface AbapFunctionGroup extends AbapObject {
  readonly kind: 'FunctionGroup';

  // Core attributes (from adtcore:*)
  readonly responsible: string;
  readonly masterLanguage: string;
  readonly language: string;
  readonly version: string;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly changedAt: Date;
  readonly changedBy: string;

  // Source attributes (from abapsource:*)
  readonly sourceUri: string;
  readonly fixPointArithmetic: boolean;
  readonly activeUnicodeCheck: boolean;

  // References
  readonly packageRef?: AdtObjectReference;

  // Lazy segments - fetched on demand

  /**
   * Get function group top-include source code
   */
  getSource(): Promise<string>;
}
