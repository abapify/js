/**
 * TypeScript types for abapGit DEVC (Package) XML format
 * Based on abapGit LCL_OBJECT_DEVC serializer
 *
 * Note: The abapGit root envelope (abapGit, asx:abap, asx:values) is handled
 * by shared utilities and doesn't need to be defined here.
 */

/**
 * DEVC table structure - package master data
 */
export interface DevcTable {
  /** Package name */
  DEVCLASS?: string;
  /** Description text */
  CTEXT?: string;
  /** Original language */
  SPRAS?: string;
  /** Parent package */
  PARENTCL?: string;
  /** Software component */
  DLVUNIT?: string;
  /** Application component */
  COMPONENT?: string;
  /** Package type (development/structure/main) */
  PDEVCLASS?: string;
  /** Person responsible */
  RESPONSIBLE?: string;
  /** Created by */
  CREATED_BY?: string;
  /** Created on */
  CREATED_ON?: string;
  /** Changed by */
  CHANGED_BY?: string;
  /** Changed on */
  CHANGED_ON?: string;
  /** Package checks active */
  CHECK_RULE?: string;
  /** Transport layer */
  TRANSPORT_LAYER?: string;
  /** ABAP language version */
  ABAP_LANGUAGE_VERSION?: string;
}

/**
 * TDEVC table structure - package interface
 */
export interface TdevcTable {
  /** Package name */
  DEVCLASS?: string;
  /** Interface name */
  INTF_NAME?: string;
  /** Position */
  POSITION?: string;
}

/**
 * Complete abapGit DEVC structure (asx:values content only)
 * The outer abapGit/asx:abap envelope is handled by shared utilities
 */
export interface AbapGitDevc {
  /** Main package data */
  DEVC: DevcTable;
  /** Package interfaces (optional) */
  TDEVC?: TdevcTable[];
}
