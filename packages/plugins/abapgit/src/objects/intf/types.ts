/**
 * TypeScript types for abapGit INTF (Interface) XML format
 * Based on abapGit LCL_OBJECT_INTF serializer
 *
 * Note: The abapGit root envelope (abapGit, asx:abap, asx:values) is handled
 * by shared utilities and doesn't need to be defined here.
 */

/**
 * VSEOINTERF table structure - interface master data
 */
export interface VseoInterfTable {
  /** Interface name */
  CLSNAME?: string;
  /** Language key */
  LANGU?: string;
  /** Description */
  DESCRIPT?: string;
  /** Exposure (2=Public) */
  EXPOSURE?: string;
  /** State (1=Active) */
  STATE?: string;
  /** Unicode */
  UNICODE?: string;
  /** Category */
  CATEGORY?: string;
}
