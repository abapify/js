/**
 * Core Contracts
 */

export * from './http';

import { httpContract, type HttpContract } from './http';

export interface CoreContract {
  http: HttpContract;
}

export const coreContract: CoreContract = {
  http: httpContract,
};
