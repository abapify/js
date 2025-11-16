import { createNamespace, createAdtSchema } from "../../../../base/namespace.ts";
import { AdtCoreObjectFields, adtcore } from "../../core/schema.ts";
import { AtomLinkSchema, atom } from "../../../atom/schema.ts";
import { abapsource, abapoo } from "../classes/schema.ts";
import type { InterfaceType } from "./types.ts";

// Re-export shared namespaces
export { abapsource, abapoo };

/**
 * ABAP OO Interface namespace schemas
 *
 * Namespace: http://www.sap.com/adt/oo/interfaces
 * Prefix: intf
 */

/**
 * Interface namespace object
 * Use intf.uri for namespace URI, intf.prefix for prefix
 */
export const intf = createNamespace({
  uri: "http://www.sap.com/adt/oo/interfaces",
  prefix: "intf",
});

/**
 * Complete ABAP Interface schema
 */
export const InterfaceSchema = intf.schema({
  tag: "intf:abapInterface",
  ns: {
    intf: intf.uri,
    adtcore: adtcore.uri,
    atom: atom.uri,
    abapsource: abapsource.uri,
    abapoo: abapoo.uri,
  },
  fields: {
    // ADT core object attributes
    ...AdtCoreObjectFields,

    // Interface-specific attributes
    abstract: intf.attr("abstract"),
    category: intf.attr("category"),

    // ABAP Source attributes
    sourceUri: abapsource.attr("sourceUri"),
    fixPointArithmetic: abapsource.attr("fixPointArithmetic"),
    activeUnicodeCheck: abapsource.attr("activeUnicodeCheck"),

    // ABAP OO attributes
    forkable: abapoo.attr("forkable"),

    // Atom links
    links: { kind: "elems" as const, name: "atom:link", schema: AtomLinkSchema },
  },
} as const);

/**
 * ABAP Interface ADT Schema
 *
 * Provides bidirectional XML ↔ TypeScript transformation for ABAP interfaces
 *
 * @example
 * ```typescript
 * // Parse XML to typed object
 * const interfaceObj = InterfaceAdtSchema.fromAdtXml(xmlString);
 * console.log(interfaceObj.name); // "ZIF_MY_INTERFACE"
 *
 * // Build XML from typed object
 * const xml = InterfaceAdtSchema.toAdtXml(interfaceObj, { xmlDecl: true });
 * ```
 */
export const InterfaceAdtSchema = createAdtSchema(InterfaceSchema);
