/**
 * ADT Functions Contracts
 *
 * Structure mirrors URL tree:
 * - /sap/bc/adt/functions/groups → functions.groups
 */

export {
  functionGroupsContract,
  type FunctionGroupsContract,
  type FunctionGroupResponse,
} from './groups';

import { functionGroupsContract } from './groups';

/**
 * Functions Contract type definition
 */
export interface FunctionsContract {
  groups: typeof functionGroupsContract;
}

export const functionsContract: FunctionsContract = {
  groups: functionGroupsContract,
};
