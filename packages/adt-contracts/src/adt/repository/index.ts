/**
 * Repository Contracts
 */

export * from './informationsystem';
export * from './objectstructure';
export * from './sourceversions';

import {
  informationsystemContract,
  type InformationSystemContract,
} from './informationsystem';
import {
  objectstructureContract,
  type ObjectstructureContract,
} from './objectstructure';
import {
  sourceversionsContract,
  type SourceversionsContract,
} from './sourceversions';

export interface RepositoryContract {
  informationsystem: InformationSystemContract;
  objectstructure: ObjectstructureContract;
  sourceversions: SourceversionsContract;
}

export const repositoryContract: RepositoryContract = {
  informationsystem: informationsystemContract,
  objectstructure: objectstructureContract,
  sourceversions: sourceversionsContract,
};
