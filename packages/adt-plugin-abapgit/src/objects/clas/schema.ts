/**
 * ts-xml schema for abapGit CLAS (Class) XML format
 */

import { tsxml } from 'ts-xml';

/**
 * VSEOCLASS table element schema
 */
export const VseoClassTableSchema = tsxml.schema({
  tag: 'VSEOCLASS',
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
    STATE: {
      kind: 'elem',
      name: 'STATE',
      schema: tsxml.schema({
        tag: 'STATE',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    CLSCCINCL: {
      kind: 'elem',
      name: 'CLSCCINCL',
      schema: tsxml.schema({
        tag: 'CLSCCINCL',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    FIXPT: {
      kind: 'elem',
      name: 'FIXPT',
      schema: tsxml.schema({
        tag: 'FIXPT',
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
    WITH_UNIT_TESTS: {
      kind: 'elem',
      name: 'WITH_UNIT_TESTS',
      schema: tsxml.schema({
        tag: 'WITH_UNIT_TESTS',
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
    EXPOSURE: {
      kind: 'elem',
      name: 'EXPOSURE',
      schema: tsxml.schema({
        tag: 'EXPOSURE',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    CLSFINAL: {
      kind: 'elem',
      name: 'CLSFINAL',
      schema: tsxml.schema({
        tag: 'CLSFINAL',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    CLSABSTRP: {
      kind: 'elem',
      name: 'CLSABSTRP',
      schema: tsxml.schema({
        tag: 'CLSABSTRP',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
    R3RELEASE: {
      kind: 'elem',
      name: 'R3RELEASE',
      schema: tsxml.schema({
        tag: 'R3RELEASE',
        fields: { text: { kind: 'text', type: 'string' } },
      }),
    },
  },
} as const);

/**
 * AbapGit CLAS values schema (content that goes inside asx:values)
 * The outer abapGit/asx:abap/asx:values envelope is handled by shared utilities
 */
export const AbapGitClasValuesSchema = VseoClassTableSchema;
