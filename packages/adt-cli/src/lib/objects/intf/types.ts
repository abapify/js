import { ObjectData } from '../base/types';

export interface InterfaceData extends ObjectData {
  methods?: string[];
  constants?: string[];
}
