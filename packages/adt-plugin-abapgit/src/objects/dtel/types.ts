/**
 * TypeScript types for abapGit DTEL (Data Element) XML format
 * Based on abapGit LCL_OBJECT_DTEL serializer
 *
 * Note: The abapGit root envelope (abapGit, asx:abap, asx:values) is handled
 * by shared utilities and doesn't need to be defined here.
 */

/**
 * DD04V table structure - data element master data
 */
export interface Dd04vTable {
  /** Data element name */
  ROLLNAME?: string;
  /** Language key */
  DDLANGUAGE?: string;
  /** Header length */
  HEADLEN?: string;
  /** Screen length 1 */
  SCRLEN1?: string;
  /** Screen length 2 */
  SCRLEN2?: string;
  /** Screen length 3 */
  SCRLEN3?: string;
  /** Short text */
  DDTEXT?: string;
  /** Data element master language */
  DTELMASTER?: string;
  /** Data type */
  DATATYPE?: string;
  /** Length */
  LENG?: string;
  /** Decimals */
  DECIMALS?: string;
  /** Output length */
  OUTPUTLEN?: string;
  /** Reference table */
  REFKIND?: string;
  /** Reference field */
  REFTABLE?: string;
  /** Domain name */
  DOMNAME?: string;
}
