/**
 * ADT Schemas - ts-xml based schema library
 *
 * Each namespace is in its own folder with:
 * - `types.ts` - TypeScript input types
 * - `schema.ts` - ts-xml schema definitions + namespace objects
 * - `index.ts` - Barrel exports
 *
 * Namespace objects provide:
 * - `.uri` - Namespace URI
 * - `.prefix` - Namespace prefix
 * - `.attr()`, `.elem()`, `.elems()` - Field helpers
 * - `.schema()` - Schema factory
 *
 * Cross-references are used to avoid duplication:
 * - Common field mixins (AdtCoreFields, AdtCoreObjectFields)
 * - Shared schemas (AtomLinkSchema, PackageRefSchema)
 * - Type imports across namespaces
 */

// Base utilities (namespace factory, parse/build functions)
export * from "./base/index";

// ADT Core - foundational namespace
export * from "./namespaces/adt/core/index";

// Atom - standard syndication format
export * from "./namespaces/atom/index";

// Packages - SAP package objects
export * from "./namespaces/adt/packages/index";

// Classes - ABAP OO Classes
export * from "./namespaces/adt/oo/classes/index";

// Interfaces - ABAP OO Interfaces
export * from "./namespaces/adt/oo/interfaces/index";

// DDIC - Data Dictionary objects
export * from "./namespaces/adt/ddic/index";
