/**
 * ADT API Contract
 *
 * Main contract that aggregates all ADT API endpoints.
 */

import { type RestContract } from './base';
import { classesContract } from './adt/oo/classes';
import { discoveryContract } from './adt/discovery';
import {
  sessionsContract,
  systeminformationContract,
} from './adt/core/http';

/**
 * Complete ADT API Contract
 *
 * Organized to mirror the ADT API structure.
 */
export const adtContract = {
  discovery: discoveryContract,
  classes: classesContract,
  core: {
    http: {
      sessions: sessionsContract,
      systeminformation: systeminformationContract,
    },
  },
} satisfies RestContract;

export type AdtContract = typeof adtContract;
