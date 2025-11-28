/**
 * Batch code generation for multiple XSD files
 * 
 * Generates TypeScript schemas from multiple XSD files + index file.
 * Includes dependency resolution and element type extraction.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { parse as parsePath, join, basename } from 'node:path';
import { generateFromXsd } from './index';
import type { CodegenOptions, ImportResolver, ImportedSchema } from './types';
import type { Generator } from './generator';

/**
 * Scan a directory for XSD files
 * 
 * @param dir - Directory to scan
 * @returns Map of schema name to file path
 */
export function scanXsdDirectory(dir: string): Map<string, string> {
  const files = new Map<string, string>();
  
  if (!existsSync(dir)) {
    return files;
  }
  
  for (const file of readdirSync(dir)) {
    if (file.endsWith('.xsd')) {
      files.set(basename(file, '.xsd'), join(dir, file));
    }
  }
  
  return files;
}

/**
 * Collect all dependencies for schemas (recursive)
 * 
 * Parses XSD files to find xsd:import statements and collects
 * all transitive dependencies.
 * 
 * @param schemaNames - Initial schema names to process
 * @param xsdFiles - Map of schema name to file path
 * @returns Set of all schema names including dependencies
 */
export function collectDependencies(
  schemaNames: string[],
  xsdFiles: Map<string, string>
): Set<string> {
  const collected = new Set<string>();
  
  function collect(schemaName: string): void {
    if (collected.has(schemaName)) return;
    
    const xsdPath = xsdFiles.get(schemaName);
    if (!xsdPath) return;
    
    collected.add(schemaName);
    
    // Parse XSD to find imports
    const content = readFileSync(xsdPath, 'utf-8');
    const importMatches = content.matchAll(/schemaLocation="([^"]+)"/g);
    
    for (const match of importMatches) {
      const location = match[1];
      // Extract schema name from location (handles both relative and path-based)
      const depMatch = location.match(/\/([^/]+)\.xsd$/) || location.match(/^([^/]+)\.xsd$/);
      if (depMatch) {
        collect(depMatch[1]);
      }
    }
  }
  
  for (const name of schemaNames) {
    collect(name);
  }
  
  return collected;
}

/**
 * Extract element→type mappings from XSD files
 * 
 * This is used to resolve element references like ref="atom:link" to their actual types.
 * 
 * @param xsdFiles - Map of schema name to file path
 * @returns Array of imported schema metadata
 */
export function extractImportedSchemas(xsdFiles: Map<string, string>): ImportedSchema[] {
  const schemas: ImportedSchema[] = [];
  
  for (const [, xsdPath] of xsdFiles) {
    const content = readFileSync(xsdPath, 'utf-8');
    
    // Extract namespace
    const nsMatch = content.match(/targetNamespace="([^"]+)"/);
    const namespace = nsMatch?.[1] || '';
    
    // Extract element→type mappings
    const elements = new Map<string, string>();
    const elementMatches = content.matchAll(/<(?:xs|xsd):element\s+name="([^"]+)"[^>]*type="([^"]+)"/g);
    
    for (const match of elementMatches) {
      const name = match[1];
      const type = match[2];
      // Strip namespace prefix from type
      const typeName = type.includes(':') ? type.split(':').pop()! : type;
      elements.set(name, typeName);
    }
    
    if (elements.size > 0) {
      schemas.push({ namespace, elements });
    }
  }
  
  return schemas;
}

export interface BatchOptions {
  /** Output directory */
  output: string;
  /** Generator to use (use factory() or raw() to create) */
  generator: Generator;
  /** Import resolver */
  resolver?: ImportResolver;
  /** Namespace prefix */
  prefix?: string;
  /** 
   * Specific schemas to generate (if not provided, generates all).
   * Dependencies are automatically included.
   */
  schemas?: string[];
  /** Generate stubs for missing dependencies (default: true) */
  stubs?: boolean;
  /** Pre-extracted imported schemas for element resolution */
  importedSchemas?: ImportedSchema[];
}

export interface BatchResult {
  /** Successfully generated schema names */
  generated: string[];
  /** Failed schema names */
  failed: string[];
}

/**
 * Generate TypeScript schemas from multiple XSD files
 * 
 * @param files - Array of XSD file paths
 * @param options - Batch generation options
 * @param onProgress - Optional progress callback
 */
export async function generateBatch(
  files: string[],
  options: BatchOptions,
  onProgress?: (schemaName: string, success: boolean, error?: string) => void
): Promise<BatchResult> {
  const { output, generator, resolver, prefix, stubs = true, importedSchemas } = options;

  // Ensure output directory exists
  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true });
  }

  // Build map of available files
  const xsdFiles = new Map<string, string>();
  for (const file of files) {
    xsdFiles.set(parsePath(file).name, file);
  }

  // Determine which schemas to generate
  let schemasToGenerate: Set<string>;
  if (options.schemas && options.schemas.length > 0) {
    // Collect specified schemas + their dependencies
    schemasToGenerate = collectDependencies(options.schemas, xsdFiles);
  } else {
    // Generate all
    schemasToGenerate = new Set(xsdFiles.keys());
  }

  // Extract imported schemas if not provided
  const resolvedImportedSchemas = importedSchemas ?? extractImportedSchemas(xsdFiles);

  const generated: string[] = [];
  const failed: string[] = [];

  // Generate all schemas
  for (const schemaName of schemasToGenerate) {
    const file = xsdFiles.get(schemaName);
    
    if (!file) {
      // Missing dependency - generate stub if enabled
      if (stubs && generator.generateStub) {
        const stubCode = generator.generateStub(schemaName);
        if (stubCode) {
          const outputFile = join(output, `${schemaName}.ts`);
          writeFileSync(outputFile, stubCode, 'utf-8');
          generated.push(schemaName);
          onProgress?.(schemaName, true);
        }
      }
      continue;
    }

    try {
      const xsdContent = readFileSync(file, 'utf-8');
      const codegenOptions: CodegenOptions = {
        prefix,
        resolver,
        importedSchemas: resolvedImportedSchemas,
      };
      
      const result = generateFromXsd(xsdContent, codegenOptions, generator);
      const outputFile = join(output, `${schemaName}.ts`);
      writeFileSync(outputFile, result.code, 'utf-8');
      generated.push(schemaName);
      onProgress?.(schemaName, true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      failed.push(schemaName);
      onProgress?.(schemaName, false, errorMsg);
    }
  }

  // Generate index file
  const indexCode = generator.generateIndex?.(generated);
  if (indexCode) {
    const indexFile = join(output, 'index.ts');
    writeFileSync(indexFile, indexCode, 'utf-8');
    onProgress?.('index.ts', true);
  }

  return { generated, failed };
}
