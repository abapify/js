/**
 * Batch code generation for multiple XSD files
 * 
 * Generates TypeScript schemas from multiple XSD files + index file.
 * Includes dependency resolution and element type extraction.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
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
  /** Clean output directory before generating (default: false) */
  clean?: boolean;
  /** 
   * Extract expanded types to .types.ts files after generation.
   * Requires tsconfig.json in the output directory's parent.
   */
  extractTypes?: boolean;
  /** Path to tsconfig.json for type extraction (auto-detected if not provided) */
  tsConfigPath?: string;
  /** Factory path for regenerating index with extracted types (default: '../schema') */
  factoryPath?: string;
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
  const { output, generator, resolver, prefix, stubs = true, importedSchemas, clean = false } = options;

  // Clean output directory if requested
  if (clean && existsSync(output)) {
    rmSync(output, { recursive: true });
  }

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
      
      const result = generateFromXsd(xsdContent, codegenOptions, generator, {}, schemaName);
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

  // Generate index file (initial version without extracted types)
  let indexCode = generator.generateIndex?.(generated);
  if (indexCode) {
    const indexFile = join(output, 'index.ts');
    writeFileSync(indexFile, indexCode, 'utf-8');
    onProgress?.('index.ts', true);
  }

  // Extract types if enabled
  if (options.extractTypes) {
    onProgress?.('[types] Extracting .d.ts type definitions...', true);
    const { extractedTypes, embeddedTypes } = await extractTypesFromIndex(output, options.tsConfigPath, onProgress);
    
    // Re-generate schemas with embedded types (avoids TS7056)
    if (embeddedTypes.size > 0) {
      onProgress?.('[types] Re-generating schemas with embedded types...', true);
      const { factory } = await import('../generators/factory');
      const factoryOptions = {
        path: options.factoryPath || '../schema',
        exportMergedType: true,
        exportElementTypes: true,
        extractedTypes,
        embeddedTypes,
      };
      const embeddedGenerator = factory(factoryOptions);
      
      // Re-generate each schema with embedded type
      for (const schemaName of embeddedTypes.keys()) {
        const file = xsdFiles.get(schemaName);
        if (!file) continue;
        
        try {
          const xsdContent = readFileSync(file, 'utf-8');
          const codegenOptions: CodegenOptions = {
            prefix,
            resolver,
            importedSchemas: resolvedImportedSchemas,
          };
          
          const result = generateFromXsd(xsdContent, codegenOptions, embeddedGenerator, {}, schemaName);
          const outputFile = join(output, `${schemaName}.ts`);
          writeFileSync(outputFile, result.code, 'utf-8');
          onProgress?.(`  ${schemaName}.ts (embedded type)`, true);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onProgress?.(`  ${schemaName}.ts`, false, errorMsg);
        }
      }
    }
    
    // Regenerate index with extracted types info (so it re-exports from .d.ts files)
    if (extractedTypes.length > 0 && generator.generateIndex) {
      // Create a new generator with extractedTypes option
      const { factory } = await import('../generators/factory');
      const factoryOptions = {
        path: options.factoryPath || '../schema',
        exportMergedType: true,
        extractedTypes,
      };
      const updatedGenerator = factory(factoryOptions);
      indexCode = updatedGenerator.generateIndex?.(generated);
      if (indexCode) {
        const indexFile = join(output, 'index.ts');
        writeFileSync(indexFile, indexCode, 'utf-8');
        onProgress?.('index.ts (updated)', true);
      }
    }
  }

  return { generated, failed };
}

/**
 * Result of type extraction
 */
interface ExtractTypesResult {
  /** List of schema names that had types extracted */
  extractedTypes: string[];
  /** Map of schema name to interface code for embedding */
  embeddedTypes: Map<string, string>;
}

/**
 * Extract expanded types from generated schema files using the types generator.
 * 
 * Uses generators/types.ts to extract fully expanded TypeScript interfaces
 * from the InferXsd types in generated schema files.
 */
async function extractTypesFromIndex(
  outputDir: string,
  tsConfigPath?: string,
  onProgress?: (name: string, success: boolean, error?: string) => void
): Promise<ExtractTypesResult> {
  const emptyResult: ExtractTypesResult = { extractedTypes: [], embeddedTypes: new Map() };
  
  try {
    const { types } = await import('../generators/types');
    
    // Find tsconfig.json
    let configPath = tsConfigPath;
    if (!configPath) {
      let searchDir = outputDir;
      for (let i = 0; i < 5; i++) {
        const candidate = join(searchDir, 'tsconfig.json');
        if (existsSync(candidate)) {
          configPath = candidate;
          break;
        }
        searchDir = join(searchDir, '..');
      }
    }
    
    if (!configPath || !existsSync(configPath)) {
      onProgress?.('types', false, 'tsconfig.json not found');
      return emptyResult;
    }
    
    // Initialize the types generator
    const typesGen = types();
    typesGen.init(configPath);
    
    // Find all schema files (exclude index.ts and .d.ts)
    const files = readdirSync(outputDir)
      .filter(f => f.endsWith('.ts') && f !== 'index.ts' && !f.endsWith('.d.ts'));
    
    const extractedTypes: string[] = [];
    const embeddedTypes = new Map<string, string>();
    const failedTypes: string[] = [];
    
    for (const file of files) {
      const schemaName = file.replace(/\.ts$/, '');
      // Use absolute path for schema file (required for ts-morph imports)
      const schemaPath = require('node:path').resolve(outputDir, file);
      
      try {
        const result = typesGen.extract(schemaPath, schemaName);
        if (result) {
          // Extract just the interface code for embedding (strip header comment)
          // No longer write .d.ts files - types are embedded directly in .ts files
          const interfaceMatch = result.content.match(/export interface \w+Data \{[\s\S]*?\n\}/);
          if (interfaceMatch) {
            embeddedTypes.set(schemaName, interfaceMatch[0]);
            extractedTypes.push(schemaName);
            onProgress?.(`  ${schemaName} (type extracted)`, true);
          }
        }
      } catch (typeError) {
        failedTypes.push(schemaName);
        const errMsg = typeError instanceof Error ? typeError.message : String(typeError);
        onProgress?.(`  ${schemaName}`, false, errMsg.slice(0, 50));
      }
    }
    
    // Summary
    if (extractedTypes.length > 0 || failedTypes.length > 0) {
      const summary = failedTypes.length > 0 
        ? `types: ${extractedTypes.length} ok, ${failedTypes.length} skipped`
        : `types: ${extractedTypes.length} extracted`;
      onProgress?.(summary, failedTypes.length === 0);
    }
    
    return { extractedTypes, embeddedTypes };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    onProgress?.('types', false, errorMsg);
    return emptyResult;
  }
}
