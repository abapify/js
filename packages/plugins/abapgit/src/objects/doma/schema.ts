/**
 * ts-xml schema for abapGit DOMA (Domain) XML format
 */

import { tsxml } from 'ts-xml';
import { textElem } from '../../lib/schema-helpers.js';

/**
 * DD01V table element schema - domain master data
 */
export const Dd01vTableSchema = tsxml.schema({
  tag: 'DD01V',
  fields: {
    DOMNAME: textElem('DOMNAME'),
    DDLANGUAGE: textElem('DDLANGUAGE'),
    DATATYPE: textElem('DATATYPE'),
    LENG: textElem('LENG'),
    OUTPUTLEN: textElem('OUTPUTLEN'),
    VALEXI: textElem('VALEXI'),
    DDTEXT: textElem('DDTEXT'),
    DOMMASTER: textElem('DOMMASTER'),
    LOWERCASE: textElem('LOWERCASE'),
    SIGNFLAG: textElem('SIGNFLAG'),
    DECIMALS: textElem('DECIMALS'),
    CONVEXIT: textElem('CONVEXIT'),
    ENTITYTAB: textElem('ENTITYTAB'),
  },
} as const);

/**
 * DD07V entry schema - single fixed value entry
 */
export const Dd07vEntrySchema = tsxml.schema({
  tag: 'DD07V',
  fields: {
    VALPOS: textElem('VALPOS'),
    DDLANGUAGE: textElem('DDLANGUAGE'),
    DOMVALUE_L: textElem('DOMVALUE_L'),
    DOMVALUE_H: textElem('DOMVALUE_H'),
    DDTEXT: textElem('DDTEXT'),
  },
} as const);

/**
 * DD07V_TAB wrapper schema - contains array of DD07V entries
 */
export const Dd07vTabSchema = tsxml.schema({
  tag: 'DD07V_TAB',
  fields: {
    DD07V: {
      kind: 'array',
      schema: Dd07vEntrySchema,
    },
  },
} as const);

/**
 * AbapGit DOMA values schema (content that goes inside asx:values)
 * The outer abapGit/asx:abap/asx:values envelope is handled by shared utilities
 *
 * Domains have TWO root elements under asx:values:
 * - DD01V (domain header)
 * - DD07V_TAB (fixed values table, optional)
 */
export const AbapGitDomaValuesSchema = tsxml.schema({
  tag: 'DOMA',
  fields: {
    DD01V: {
      kind: 'element',
      schema: Dd01vTableSchema,
    },
    DD07V_TAB: {
      kind: 'element',
      schema: Dd07vTabSchema,
    },
  },
} as const);
