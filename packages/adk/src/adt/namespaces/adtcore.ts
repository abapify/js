/**
 * ADT Core namespace types - common to all ADT objects
 */
export interface AdtCoreAttributes {
  name: string;
  type: string;
  description?: string;
  descriptionTextLimit?: number;
  language?: string;
  masterLanguage?: string;
  masterSystem?: string;
  abapLanguageVersion?: string;
  responsible?: string;
  changedBy?: string;
  createdBy?: string;
  changedAt?: Date;
  createdAt?: Date;
  version?: 'active' | 'inactive';
}

export interface PackageRef {
  uri: string;
  type: 'DEVC/K';
  name: string;
}
