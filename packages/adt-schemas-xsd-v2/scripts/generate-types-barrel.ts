#!/usr/bin/env npx tsx
/**
 * Generate a single barrel TypeScript file with all ADT types
 * 
 * This generates ONE file with all types deduplicated, avoiding:
 * - Duplicate type definitions across files
 * - Complex cross-file import resolution
 * - TypeScript inference limits
 * 
 * Usage:
 *   npx tsx scripts/generate-types-barrel.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseXsd, generateInterfaces } from '@abapify/ts-xsd-core';

// Schema sources - process in dependency order
const SCHEMAS_IN_ORDER = [
  // Base schemas first
  { name: 'atom', dir: '.xsd/sap' },
  { name: 'adtcore', dir: '.xsd/sap' },
  { name: 'abapsource', dir: '.xsd/sap' },
  { name: 'abapoo', dir: '.xsd/sap' },
  
  // Object types
  { name: 'classes', dir: '.xsd/sap' },
  { name: 'interfaces', dir: '.xsd/sap' },
  { name: 'packagesV1', dir: '.xsd/sap' },
  
  // ATC
  { name: 'atc', dir: '.xsd/sap' },
  { name: 'atcfinding', dir: '.xsd/sap' },
  { name: 'atcresult', dir: '.xsd/sap' },
  { name: 'atcworklist', dir: '.xsd/sap' },
  
  // Transport
  { name: 'transportmanagment', dir: '.xsd/sap' },
  { name: 'transportsearch', dir: '.xsd/sap' },
  
  // Configuration
  { name: 'configuration', dir: '.xsd/sap' },
  { name: 'configurations', dir: '.xsd/sap' },
  
  // Checks
  { name: 'checkrun', dir: '.xsd/sap' },
  { name: 'checklist', dir: '.xsd/sap' },
  
  // Debugging
  { name: 'debugger', dir: '.xsd/sap' },
  { name: 'logpoint', dir: '.xsd/sap' },
  { name: 'traces', dir: '.xsd/sap' },
  
  // Other
  { name: 'quickfixes', dir: '.xsd/sap' },
  { name: 'log', dir: '.xsd/sap' },
  { name: 'templatelink', dir: '.xsd/sap' },
  
  // Custom schemas
  { name: 'atomExtended', dir: '.xsd/custom' },
  { name: 'templatelinkExtended', dir: '.xsd/custom' },
  { name: 'discovery', dir: '.xsd/custom' },
  { name: 'transportfind', dir: '.xsd/custom' },
  { name: 'transportmanagment-create', dir: '.xsd/custom' },
  { name: 'transportmanagment-single', dir: '.xsd/custom' },
];

// Track generated types to avoid duplicates
const generatedTypes = new Set<string>();

// Cache parsed schemas
const schemaCache = new Map<string, any>();

function loadSchema(dir: string, name: string): any {
  const cacheKey = `${dir}/${name}`;
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey);
  }
  
  const xsdPath = join(dir, `${name}.xsd`);
  if (!existsSync(xsdPath)) {
    return null;
  }
  
  const xsdContent = readFileSync(xsdPath, 'utf-8');
  const schema = parseXsd(xsdContent);
  schemaCache.set(cacheKey, schema);
  return schema;
}

function resolveImports(schema: any, dir: string): any[] {
  const imports: any[] = [];
  
  // Handle xsd:import
  if (schema.import && Array.isArray(schema.import)) {
    for (const imp of schema.import) {
      if (imp.schemaLocation) {
        const importName = imp.schemaLocation.replace(/\.xsd$/, '').replace(/^\.\.\/sap\//, '').replace(/^\.\.\/custom\//, '');
        // Try same dir first, then other dirs
        let importedSchema = loadSchema(dir, importName);
        if (!importedSchema) {
          importedSchema = loadSchema('.xsd/sap', importName);
        }
        if (!importedSchema) {
          importedSchema = loadSchema('.xsd/custom', importName);
        }
        if (importedSchema) {
          imports.push(importedSchema);
        }
      }
    }
  }
  
  // Handle xsd:include (same namespace inclusion)
  if (schema.include && Array.isArray(schema.include)) {
    for (const inc of schema.include) {
      if (inc.schemaLocation) {
        const includeName = inc.schemaLocation.replace(/\.xsd$/, '').replace(/^\.\.\/sap\//, '').replace(/^\.\.\/custom\//, '');
        // Try same dir first, then other dirs
        let includedSchema = loadSchema(dir, includeName);
        if (!includedSchema) {
          includedSchema = loadSchema('.xsd/sap', includeName);
        }
        if (!includedSchema) {
          includedSchema = loadSchema('.xsd/custom', includeName);
        }
        if (includedSchema) {
          imports.push(includedSchema);
        }
      }
    }
  }
  
  return imports;
}

function extractTypeNames(interfaces: string): string[] {
  const typePattern = /export (?:interface|type) (\w+)/g;
  const names: string[] = [];
  let match;
  while ((match = typePattern.exec(interfaces)) !== null) {
    names.push(match[1]);
  }
  return names;
}

function filterNewTypes(interfaces: string): string {
  const lines = interfaces.split('\n');
  const result: string[] = [];
  let skipUntilNextExport = false;
  let braceCount = 0;
  
  for (const line of lines) {
    // Check if this is a type/interface declaration
    const typeMatch = line.match(/^export (?:interface|type) (\w+)/);
    
    if (typeMatch) {
      const typeName = typeMatch[1];
      if (generatedTypes.has(typeName)) {
        // Skip this type - already generated
        skipUntilNextExport = true;
        braceCount = 0;
        continue;
      }
      // New type - add it
      generatedTypes.add(typeName);
      skipUntilNextExport = false;
    }
    
    if (skipUntilNextExport) {
      // Track braces to know when the type definition ends
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      if (braceCount <= 0 && line.includes('}')) {
        skipUntilNextExport = false;
      }
      continue;
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

function main() {
  console.log('🔧 Generating single barrel TypeScript file with all ADT types...\n');
  
  const allInterfaces: string[] = [
    '/**',
    ' * Auto-generated TypeScript interfaces for all ADT schemas',
    ' * ',
    ' * DO NOT EDIT - Generated by generate-types-barrel.ts',
    ' * ',
    ' * This single file contains all ADT types deduplicated.',
    ' * Use these types instead of InferSchema<> to avoid TypeScript recursion limits.',
    ' */',
    '',
  ];
  
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const { name, dir } of SCHEMAS_IN_ORDER) {
    const xsdPath = join(dir, `${name}.xsd`);
    
    if (!existsSync(xsdPath)) {
      console.log(`⚠️  Skipping ${name} - XSD not found`);
      skippedCount++;
      continue;
    }
    
    try {
      const schema = loadSchema(dir, name);
      if (!schema) {
        throw new Error('Failed to parse schema');
      }
      
      // Resolve imports
      const importedSchemas = resolveImports(schema, dir);
      if (importedSchemas.length > 0) {
        (schema as any).$imports = importedSchemas;
      }
      
      // Generate interfaces
      const interfaces = generateInterfaces(schema, {
        generateAllTypes: true,
        addJsDoc: true,
      });
      
      // Filter out already-generated types
      const newInterfaces = filterNewTypes(interfaces);
      
      if (newInterfaces.trim()) {
        allInterfaces.push(`// ============================================================================`);
        allInterfaces.push(`// ${name.toUpperCase()}`);
        allInterfaces.push(`// ============================================================================`);
        allInterfaces.push('');
        allInterfaces.push(newInterfaces);
        allInterfaces.push('');
      }
      
      console.log(`✅ Processed ${name} (${generatedTypes.size} total types)`);
      processedCount++;
    } catch (error) {
      console.error(`❌ Failed ${name}:`, error instanceof Error ? error.message : error);
    }
  }
  
  // Write single barrel file
  const outputDir = 'src/schemas/generated/types';
  mkdirSync(outputDir, { recursive: true });
  
  const outputPath = join(outputDir, 'index.ts');
  writeFileSync(outputPath, allInterfaces.join('\n'));
  
  console.log(`\n✅ Generated ${outputPath}`);
  console.log(`📊 Summary: ${processedCount} schemas processed, ${skippedCount} skipped`);
  console.log(`📊 Total unique types: ${generatedTypes.size}`);
}

main();
