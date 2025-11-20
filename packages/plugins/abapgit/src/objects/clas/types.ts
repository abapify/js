/**
 * TypeScript types for abapGit CLAS (Class) XML format
 * Based on abapGit LCL_OBJECT_CLAS serializer
 *
 * Note: The abapGit root envelope (abapGit, asx:abap, asx:values) is handled
 * by shared utilities and doesn't need to be defined here.
 */

/**
 * VSEOCLASS table structure - class master data
 */
export interface VseoClassTable {
  /** Class name */
  CLSNAME?: string;
  /** Language key */
  LANGU?: string;
  /** Description */
  DESCRIPT?: string;
  /** State (1=Active) */
  STATE?: string;
  /** Include class definitions */
  CLSCCINCL?: string;
  /** Fixed point arithmetic */
  FIXPT?: string;
  /** Unicode */
  UNICODE?: string;
  /** Has unit tests */
  WITH_UNIT_TESTS?: string;
  /** Category */
  CATEGORY?: string;
  /** Exposure */
  EXPOSURE?: string;
  /** Final */
  CLSFINAL?: string;
  /** Abstract */
  CLSABSTRP?: string;
  /** Friend packages */
  R3RELEASE?: string;
}
