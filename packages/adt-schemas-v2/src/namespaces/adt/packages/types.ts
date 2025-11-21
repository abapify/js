/**
 * SAP Package clean API types
 *
 * Developer-friendly types with flat structure
 */

/**
 * Package (Clean API)
 *
 * Flat, developer-friendly interface for SAP packages
 * All nested XML structures are flattened for ease of use
 */
export interface Package {
  // Core attributes (from adtcore)
  name?: string;
  uri?: string;
  type?: string;
  description?: string;
  version?: string;
  language?: string;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
  changedBy?: string;
  createdBy?: string;
  changedAt?: string;
  createdAt?: string;

  // Package attributes (flattened from pak:attributes)
  packageType?: string;
  isEncapsulated?: boolean; // Converted from string to boolean
  languageVersion?: string;

  // Super package (flattened)
  superPackageName?: string;
  superPackageUri?: string;

  // Application component (flattened)
  applicationComponentName?: string;
  applicationComponentDescription?: string;

  // Links
  links?: Array<{
    href?: string;
    rel?: string;
    type?: string;
    title?: string;
  }>;
}
