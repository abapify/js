import { ObjectData } from '../base/types';

export interface ClassData extends ObjectData {
  visibility?: 'PUBLIC' | 'PRIVATE';
  isFinal?: boolean;
  interfaces?: string[];
  superclass?: string;
}
