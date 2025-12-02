/**
 * ADT Contracts - Aggregated
 */

export * from './cts';
export * from './atc';
export * from './oo';
export * from './discovery';
export * from './packages';

/**
 * Complete ADT Contract
 */
import { ctsContract, type CtsContract } from './cts';
import { atcContract, type AtcContract } from './atc';
import { ooContract, type OoContract } from './oo';
import { discoveryContract, type DiscoveryContract } from './discovery';
import { packagesContract, type PackagesContract } from './packages';

/**
 * Explicit type to avoid TS7056 "inferred type exceeds maximum length"
 */
export interface AdtContract {
  cts: CtsContract;
  atc: AtcContract;
  oo: OoContract;
  discovery: DiscoveryContract;
  packages: PackagesContract;
}

export const adtContract: AdtContract = {
  cts: ctsContract,
  atc: atcContract,
  oo: ooContract,
  discovery: discoveryContract,
  packages: packagesContract,
};
