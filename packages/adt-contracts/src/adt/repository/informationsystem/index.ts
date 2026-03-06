/**
 * Repository Information System Contracts
 */

export * from './search';

import { searchContract, type SearchContract } from './search';

export interface InformationSystemContract {
  search: SearchContract;
}

export const informationsystemContract: InformationSystemContract = {
  search: searchContract,
};
