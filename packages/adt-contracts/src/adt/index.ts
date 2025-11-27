/**
 * ADT Contracts - Aggregated
 */

export { ctsContract, type CtsContract } from './cts';
export { atcContract, type AtcContract } from './atc';
export { ooContract, type OoContract } from './oo';

/**
 * Complete ADT Contract
 */
import { ctsContract, type CtsContract } from './cts';
import { atcContract, type AtcContract } from './atc';
import { ooContract, type OoContract } from './oo';

/**
 * Explicit type to avoid TS7056 "inferred type exceeds maximum length"
 */
export interface AdtContract {
  cts: CtsContract;
  atc: AtcContract;
  oo: OoContract;
}

export const adtContract: AdtContract = {
  cts: ctsContract,
  atc: atcContract,
  oo: ooContract,
};
