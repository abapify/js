/**
 * ts-xml schema for abapGit DEVC (Package) XML format
 */

import { tsxml } from 'ts-xml';
import { textElem } from '../../lib/schema-helpers.js';

/**
 * DEVC table element schema
 */
const DevcTableSchema = tsxml.schema({
  tag: 'DEVC',
  fields: {
    DEVCLASS: textElem('DEVCLASS'),
    CTEXT: textElem('CTEXT'),
    SPRAS: textElem('SPRAS'),
    PARENTCL: textElem('PARENTCL'),
    DLVUNIT: textElem('DLVUNIT'),
    COMPONENT: textElem('COMPONENT'),
    PDEVCLASS: textElem('PDEVCLASS'),
    RESPONSIBLE: textElem('RESPONSIBLE'),
    CREATED_BY: textElem('CREATED_BY'),
    CREATED_ON: textElem('CREATED_ON'),
    CHANGED_BY: textElem('CHANGED_BY'),
    CHANGED_ON: textElem('CHANGED_ON'),
    CHECK_RULE: textElem('CHECK_RULE'),
    TRANSPORT_LAYER: textElem('TRANSPORT_LAYER'),
    ABAP_LANGUAGE_VERSION: textElem('ABAP_LANGUAGE_VERSION'),
  },
} as const);

/**
 * TDEVC table element schema (package interface)
 */
const TdevcTableSchema = tsxml.schema({
  tag: 'TDEVC',
  fields: {
    DEVCLASS: {
      kind: 'elem',
      name: 'DEVCLASS',
      schema: tsxml.schema({
        tag: 'DEVCLASS',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    INTF_NAME: {
      kind: 'elem',
      name: 'INTF_NAME',
      schema: tsxml.schema({
        tag: 'INTF_NAME',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    POSITION: {
      kind: 'elem',
      name: 'POSITION',
      schema: tsxml.schema({
        tag: 'POSITION',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
  },
} as const);

/**
 * AbapGit DEVC values schema (content that goes inside asx:values)
 * The outer abapGit/asx:abap/asx:values envelope is handled by shared utilities
 *
 * Note: We export DevcTableSchema directly because the asx:values content
 * should contain <DEVC> and <TDEVC> elements directly, not wrapped in a container.
 */
export const AbapGitDevcValuesSchema = DevcTableSchema;

// Export individual schemas for testing/reuse
export { DevcTableSchema, TdevcTableSchema };
