// Namespace: adtcore
interface AdtcorePackageRef {
  uri: string;
  type: string;
  name: string;
  description: string;
}

interface AdtcoreAttributes {
  responsible: string;
  masterLanguage: string;
  masterSystem: string;
  abapLanguageVersion: string;
  name: string;
  type: string;
  changedAt: string;
  version: string;
  createdAt: string;
  changedBy: string;
  createdBy: string;
  description: string;
  language: string;
}

export interface Adtcore extends AdtcoreAttributes {
  packageRef: AdtcorePackageRef;
}
