/**
 * AbapGit Typed Schemas
 * 
 * Each schema provides:
 * - _type: Full AbapGitType (for XML build/parse)
 * - _values: Inner values type (for handler mapping)
 * - parse(xml) → fully typed object
 * - build(data) → XML string
 * - schema → raw schema literal
 */

import { abapGitSchema } from './abapgit-schema';

// Raw schemas
import _clas from '../../schemas/generated/schemas/clas';
import _devc from '../../schemas/generated/schemas/devc';
import _intf from '../../schemas/generated/schemas/intf';

// Full AbapGit types and AbapValuesType (the values wrapper)
import type { AbapGitType as ClasAbapGitType, AbapValuesType as ClasValuesType } from '../../schemas/generated/types/clas';
import type { AbapGitType as DevcAbapGitType, AbapValuesType as DevcValuesType } from '../../schemas/generated/types/devc';
import type { AbapGitType as IntfAbapGitType, AbapValuesType as IntfValuesType } from '../../schemas/generated/types/intf';

// AbapGit schema instances - TValues is AbapValuesType (the values wrapper)
export const clas = abapGitSchema<ClasAbapGitType, ClasValuesType>(_clas);
export const devc = abapGitSchema<DevcAbapGitType, DevcValuesType>(_devc);
export const intf = abapGitSchema<IntfAbapGitType, IntfValuesType>(_intf);
// TODO: Add doma and dtel when ADK v2 support is ready

// Re-export types and utilities
export { abapGitSchema, type AbapGitSchema, type InferAbapGitType, type InferValuesType } from './abapgit-schema';
