/**
 * ADT Programs Contracts
 *
 * Structure mirrors URL tree:
 * - /sap/bc/adt/programs/programs → programs.programs
 */

export {
  programsContract,
  type ProgramsContract,
  type ProgramResponse,
} from './programs';

import { programsContract } from './programs';

/**
 * Programs Contract type definition
 */
export interface ProgramsModuleContract {
  programs: typeof programsContract;
}

export const programsModuleContract: ProgramsModuleContract = {
  programs: programsContract,
};
