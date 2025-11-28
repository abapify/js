/**
 * SAP ADT System Information Schema
 *
 * Defines the structure of system information responses from SAP ADT.
 * Contains system details like version, client, user, etc.
 */

/**
 * System Information Schema
 *
 * Note: This endpoint returns JSON (not XML), so we use a TypeScript interface
 * Field names match SAP's actual JSON response (camelCase)
 */
export interface SystemInformationJson {
  // System identification
  systemID?: string;
  client?: string;

  // User information
  userName?: string;
  userFullName?: string;
  language?: string;

  // System version
  release?: string;
  sapRelease?: string;

  // Additional system properties
  [key: string]: unknown;
}

/**
 * Inferrable schema for speci type inference
 * The _infer property tells speci what type to infer from this schema
 */
export const SystemInformationSchema = {
  _infer: undefined as unknown as SystemInformationJson,
} as const;

export type SystemInformationXml = SystemInformationJson;
