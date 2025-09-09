// Legacy objects.ts file - most types moved to service-specific locations
// This file is kept for backward compatibility but should be phased out

// Re-export core types for backward compatibility
export type { AdtObject, ObjectMetadata } from './core';

// Repository-specific types that were here - now in services/repository/types.ts
export interface SearchResult {
  objectType: string;
  objectName: string;
  packageName: string;
  description: string;
  uri: string;
  score: number;
}

// System info - could be moved to discovery service types
export interface SystemInfo {
  systemId: string;
  client: string;
  release: string;
  supportPackage: string;
  patchLevel: string;
  adtVersion: string;
  supportedFeatures: string[];
}
