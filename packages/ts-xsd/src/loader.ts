/**
 * Node.js custom loader for XSD files
 * 
 * Allows direct import of .xsd files as ts-xsd schemas:
 * 
 *   import Schema from './schema.xsd';
 *   import { parse } from 'ts-xsd';
 *   const data = parse(Schema, xml);
 * 
 * Usage:
 *   node --import ts-xsd/register ./app.ts
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve as resolvePath } from 'node:path';
import { generateFromXsd } from './codegen';

// Cache for parsed schemas
const schemaCache = new Map<string, string>();

/**
 * Resolve hook - handle .xsd specifiers
 */
export async function resolve(
  specifier: string,
  context: { parentURL?: string },
  nextResolve: Function
): Promise<{ url: string; shortCircuit?: boolean }> {
  // Handle .xsd file imports
  if (specifier.endsWith('.xsd')) {
    // Resolve relative to parent
    if (context.parentURL) {
      const parentPath = fileURLToPath(context.parentURL);
      const parentDir = dirname(parentPath);
      const fullPath = resolvePath(parentDir, specifier);
      return {
        url: `file://${fullPath}`,
        shortCircuit: true,
      };
    }
  }
  
  return nextResolve(specifier, context);
}

/**
 * Load hook - parse XSD files and return as module
 */
export async function load(
  url: string,
  context: { format?: string },
  nextLoad: Function
): Promise<{ format: string; source: string; shortCircuit?: boolean }> {
  if (url.endsWith('.xsd')) {
    // Check cache
    if (schemaCache.has(url)) {
      return {
        format: 'module',
        source: schemaCache.get(url)!,
        shortCircuit: true,
      };
    }
    
    const filePath = fileURLToPath(url);
    const xsdContent = readFileSync(filePath, 'utf-8');
    
    // Parse XSD and generate schema object
    const result = generateFromXsd(xsdContent);
    
    // Generate module source that exports the schema
    const moduleSource = `export default ${JSON.stringify(result.schema, null, 2)};`;
    
    schemaCache.set(url, moduleSource);
    
    return {
      format: 'module',
      source: moduleSource,
      shortCircuit: true,
    };
  }
  
  return nextLoad(url, context);
}
