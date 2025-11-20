/**
 * ADT API Contract
 *
 * Main contract that aggregates all ADT API endpoints.
 */

import { type RestContract } from './base';
import { classesContract } from './adt/oo/classes';
import { discoveryContract } from './adt/discovery';

/**
 * Complete ADT API Contract
 *
 * Organized to mirror the ADT API structure.
 */
export const adtContract = {
  discovery: discoveryContract,
  classes: classesContract,
} satisfies RestContract;

export type AdtContract = typeof adtContract;
