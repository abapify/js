import { ObjectData } from '../base/types';

export interface PackageData extends ObjectData {
  packageType?: string;
  responsible?: string;
  masterLanguage?: string;
}
