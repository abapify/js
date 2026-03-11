/**
 * PROG - ABAP Program
 *
 * Public interface for ABAP Program objects.
 * Based on ADT prog:abapProgram XML structure.
 */

import type { AbapObject } from '../../../base/types';
import type { AdtObjectReference } from '../../../base/model';

/**
 * ABAP Program interface
 *
 * Plugins work with this interface - implementation is internal.
 * Mirrors ADT prog:abapProgram structure.
 */
export interface AbapProgram extends AbapObject {
  readonly kind: 'Program';

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

  // PROG specific
  readonly programType?: string;

  // References
  readonly packageRef?: AdtObjectReference;

  // Lazy segments - fetched on demand

  /**
   * Get program source code
   */
  getSource(): Promise<string>;
}
