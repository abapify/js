#!/usr/bin/env npx tsx
/**
 * Generate TypeScript interfaces from XSD schemas
 * 
 * This generates explicit TypeScript interfaces instead of relying on InferSchema,
 * which hits TypeScript recursion limits with complex nested schemas.
 * 
 * Benefits:
 * - No TypeScript inference limits
 * - Shared types (adtcore, atom) are generated once and imported
 * - Better IDE support and faster type checking
 * 
 * Usage:
 *   npx tsx scripts/generate-types.ts
 *   npx nx run adt-schemas-xsd-v2:generate-types
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseXsd, generateInterfaces } from '@abapify/ts-xsd-core';

// Schema sources - same as codegen.ts
const SOURCES = {
  sap: {
    xsdDir: '.xsd/sap',
    outputDir: 'src/schemas/types/sap',
    schemas: [
      // Base schemas (generated first, others import from these)
      'atom',
      'adtcore',
      'abapsource',
      'abapoo',
      
      // Object types
      'classes',
      'interfaces',
      'packagesV1',
      
      // ATC
      'atc',
      'atcresult',
      'atcworklist',
      
      // Transport
      'transportmanagment',
      'transportsearch',
      
      // Configuration
      'configuration',
      'configurations',
      
      // Checks
      'checkrun',
      'checklist',
      
      // Debugging
      'debugger',
      'logpoint',
      'traces',
      
      // Other
      'quickfixes',
      'log',
      'templatelink',
    ],
  },
  custom: {
    xsdDir: '.xsd/custom',
    outputDir: 'src/schemas/types/custom',
    schemas: [
      'atomExtended',
      'discovery',
      'http',
      'transportfind',
      'transportmanagment-create',
      'transportmanagment-single',
    ],
  },
};

// Map namespace URIs to schema names for import resolution
const NAMESPACE_TO_SCHEMA: Record<string, string> = {
  'http://www.w3.org/2005/Atom': 'atom',
  'http://www.sap.com/adt/core': 'adtcore',
  'http://www.sap.com/adt/abapsource': 'abapsource',
  'http://www.sap.com/adt/oo': 'abapoo',
  'http://www.sap.com/adt/oo/classes': 'classes',
  'http://www.sap.com/adt/oo/interfaces': 'interfaces',
  'http://www.sap.com/adt/http': 'http',
};

// Track which schemas have been generated (for import resolution)
const generatedSchemas = new Set<string>();

// Cache parsed schemas for $imports resolution
const schemaCache = new Map<string, any>();

function loadSchema(xsdDir: string, schemaName: string): any {
  const cacheKey = `${xsdDir}/${schemaName}`;
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey);
  }
  
  const xsdPath = join(xsdDir, `${schemaName}.xsd`);
  if (!existsSync(xsdPath)) {
    return null;
  }
  
  const xsdContent = readFileSync(xsdPath, 'utf-8');
  const schema = parseXsd(xsdContent);
  schemaCache.set(cacheKey, schema);
  return schema;
}

function resolveImports(schema: any, xsdDir: string): any[] {
  const imports: any[] = [];
  
  // Check for xs:import elements
  if (schema.import && Array.isArray(schema.import)) {
    for (const imp of schema.import) {
      if (imp.schemaLocation) {
        const importName = imp.schemaLocation.replace(/\.xsd$/, '');
        const importedSchema = loadSchema(xsdDir, importName);
        if (importedSchema) {
          imports.push(importedSchema);
        }
      }
    }
  }
  
  return imports;
}

function getImportsForSchema(schemaName: string, xsdDir: string): string[] {
  const schema = loadSchema(xsdDir, schemaName);
  if (!schema) return [];
  
  const imports: string[] = [];
  
  // Check xs:import elements
  if (schema.import && Array.isArray(schema.import)) {
    for (const imp of schema.import) {
      if (imp.schemaLocation) {
        const importName = imp.schemaLocation.replace(/\.xsd$/, '');
        if (generatedSchemas.has(importName)) {
          imports.push(importName);
        }
      }
    }
  }
  
  return imports;
}

interface GenerateTypesOptions {
  sourceName: string;
  xsdDir: string;
  outputDir: string;
  schemas: string[];
}

function generateTypes(options: GenerateTypesOptions): { generated: string[]; failed: string[] } {
  const { sourceName, xsdDir, outputDir, schemas } = options;
  mkdirSync(outputDir, { recursive: true });
  
  const generated: string[] = [];
  const failed: string[] = [];

  for (const schemaName of schemas) {
    const xsdPath = join(xsdDir, `${schemaName}.xsd`);
    
    if (!existsSync(xsdPath)) {
      console.log(`⚠️  [${sourceName}] Skipping ${schemaName} - XSD not found`);
      continue;
    }

    try {
      // Load and parse schema
      const schema = loadSchema(xsdDir, schemaName);
      if (!schema) {
        throw new Error('Failed to parse schema');
      }
      
      // Resolve imports for $imports
      const importedSchemas = resolveImports(schema, xsdDir);
      if (importedSchemas.length > 0) {
        (schema as any).$imports = importedSchemas;
      }
      
      // Generate interfaces
      const interfaces = generateInterfaces(schema, {
        generateAllTypes: true,
        addJsDoc: true,
      });
      
      // Build import statements for dependent schemas
      const schemaImports = getImportsForSchema(schemaName, xsdDir);
      const importStatements = schemaImports.map(imp => {
        // Determine relative path
        const isSameSource = SOURCES.sap.schemas.includes(imp) === SOURCES.sap.schemas.includes(schemaName);
        const relativePath = isSameSource ? `./${imp}.types` : `../sap/${imp}.types`;
        return `import type * as ${toPascalCase(imp)} from '${relativePath}';`;
      });
      
      // Build output content
      const lines = [
        '/**',
        ` * Auto-generated TypeScript interfaces from XSD`,
        ' * ',
        ' * DO NOT EDIT - Generated by generate-types.ts',
        ` * Source: ${sourceName}/${basename(xsdPath)}`,
        ' */',
        '',
        ...importStatements,
        importStatements.length > 0 ? '' : '',
        interfaces,
      ];
      
      const outputPath = join(outputDir, `${schemaName}.types.ts`);
      writeFileSync(outputPath, lines.join('\n'));
      console.log(`✅ [${sourceName}] Generated ${schemaName}.types.ts`);
      generated.push(schemaName);
      generatedSchemas.add(schemaName);
    } catch (error) {
      console.error(`❌ [${sourceName}] Failed ${schemaName}:`, error instanceof Error ? error.message : error);
      failed.push(schemaName);
    }
  }

  // Generate index.ts
  const indexLines = [
    '/**',
    ` * Auto-generated type index for ${sourceName} schemas`,
    ' * ',
    ' * DO NOT EDIT - Generated by generate-types.ts',
    ' */',
    '',
    ...generated.map(name => `export * from './${name}.types';`),
    '',
  ];
  writeFileSync(join(outputDir, 'index.ts'), indexLines.join('\n'));
  console.log(`✅ [${sourceName}] Generated types/index.ts`);

  return { generated, failed };
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function main() {
  console.log('🔧 Generating TypeScript interfaces from XSD schemas...\n');
  
  let totalGenerated = 0;
  let totalFailed = 0;

  // Generate SAP types first (base schemas)
  console.log('📦 Generating SAP types...');
  const sapResult = generateTypes({
    sourceName: 'sap',
    xsdDir: SOURCES.sap.xsdDir,
    outputDir: SOURCES.sap.outputDir,
    schemas: SOURCES.sap.schemas,
  });
  totalGenerated += sapResult.generated.length;
  totalFailed += sapResult.failed.length;

  // Generate custom types
  console.log('\n📦 Generating custom types...');
  const customResult = generateTypes({
    sourceName: 'custom',
    xsdDir: SOURCES.custom.xsdDir,
    outputDir: SOURCES.custom.outputDir,
    schemas: SOURCES.custom.schemas,
  });
  totalGenerated += customResult.generated.length;
  totalFailed += customResult.failed.length;

  // Generate root index.ts
  const rootIndexLines = [
    '/**',
    ' * Auto-generated type index for all schemas',
    ' * ',
    ' * DO NOT EDIT - Generated by generate-types.ts',
    ' */',
    '',
    '// SAP schema types',
    `export * from './sap';`,
    '',
    '// Custom schema types',
    `export * from './custom';`,
    '',
  ];
  mkdirSync('src/schemas/types', { recursive: true });
  writeFileSync('src/schemas/types/index.ts', rootIndexLines.join('\n'));
  console.log(`\n✅ Generated types/index.ts`);

  console.log(`\n📊 Summary: ${totalGenerated} type files generated, ${totalFailed} failed`);
  
  if (totalFailed > 0) {
    process.exit(1);
  }
}

main();
