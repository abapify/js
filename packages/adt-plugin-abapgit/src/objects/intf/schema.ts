/**
 * ts-xml schema for abapGit INTF (Interface) XML format
 */

import { tsxml } from 'ts-xml';

/**
 * VSEOINTERF table element schema
 */
export const VseoInterfTableSchema = tsxml.schema({
  tag: 'VSEOINTERF',
  fields: {
    CLSNAME: {
      kind: 'elem',
      name: 'CLSNAME',
      schema: tsxml.schema({
        tag: 'CLSNAME',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    LANGU: {
      kind: 'elem',
      name: 'LANGU',
      schema: tsxml.schema({
        tag: 'LANGU',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    DESCRIPT: {
      kind: 'elem',
      name: 'DESCRIPT',
      schema: tsxml.schema({
        tag: 'DESCRIPT',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    EXPOSURE: {
      kind: 'elem',
      name: 'EXPOSURE',
      schema: tsxml.schema({
        tag: 'EXPOSURE',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    STATE: {
      kind: 'elem',
      name: 'STATE',
      schema: tsxml.schema({
        tag: 'STATE',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    UNICODE: {
      kind: 'elem',
      name: 'UNICODE',
      schema: tsxml.schema({
        tag: 'UNICODE',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    CATEGORY: {
      kind: 'elem',
      name: 'CATEGORY',
      schema: tsxml.schema({
        tag: 'CATEGORY',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
  },
} as const);

/**
 * AbapGit INTF values schema (content that goes inside asx:values)
 * The outer abapGit/asx:abap/asx:values envelope is handled by shared utilities
 */
export const AbapGitIntfValuesSchema = VseoInterfTableSchema;
