/**
 * ADT Contracts - Aggregated
 */

export { ctsContract, type CtsContract } from './cts';
export { atcContract, type AtcContract } from './atc';
export { ooContract, type OoContract } from './oo';

/**
 * Complete ADT Contract
 */
import { ctsContract } from './cts';
import { atcContract } from './atc';
import { ooContract } from './oo';

export const adtContract = {
  cts: ctsContract,
  atc: atcContract,
  oo: ooContract,
};

export type AdtContract = typeof adtContract;
