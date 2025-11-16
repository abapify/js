/**
 * Legacy PackageSchema - now imports from decoupled schemas
 *
 * This file is kept for backward compatibility.
 * New code should use SapPackageSchema from sap-package.schema.ts
 */

// Simply re-export the new decoupled schema
export { SapPackageSchema as PackageSchema } from "./sap-package.schema.ts";
export type { InferSchema } from "../../src/index.ts";

// Also export the JSON type for convenience
import type { InferSchema } from "../../src/index.ts";
import { SapPackageSchema } from "./sap-package.schema.ts";

export type PackageJson = InferSchema<typeof SapPackageSchema>;
