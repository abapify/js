/**
 * Decoupled SAP ADT Schemas
 *
 * Organized by namespace:
 * - adtcore: Core ADT attributes and references
 * - atom: Atom feed/link elements
 * - sap-package: SAP ABAP package structures
 *
 * Each module exports:
 * - Namespace URI constants (ADTCORE_NS, ATOM_NS, PAK_NS)
 * - Schema definitions
 * - Reusable field mixins
 */

// Re-export all schemas and namespace constants
export * from "./adtcore.schema.ts";
export * from "./atom.schema.ts";
export * from "./sap-package.schema.ts";

// Legacy exports for backward compatibility
export { SapPackageSchema as PackageSchema } from "./sap-package.schema.ts";
export type { InferSchema } from "../../src/index.ts";
