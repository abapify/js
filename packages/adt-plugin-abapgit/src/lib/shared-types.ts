/**
 * Shared TypeScript types for abapGit XML format
 * These types are common across all object serializers
 */

/**
 * Generic abapGit root structure
 * All abapGit object XMLs follow this envelope pattern
 */
export interface AbapGitRoot<T> {
  abapGit: {
    /** abapGit format version (e.g., "v1.0.0") */
    version: string;
    /** Serializer class name (e.g., "LCL_OBJECT_DEVC", "LCL_OBJECT_CLAS") */
    serializer: string;
    /** Serializer version (e.g., "v1.0.0") */
    serializer_version: string;
    /** ASX envelope with actual object data */
    'asx:abap': {
      /** ASX format version (usually "1.0") */
      version: string;
      /** Container for the actual object data */
      'asx:values': T;
    };
  };
}

/**
 * Helper type to extract the inner values type from AbapGitRoot
 */
export type AbapGitValues<T> = T extends AbapGitRoot<infer V> ? V : never;
