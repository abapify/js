/**
 * Schema Loader - Load and parse XSD files from disk
 * 
 * Simple loader that reads XSD files and parses them into Schema objects.
 * Resolution of imports/includes is handled by the resolver.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Schema } from './types';
import { parseXsd } from './parse';

// =============================================================================
// Types
// =============================================================================

/** Function to load XSD content from a schemaLocation path */
export type XsdLoader = (schemaLocation: string, basePath: string) => string | null;

/** Options for schema loading */
export interface LoaderOptions {
  /** Base directory for resolving relative paths */
  basePath?: string;
  /** Custom loader function (default: reads from filesystem) */
  loader?: XsdLoader;
}

// =============================================================================
// Default Loader
// =============================================================================

/**
 * Default XSD loader - reads from filesystem
 */
export function defaultLoader(schemaLocation: string, basePath: string): string | null {
  const fullPath = resolve(basePath, schemaLocation);
  if (!existsSync(fullPath)) {
    return null;
  }
  return readFileSync(fullPath, 'utf-8');
}

// =============================================================================
// Schema Loader Functions
// =============================================================================

/**
 * Load and parse a single XSD file.
 * Does NOT resolve imports/includes - use resolver for that.
 */
export function loadSchema(
  schemaPath: string,
  options: LoaderOptions = {}
): Schema {
  const {
    basePath = dirname(schemaPath),
    loader = defaultLoader,
  } = options;

  const content = loader(schemaPath, basePath);
  if (!content) {
    throw new Error(`Failed to load schema: ${schemaPath}`);
  }

  const schema = parseXsd(content);
  // Set $filename for reference
  Object.assign(schema, { $filename: schemaPath });
  
  return schema;
}

/**
 * Load and parse XSD content from a string.
 */
export function parseSchemaContent(content: string, filename?: string): Schema {
  const schema = parseXsd(content);
  if (filename) {
    Object.assign(schema, { $filename: filename });
  }
  return schema;
}

/**
 * Create a schema loader function that can be passed to the resolver.
 * The resolver will call this to load schemas referenced by schemaLocation.
 */
export function createSchemaLoader(
  basePath: string,
  loader: XsdLoader = defaultLoader
): (schemaLocation: string) => Schema | null {
  const cache = new Map<string, Schema>();
  
  return (schemaLocation: string): Schema | null => {
    const fullPath = resolve(basePath, schemaLocation);
    
    // Check cache
    const cached = cache.get(fullPath);
    if (cached) {
      return cached;
    }
    
    // Load and parse
    const content = loader(schemaLocation, basePath);
    if (!content) {
      return null;
    }
    
    const schema = parseXsd(content);
    Object.assign(schema, { $filename: schemaLocation });
    cache.set(fullPath, schema);
    
    return schema;
  };
}
