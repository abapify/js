/**
 * ADT Contracts - Aggregated
 */

export * from './cts';
export * from './atc';
export * from './oo';
export * from './discovery';
export * from './packages';
export * from './core';
export * from './repository';

/**
 * Complete ADT Contract
 */
import { ctsContract, type CtsContract } from './cts';
import { atcContract, type AtcContract } from './atc';
import { ooContract, type OoContract } from './oo';
import { discoveryContract, type DiscoveryContract } from './discovery';
import { packagesContract, type PackagesContract } from './packages';
import { coreContract, type CoreContract } from './core';
import { repositoryContract, type RepositoryContract } from './repository';

/**
 * Explicit type to avoid TS7056 "inferred type exceeds maximum length"
 */
export interface AdtContract {
  cts: CtsContract;
  atc: AtcContract;
  oo: OoContract;
  discovery: DiscoveryContract;
  packages: PackagesContract;
  core: CoreContract;
  repository: RepositoryContract;
}

export const adtContract: AdtContract = {
  cts: ctsContract,
  atc: atcContract,
  oo: ooContract,
  discovery: discoveryContract,
  packages: packagesContract,
  core: coreContract,
  repository: repositoryContract,
};

// Import RestClient from base for client type definition
import type { RestClient } from '../base';

/**
 * Type for the ADT client instance
 * Use this when you need to type a variable holding the client
 */
export type AdtClientType = RestClient<AdtContract>;
