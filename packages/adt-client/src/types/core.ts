// Core ADT object interfaces shared across multiple services
export interface AdtObject {
  objectType: string;
  objectName: string;
  packageName: string;
  description: string;
  responsible: string;
  createdBy: string;
  createdOn: string;
  changedBy: string;
  changedOn: string;
  version: string;
  etag: string;
  content: Record<string, string>; // segment name -> content
  metadata: ObjectMetadata;
}

export interface ObjectMetadata {
  objectType: string;
  objectName: string;
  packageName: string;
  description: string;
  responsible: string;
  masterLanguage: string;
  abapLanguageVersion: string;
  createdBy: string;
  createdOn: string;
  changedBy: string;
  changedOn: string;
  version: string;
  etag: string;
  locked?: boolean;
  lockedBy?: string;
}
