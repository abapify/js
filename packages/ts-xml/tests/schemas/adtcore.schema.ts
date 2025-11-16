import { tsxml } from "../../src/index.ts";

/**
 * ADT Core namespace schemas
 * Common elements/attributes used across SAP ADT
 */

// Namespace URI
export const ADTCORE_NS = "http://www.sap.com/adt/core";

// Simple reference with adtcore attributes
export const AdtCoreReference = tsxml.schema({
  tag: "adtcore:packageRef", // Can be overridden when used
  fields: {
    uri: { kind: "attr", name: "adtcore:uri", type: "string" },
    type: { kind: "attr", name: "adtcore:type", type: "string" },
    name: { kind: "attr", name: "adtcore:name", type: "string" },
    description: { kind: "attr", name: "adtcore:description", type: "string" },
  },
} as const);

// Generic adtcore object attributes (mixin pattern)
export const adtCoreObjectFields = {
  responsible: { kind: "attr" as const, name: "adtcore:responsible", type: "string" as const },
  masterLanguage: { kind: "attr" as const, name: "adtcore:masterLanguage", type: "string" as const },
  name: { kind: "attr" as const, name: "adtcore:name", type: "string" as const },
  type: { kind: "attr" as const, name: "adtcore:type", type: "string" as const },
  changedAt: { kind: "attr" as const, name: "adtcore:changedAt", type: "string" as const },
  version: { kind: "attr" as const, name: "adtcore:version", type: "string" as const },
  createdAt: { kind: "attr" as const, name: "adtcore:createdAt", type: "string" as const },
  changedBy: { kind: "attr" as const, name: "adtcore:changedBy", type: "string" as const },
  createdBy: { kind: "attr" as const, name: "adtcore:createdBy", type: "string" as const },
  description: { kind: "attr" as const, name: "adtcore:description", type: "string" as const },
  descriptionTextLimit: { kind: "attr" as const, name: "adtcore:descriptionTextLimit", type: "string" as const },
  language: { kind: "attr" as const, name: "adtcore:language", type: "string" as const },
};
