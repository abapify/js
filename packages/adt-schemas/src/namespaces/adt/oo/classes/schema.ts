import { createNamespace, createAdtSchema } from "../../../../base/namespace.ts";
import { AdtCoreObjectFields, adtcore } from "../../core/schema.ts";
import { AtomLinkSchema, atom } from "../../../atom/schema.ts";
import type { ClassType } from "./types.ts";

/**
 * ABAP OO Class namespace schemas
 *
 * Namespace: http://www.sap.com/adt/oo/classes
 * Prefix: class
 */

/**
 * Class namespace object
 * Use class.uri for namespace URI, class.prefix for prefix
 */
export const classNs = createNamespace({
  uri: "http://www.sap.com/adt/oo/classes",
  prefix: "class",
});

/**
 * ABAP Source namespace (for sourceUri attribute)
 */
export const abapsource = createNamespace({
  uri: "http://www.sap.com/adt/abapsource",
  prefix: "abapsource",
});

/**
 * ABAP OO namespace (for oo-specific attributes)
 */
export const abapoo = createNamespace({
  uri: "http://www.sap.com/adt/oo",
  prefix: "abapoo",
});

/**
 * Class include element schema
 */
export const ClassIncludeSchema = classNs.schema({
  tag: "class:include",
  fields: {
    // ADT core attributes
    ...AdtCoreObjectFields,

    // Class-specific attributes
    includeType: classNs.attr("includeType"),

    // ABAP Source attributes
    sourceUri: abapsource.attr("sourceUri"),

    // Atom links
    links: { kind: "elems" as const, name: "atom:link", schema: AtomLinkSchema },
  },
} as const);

/**
 * Complete ABAP Class schema
 */
export const ClassSchema = classNs.schema({
  tag: "class:abapClass",
  ns: {
    class: classNs.uri,
    adtcore: adtcore.uri,
    atom: atom.uri,
    abapsource: abapsource.uri,
    abapoo: abapoo.uri,
  },
  fields: {
    // ADT core object attributes
    ...AdtCoreObjectFields,

    // Class-specific attributes
    final: classNs.attr("final"),
    abstract: classNs.attr("abstract"),
    visibility: classNs.attr("visibility"),
    category: classNs.attr("category"),
    hasTests: classNs.attr("hasTests"),
    sharedMemoryEnabled: classNs.attr("sharedMemoryEnabled"),

    // ABAP Source attributes
    sourceUri: abapsource.attr("sourceUri"),
    fixPointArithmetic: abapsource.attr("fixPointArithmetic"),
    activeUnicodeCheck: abapsource.attr("activeUnicodeCheck"),

    // ABAP OO attributes
    forkable: abapoo.attr("forkable"),

    // Atom links
    links: { kind: "elems" as const, name: "atom:link", schema: AtomLinkSchema },

    // Class includes
    include: classNs.elems("include", ClassIncludeSchema),
  },
} as const);

/**
 * ABAP Class ADT Schema
 *
 * Provides bidirectional XML ↔ TypeScript transformation for ABAP classes
 *
 * @example
 * ```typescript
 * // Parse XML to typed object
 * const classObj = ClassAdtSchema.fromAdtXml(xmlString);
 * console.log(classObj.name); // "ZCL_MY_CLASS"
 * console.log(classObj.include); // ClassIncludeElementType[]
 *
 * // Build XML from typed object
 * const xml = ClassAdtSchema.toAdtXml(classObj, { xmlDecl: true });
 * ```
 */
export const ClassAdtSchema = createAdtSchema(ClassSchema);
