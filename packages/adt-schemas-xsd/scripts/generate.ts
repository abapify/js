#!/usr/bin/env tsx
/**
 * Generate TypeScript schemas from ADT XSD files
 * 
 * Reads schemas.config.ts and generates TypeScript for each schema.
 * Dependencies are automatically resolved via xsd:import.
 * 
 * Usage: npx nx generate adt-schemas-xsd
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { generateFromXsd } from 'ts-xsd/codegen';
import { schemas, resolveImport } from '../schemas.config';

const XSD_DIR = join(import.meta.dirname, '..', '.xsd');
const OUTPUT_DIR = join(import.meta.dirname, '..', 'src', 'schemas');

/**
 * Get all available XSD files from .xsd directory
 */
function getAllXsdFiles(): Map<string, string> {
  const files = new Map<string, string>();
  
  // Flat structure: .xsd/model/*.xsd
  const modelDir = join(XSD_DIR, 'model');
  if (existsSync(modelDir)) {
    for (const file of readdirSync(modelDir)) {
      if (file.endsWith('.xsd')) {
        files.set(basename(file, '.xsd'), join(modelDir, file));
      }
    }
  }
  
  return files;
}

/**
 * Collect all dependencies for a schema (recursive)
 */
function collectDependencies(
  schemaName: string,
  xsdFiles: Map<string, string>,
  collected: Set<string> = new Set()
): Set<string> {
  if (collected.has(schemaName)) return collected;
  
  const xsdPath = xsdFiles.get(schemaName);
  if (!xsdPath) return collected;
  
  collected.add(schemaName);
  
  // Parse XSD to find imports
  const content = readFileSync(xsdPath, 'utf-8');
  const importMatches = content.matchAll(/schemaLocation="([^"]+)"/g);
  
  for (const match of importMatches) {
    const location = match[1];
    // Extract schema name from location
    const depMatch = location.match(/\/model\/([^/]+)\.xsd$/) || location.match(/^([^/]+)\.xsd$/);
    if (depMatch) {
      collectDependencies(depMatch[1], xsdFiles, collected);
    }
  }
  
  return collected;
}

/**
 * Generate TypeScript from XSD
 */
function generateSchema(xsdPath: string): string {
  const xsdContent = readFileSync(xsdPath, 'utf-8');
  const result = generateFromXsd(xsdContent, { resolver: resolveImport });
  return result.code;
}

async function main() {
  console.log('🔍 Scanning for XSD files...');
  const xsdFiles = getAllXsdFiles();
  
  if (xsdFiles.size === 0) {
    console.error('No XSD files found. Run "npx nx download adt-schemas-xsd" first.');
    process.exit(1);
  }
  
  console.log(`Found ${xsdFiles.size} XSD files`);
  console.log(`Configured schemas: ${schemas.length}`);
  
  // Collect all schemas + their dependencies
  const allSchemas = new Set<string>();
  for (const schema of schemas) {
    collectDependencies(schema, xsdFiles, allSchemas);
  }
  
  console.log(`Total with dependencies: ${allSchemas.size}`);
  
  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Generate schemas (dependencies first)
  const generated: string[] = [];
  const failed: string[] = [];
  
  for (const schemaName of allSchemas) {
    const xsdPath = xsdFiles.get(schemaName);
    if (!xsdPath) {
      // Create stub for external schemas (like Ecore)
      console.log(`📄 Creating stub for ${schemaName}...`);
      const stub = `/**
 * Stub schema for ${schemaName}
 * This schema is referenced but not available in ADT SDK.
 */
import type { XsdSchema } from 'ts-xsd';

export default {
  elements: {},
} as const satisfies XsdSchema;
`;
      writeFileSync(join(OUTPUT_DIR, `${schemaName}.ts`), stub, 'utf-8');
      generated.push(schemaName);
      continue;
    }
    
    try {
      console.log(`📝 Generating ${schemaName}...`);
      const code = generateSchema(xsdPath);
      writeFileSync(join(OUTPUT_DIR, `${schemaName}.ts`), code, 'utf-8');
      generated.push(schemaName);
    } catch (error) {
      console.error(`❌ Failed: ${schemaName}`, error instanceof Error ? error.message : error);
      failed.push(schemaName);
    }
  }
  
  // Generate index.ts
  const indexLines = [
    '/**',
    ' * ADT XML Schemas - Auto-generated from SAP XSD definitions',
    ' */',
    '',
    ...generated.map(name => `export { default as ${name} } from './schemas/${name}';`),
    '',
    "export { parse, build, type InferXsd, type XsdSchema } from 'ts-xsd';",
    '',
  ];
  
  writeFileSync(join(OUTPUT_DIR, '..', 'index.ts'), indexLines.join('\n'), 'utf-8');
  
  console.log('');
  console.log('✅ Generation complete!');
  console.log(`   Generated: ${generated.length} schemas`);
  if (failed.length > 0) {
    console.log(`   Failed: ${failed.length} (${failed.join(', ')})`);
  }
}

main().catch(console.error);
