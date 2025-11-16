import { tsxml, InferSchema } from "../../src/index.ts";

// DEVC schema (SAP package structure)
const DevcSchema = tsxml.schema({
  tag: "DEVC",
  fields: {
    ctext: { kind: "elem", name: "CTEXT", schema: tsxml.schema({
      tag: "CTEXT",
      fields: {
        text: { kind: "text", type: "string" }
      }
    }) }
  },
} as const);

// asx:values wrapper
const AsxValuesSchema = tsxml.schema({
  tag: "asx:values",
  fields: {
    devc: { kind: "elem", name: "DEVC", schema: DevcSchema }
  }
} as const);

// Root abapGit package schema
export const AbapGitPackageSchema = tsxml.schema({
  tag: "asx:abap",
  ns: {
    asx: "http://www.sap.com/abapxml"
  },
  fields: {
    version: { kind: "attr", name: "version", type: "string" },
    values: { kind: "elem", name: "asx:values", schema: AsxValuesSchema }
  },
} as const);

export type AbapGitPackageJson = InferSchema<typeof AbapGitPackageSchema>;
