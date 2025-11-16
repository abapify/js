import { createNamespace, createAdtSchema } from "../../../base/namespace.ts";
import { AdtCoreObjectFields, adtcore } from "../core/schema.ts";
import { AtomLinkSchema, atom } from "../../atom/schema.ts";
import type { DdicDomainType } from "./types.ts";

/**
 * DDIC (Data Dictionary) namespace schemas
 *
 * Namespace: http://www.sap.com/adt/ddic
 * Prefix: ddic
 */

/**
 * DDIC namespace object
 * Use ddic.uri for namespace URI, ddic.prefix for prefix
 */
export const ddic = createNamespace({
  uri: "http://www.sap.com/adt/ddic",
  prefix: "ddic",
});

/**
 * Domain fixed value schema
 */
export const DdicFixedValueSchema = ddic.schema({
  tag: "ddic:fixedValue",
  fields: {
    lowValue: ddic.elem("lowValue", ddic.schema({ tag: "ddic:lowValue", fields: {} } as const)),
    highValue: ddic.elem("highValue", ddic.schema({ tag: "ddic:highValue", fields: {} } as const)),
    description: ddic.elem("description", ddic.schema({ tag: "ddic:description", fields: {} } as const)),
  },
} as const);

/**
 * Domain fixed values container schema
 */
export const DdicFixedValuesSchema = ddic.schema({
  tag: "ddic:fixedValues",
  fields: {
    fixedValue: ddic.elems("fixedValue", DdicFixedValueSchema),
  },
} as const);

/**
 * Complete ABAP Domain schema
 */
export const DdicDomainSchema = ddic.schema({
  tag: "ddic:domain",
  ns: {
    ddic: ddic.uri,
    adtcore: adtcore.uri,
    atom: atom.uri,
  },
  fields: {
    // ADT core object attributes
    ...AdtCoreObjectFields,

    // Atom links
    links: { kind: "elems" as const, name: "atom:link", schema: AtomLinkSchema },

    // DDIC domain-specific elements
    dataType: ddic.elem("dataType", ddic.schema({ tag: "ddic:dataType", fields: {} } as const)),
    length: ddic.elem("length", ddic.schema({ tag: "ddic:length", fields: {} } as const)),
    decimals: ddic.elem("decimals", ddic.schema({ tag: "ddic:decimals", fields: {} } as const)),
    outputLength: ddic.elem("outputLength", ddic.schema({ tag: "ddic:outputLength", fields: {} } as const)),
    conversionExit: ddic.elem("conversionExit", ddic.schema({ tag: "ddic:conversionExit", fields: {} } as const)),
    valueTable: ddic.elem("valueTable", ddic.schema({ tag: "ddic:valueTable", fields: {} } as const)),
    fixedValues: ddic.elem("fixedValues", DdicFixedValuesSchema),
  },
} as const);

/**
 * ABAP Domain ADT Schema
 *
 * Provides bidirectional XML ↔ TypeScript transformation for ABAP domains
 *
 * @example
 * ```typescript
 * // Parse XML to typed object
 * const domainObj = DdicDomainAdtSchema.fromAdtXml(xmlString);
 * console.log(domainObj.name); // "ZTEST_DOMAIN"
 *
 * // Build XML from typed object
 * const xml = DdicDomainAdtSchema.toAdtXml(domainObj, { xmlDecl: true });
 * ```
 */
export const DdicDomainAdtSchema = createAdtSchema(DdicDomainSchema);
