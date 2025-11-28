/**
 * TypeScript types for abapGit DOMA (Domain) XML format
 * Based on abapGit LCL_OBJECT_DOMA serializer
 *
 * Note: The abapGit root envelope (abapGit, asx:abap, asx:values) is handled
 * by shared utilities and doesn't need to be defined here.
 */

/**
 * DD01V table structure - domain master data
 */
export interface Dd01vTable {
  /** Domain name */
  DOMNAME?: string;
  /** Language key */
  DDLANGUAGE?: string;
  /** Data type */
  DATATYPE?: string;
  /** Length */
  LENG?: string;
  /** Output length */
  OUTPUTLEN?: string;
  /** Decimals */
  DECIMALS?: string;
  /** Value table exists */
  VALEXI?: string;
  /** Short text */
  DDTEXT?: string;
  /** Domain master language */
  DOMMASTER?: string;
  /** Lowercase allowed */
  LOWERCASE?: string;
  /** Sign */
  SIGNFLAG?: string;
  /** Conversion exit */
  CONVEXIT?: string;
  /** Value table name */
  ENTITYTAB?: string;
}

/**
 * DD07V entry structure - single domain fixed value
 */
export interface Dd07vEntry {
  /** Value position */
  VALPOS?: string;
  /** Language key */
  DDLANGUAGE?: string;
  /** Domain value (low) */
  DOMVALUE_L?: string;
  /** Domain value (high) */
  DOMVALUE_H?: string;
  /** Short text */
  DDTEXT?: string;
}

/**
 * DD07V_TAB structure - container for fixed values
 */
export interface Dd07vTab {
  /** Array of fixed value entries */
  DD07V?: Dd07vEntry[];
}

/**
 * Complete abapGit DOMA structure (asx:values content only)
 */
export interface AbapGitDoma {
  /** Domain master data */
  DD01V: Dd01vTable;
  /** Fixed values table (optional) */
  DD07V_TAB?: Dd07vTab;
}
