import { DataTypes } from '../doma/dataTypes';
import { RefKind } from './refKind';
import { DomainInput } from '../doma/domainInput';
import { RefType } from './refType';

interface BuiltInType {
  type: DataTypes;
  length?: number;
  decimals?: number;
  outputLength?: number;
}

interface DataElementInputBase {
  name: string;
  description: string;
  labels?: {
    short?: string;
    medium?: string;
    long?: string;
    heading?: string;
  };
}

export type DataElementInput = DataElementInputBase &
  (
    | DataElementWithDomain
    | DataElementBuiltInType
    | DataElementReferencedType
    | DataElementRefToBuiltIn
  );

interface DataElementWithDomain {
  refKind: RefKind.DOMAIN;
  domain: DomainInput | string;
}

interface DataElementBuiltInType {
  refKind: RefKind.DIRECT_TYPE_ENTRY;
  builtInType: BuiltInType | string;
}

interface DataElementReferencedType {
  refKind: RefKind.REFERENCE;
  //refType exludicng builtin
  refType: Exclude<RefType, RefType.BUILT_IN_DICTIONARY_TYPE>;
  referencedType: string;
}

interface DataElementRefToBuiltIn {
  refKind: RefKind.REFERENCE;
  refType: RefType.BUILT_IN_DICTIONARY_TYPE;
  builtInType: BuiltInType | string;
}
