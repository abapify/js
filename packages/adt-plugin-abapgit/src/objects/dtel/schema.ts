/**
 * ts-xml schema for abapGit DTEL (Data Element) XML format
 */

import { tsxml } from 'ts-xml';
import { textElem } from '../../lib/schema-helpers.js';

/**
 * DD04V table element schema
 */
export const Dd04vTableSchema = tsxml.schema({
  tag: 'DD04V',
  fields: {
    ROLLNAME: textElem('ROLLNAME'),
    DDLANGUAGE: textElem('DDLANGUAGE'),
    HEADLEN: textElem('HEADLEN'),
    SCRLEN1: textElem('SCRLEN1'),
    SCRLEN2: textElem('SCRLEN2'),
    SCRLEN3: textElem('SCRLEN3'),
    DDTEXT: textElem('DDTEXT'),
    DTELMASTER: textElem('DTELMASTER'),
    DATATYPE: textElem('DATATYPE'),
    LENG: textElem('LENG'),
    DECIMALS: textElem('DECIMALS'),
    OUTPUTLEN: textElem('OUTPUTLEN'),
    REFKIND: textElem('REFKIND'),
    REFTABLE: textElem('REFTABLE'),
    DOMNAME: textElem('DOMNAME'),
  },
} as const);

/**
 * AbapGit DTEL values schema (content that goes inside asx:values)
 * The outer abapGit/asx:abap/asx:values envelope is handled by shared utilities
 */
export const AbapGitDtelValuesSchema = Dd04vTableSchema;
