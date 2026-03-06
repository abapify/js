// Exported symbols for package mapping
export const local = Symbol('local'); // local(remoteName) -> localName
export const remote = Symbol('remote'); // remote(localName) -> remoteName

export interface ImportContext {
  sourceSystem?: string;
  targetProject?: string;
}

export interface ExportContext {
  targetSystem?: string;
  targetEnv?: string;
  teamPrefix?: string;
}

export interface PackageMapping {
  // Static mappings: localName -> remoteName
  [localPackage: string]: string;

  // Dynamic transform functions
  [local]?: (remotePkg: string, context?: ImportContext) => string;
  [remote]?: (localPkg: string, context?: ExportContext) => string;
}

export interface OatConfig {
  packageMapping?: PackageMapping;

  objectFilters?: {
    include?: string[];
    exclude?: string[];
  };

  deployment?: {
    targetSystem?: string;
    transportLayer?: string;
    createMissingPackages?: boolean;
  };
}

export interface AdtConfig {
  oat?: OatConfig;
}

export interface AdtConfigFile {
  default: AdtConfig;
}
