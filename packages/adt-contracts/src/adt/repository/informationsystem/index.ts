/**
 * Repository Information System Contracts
 */

export * from './search';
export * from './usagereferences';
export * from './objectproperties';

import { searchContract, type SearchContract } from './search';
import {
  usageReferencesContract,
  type UsageReferencesContract,
} from './usagereferences';
import {
  objectPropertiesContract,
  type ObjectPropertiesContract,
} from './objectproperties';

export interface InformationSystemContract {
  search: SearchContract;
  usageReferences: UsageReferencesContract;
  objectProperties: ObjectPropertiesContract;
}

export const informationsystemContract: InformationSystemContract = {
  search: searchContract,
  usageReferences: usageReferencesContract,
  objectProperties: objectPropertiesContract,
};
