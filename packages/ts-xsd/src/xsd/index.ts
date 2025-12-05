/**
 * XSD Module
 * 
 * Parse and build XSD files with typed Schema objects.
 * Supports full roundtrip: XSD → Schema → XSD
 */

// Types - TypeScript representation of XSD documents
export * from './types';

// Parser - Parse XSD XML to typed Schema objects
export { parseXsd, default as parse } from './parse';

// Builder - Build XSD XML from typed Schema objects
export { buildXsd, type BuildOptions } from './build';

// Helpers - Schema linking utilities
export { resolveImports, linkSchemas } from './helpers';
