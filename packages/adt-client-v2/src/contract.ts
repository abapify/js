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
import { searchContract } from './adt/repository/informationsystem';

// Import CTS contracts from adt-contracts package
import { ctsContract } from 'adt-contracts';

/**
 * Complete ADT API Contract
 *
 * Organized to mirror the ADT API structure.
 * CTS namespace imported from adt-contracts package.
 */
export const adtContract = {
  discovery: discoveryContract,
  classes: classesContract,
  cts: ctsContract,  // /sap/bc/adt/cts/*
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
} satisfies RestContract;

export type AdtContract = typeof adtContract;
