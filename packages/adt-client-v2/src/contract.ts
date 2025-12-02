/**
 * ADT API Contract
 *
 * Extends the base adtContract from adt-contracts with additional
 * client-specific contracts (sessions, etc.)
 */

import { classesContract } from './adt/oo/classes';
import {
  sessionsContract,
  systeminformationContract,
} from './adt/core/http';
import { searchContract } from './adt/repository/informationsystem';

// Import base contract from adt-contracts package
import { adtContract as baseAdtContract, type AdtContract as BaseAdtContract } from 'adt-contracts';

/**
 * Extended ADT API Contract
 *
 * Combines base contracts from adt-contracts with client-specific contracts.
 * Organized to mirror the ADT API structure.
 */
export interface AdtContract extends BaseAdtContract {
  classes: typeof classesContract;
  core: {
    http: {
      sessions: typeof sessionsContract;
      systeminformation: typeof systeminformationContract;
    };
  };
  repository: {
    informationsystem: {
      search: typeof searchContract;
    };
  };
}

export const adtContract: AdtContract = {
  ...baseAdtContract,
  classes: classesContract,
  core: {
    http: {
      sessions: sessionsContract,
      systeminformation: systeminformationContract,
    },
  },
  repository: {
    informationsystem: {
      search: searchContract,
    },
  },
};
