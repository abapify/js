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
import { generateFromXsd, generateIndex, factoryGenerator, type ImportedSchema } from 'ts-xsd/codegen';
import { schemas, resolveImport } from '../schemas.config';
import { DOMParser } from '@xmldom/xmldom';

// Factory path relative to generated/ directory
const FACTORY_PATH = '../../speci';

const XSD_DIR = join(import.meta.dirname, '..', '.xsd');
const SCHEMAS_DIR = join(import.meta.dirname, '..', 'src', 'schemas');
const GENERATED_DIR = join(SCHEMAS_DIR, 'generated');

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
 * Extract element→type mappings from an XSD file
 * This is used to resolve element references like ref="atom:link" to their actual types
 */
function extractElementTypes(xsdPath: string): ImportedSchema | null {
  const content = readFileSync(xsdPath, 'utf-8');
  const doc = new DOMParser().parseFromString(content, 'text/xml');
  const schemaEl = doc.documentElement;
  
  if (!schemaEl || !schemaEl.tagName.endsWith('schema')) {
    return null;
  }
  
  const namespace = schemaEl.getAttribute('targetNamespace') || '';
  const elements = new Map<string, string>();
  
  // Find all xsd:element declarations with name and type
  const children = schemaEl.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as unknown as Element;
    if (child.nodeType !== 1) continue;
    
    const localName = (child as any).localName || child.tagName?.split(':').pop();
    if (localName === 'element') {
      const name = child.getAttribute('name');
      const type = child.getAttribute('type');
      if (name && type) {
        // Strip namespace prefix from type
        const typeName = type.includes(':') ? type.split(':').pop()! : type;
        elements.set(name, typeName);
      }
    }
  }
  
  if (elements.size === 0) {
    return null;
  }
  
  return { namespace, elements };
}

/**
 * Generate TypeScript from XSD using factory generator
 */
function generateSchema(xsdPath: string, importedSchemas: ImportedSchema[]): string {
  const xsdContent = readFileSync(xsdPath, 'utf-8');
  const result = generateFromXsd(
    xsdContent, 
    { resolver: resolveImport, importedSchemas },
    factoryGenerator,
    { factory: FACTORY_PATH }
  );
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
  mkdirSync(GENERATED_DIR, { recursive: true });
  
  // Pre-extract element→type mappings from all XSD files
  // This allows proper resolution of element references like ref="atom:link"
  const importedSchemas: ImportedSchema[] = [];
  for (const [, xsdPath] of xsdFiles) {
    const schema = extractElementTypes(xsdPath);
    if (schema) {
      importedSchemas.push(schema);
    }
  }
  console.log(`Extracted element mappings from ${importedSchemas.length} schemas`);
  
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
import schema from '${FACTORY_PATH}';

export default schema({
  elements: {},
});
`;
      writeFileSync(join(GENERATED_DIR, `${schemaName}.ts`), stub, 'utf-8');
      generated.push(schemaName);
      continue;
    }
    
    try {
      console.log(`📝 Generating ${schemaName}...`);
      const code = generateSchema(xsdPath, importedSchemas);
      writeFileSync(join(GENERATED_DIR, `${schemaName}.ts`), code, 'utf-8');
      generated.push(schemaName);
    } catch (error) {
      console.error(`❌ Failed: ${schemaName}`, error instanceof Error ? error.message : error);
      failed.push(schemaName);
    }
  }
  
  // Generate schemas/index.ts (exports from ./generated/)
  const indexCode = generateIndex(generated, factoryGenerator, {}) || [
    '/**',
    ' * Auto-generated index file',
    ' * Generated by ts-xsd',
    ' */',
    '',
    ...generated.map(name => `export { default as ${name} } from './${name}';`),
    '',
  ].join('\n');
  
  // Adjust paths for schemas/index.ts (needs ./generated/ prefix)
  const adjustedIndexCode = indexCode.replace(
    /from '\.\/([^']+)'/g, 
    "from './generated/$1'"
  );
  
  writeFileSync(join(SCHEMAS_DIR, 'index.ts'), adjustedIndexCode, 'utf-8');
  
  console.log('');
  console.log('✅ Generation complete!');
  console.log(`   Generated: ${generated.length} schemas`);
  if (failed.length > 0) {
    console.log(`   Failed: ${failed.length} (${failed.join(', ')})`);
  }
}

main().catch(console.error);
