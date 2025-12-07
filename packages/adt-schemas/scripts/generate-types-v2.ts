#!/usr/bin/env npx tsx
/**
 * Generate TypeScript interfaces from XSD schemas - V2 (Per-Schema Types)
 * 
 * This generates per-schema type files with proper imports instead of a single barrel.
 * 
 * Benefits:
 * - Tree-shakeable: Import only the types you need
 * - No type duplication: Base types (AdtObject, LinkType) defined once
 * - Proper imports: Cross-schema references use import statements
 * - Bundler-friendly: Let the bundler handle merging, not the generator
 * 
 * Output structure:
 *   types/
 *     sap/
 *       atom.types.ts      - Atom types
 *       adtcore.types.ts   - AdtObject, LinkType, etc.
 *       classes.types.ts   - AbapClass (imports from adtcore, abapoo)
 *     custom/
 *       ...
 *     index.ts             - Re-exports all types
 * 
 * Usage:
 *   npx tsx scripts/generate-types-v2.ts
 *   npx nx run adt-schemas:generate-types-v2
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseXsd, generateInterfacesWithDeps } from 'ts-xsd';

// =============================================================================
// Configuration
// =============================================================================

// Namespace URI to schema name mapping
const NAMESPACE_TO_SCHEMA: Record<string, string> = {
  'http://www.w3.org/2005/Atom': 'atom',
  'http://www.sap.com/adt/core': 'adtcore',
  'http://www.sap.com/adt/abapsource': 'abapsource',
  'http://www.sap.com/adt/oo': 'abapoo',
  'http://www.sap.com/adt/oo/classes': 'classes',
  'http://www.sap.com/adt/oo/interfaces': 'interfaces',
  'http://www.sap.com/adt/packages': 'packagesV1',
  'http://www.sap.com/adt/atc': 'atc',
  'http://www.sap.com/adt/atc/finding': 'atcfinding',
  'http://www.sap.com/adt/atc/result': 'atcresult',
  'http://www.sap.com/adt/atc/worklist': 'atcworklist',
  'http://www.sap.com/adt/transportmanagement': 'transportmanagment',
  'http://www.sap.com/adt/transportsearch': 'transportsearch',
  'http://www.sap.com/adt/configuration': 'configuration',
  'http://www.sap.com/adt/configurations': 'configurations',
  'http://www.sap.com/adt/checkrun': 'checkrun',
  'http://www.sap.com/adt/checklist': 'checklist',
  'http://www.sap.com/adt/debugger': 'debugger',
  'http://www.sap.com/adt/logpoint': 'logpoint',
  'http://www.sap.com/adt/traces': 'traces',
  'http://www.sap.com/adt/quickfixes': 'quickfixes',
  'http://www.sap.com/adt/log': 'log',
  'http://www.sap.com/adt/compat/templatelink': 'templatelink',
  'http://www.sap.com/adt/http': 'http',
  'http://www.sap.com/abapxml': 'transportfind',
};

// Schema sources - process in dependency order (base schemas first)
const SCHEMAS_IN_ORDER: Array<{ name: string; dir: string; source: 'sap' | 'custom' }> = [
  // Base schemas first
  { name: 'atom', dir: '.xsd/sap', source: 'sap' },
  { name: 'adtcore', dir: '.xsd/sap', source: 'sap' },
  { name: 'abapsource', dir: '.xsd/sap', source: 'sap' },
  { name: 'abapoo', dir: '.xsd/sap', source: 'sap' },
  
  // Object types
  { name: 'classes', dir: '.xsd/sap', source: 'sap' },
  { name: 'interfaces', dir: '.xsd/sap', source: 'sap' },
  { name: 'packagesV1', dir: '.xsd/sap', source: 'sap' },
  
  // ATC
  { name: 'atc', dir: '.xsd/sap', source: 'sap' },
  { name: 'atcfinding', dir: '.xsd/sap', source: 'sap' },
  { name: 'atcresult', dir: '.xsd/sap', source: 'sap' },
  { name: 'atcworklist', dir: '.xsd/sap', source: 'sap' },
  
  // Transport
  { name: 'transportmanagment', dir: '.xsd/sap', source: 'sap' },
  { name: 'transportsearch', dir: '.xsd/sap', source: 'sap' },
  
  // Configuration
  { name: 'configuration', dir: '.xsd/sap', source: 'sap' },
  { name: 'configurations', dir: '.xsd/sap', source: 'sap' },
  
  // Checks
  { name: 'checkrun', dir: '.xsd/sap', source: 'sap' },
  { name: 'checklist', dir: '.xsd/sap', source: 'sap' },
  
  // Debugging
  { name: 'debugger', dir: '.xsd/sap', source: 'sap' },
  { name: 'logpoint', dir: '.xsd/sap', source: 'sap' },
  { name: 'traces', dir: '.xsd/sap', source: 'sap' },
  
  // Other
  { name: 'quickfixes', dir: '.xsd/sap', source: 'sap' },
  { name: 'log', dir: '.xsd/sap', source: 'sap' },
  { name: 'templatelink', dir: '.xsd/sap', source: 'sap' },
  
  // Custom schemas
  { name: 'atomExtended', dir: '.xsd/custom', source: 'custom' },
  { name: 'templatelinkExtended', dir: '.xsd/custom', source: 'custom' },
  { name: 'discovery', dir: '.xsd/custom', source: 'custom' },
  { name: 'http', dir: '.xsd/custom', source: 'custom' },
  { name: 'transportfind', dir: '.xsd/custom', source: 'custom' },
  { name: 'transportmanagment-create', dir: '.xsd/custom', source: 'custom' },
  { name: 'transportmanagment-single', dir: '.xsd/custom', source: 'custom' },
];

// =============================================================================
// Schema Cache and Helpers
// =============================================================================

const schemaCache = new Map<string, any>();

// Track which types are exported by which schema (for import resolution)
// This is populated as schemas are generated, so order matters!
const typeToSchema = new Map<string, string>(); // typeName -> schemaName

// Track which schema file each type should be imported from
// This accounts for xsd:include relationships
const typeToImportSource = new Map<string, string>(); // typeName -> schemaName

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

function resolveImports(schema: any, dir: string, visited: Set<any> = new Set()): any[] {
  const imports: any[] = [];
  
  if (visited.has(schema)) {
    return imports;
  }
  visited.add(schema);
  
  // Handle xsd:import
  if (schema.import && Array.isArray(schema.import)) {
    for (const imp of schema.import) {
      if (imp.schemaLocation) {
        const importName = imp.schemaLocation.replace(/\.xsd$/, '').replace(/^\.\.\/sap\//, '').replace(/^\.\.\/custom\//, '');
        let importedSchema = loadSchema(dir, importName);
        if (!importedSchema) {
          importedSchema = loadSchema('.xsd/sap', importName);
        }
        if (!importedSchema) {
          importedSchema = loadSchema('.xsd/custom', importName);
        }
        if (importedSchema) {
          imports.push(importedSchema);
          const nestedImports = resolveImports(importedSchema, dir, visited);
          importedSchema.$imports = nestedImports;
          imports.push(...nestedImports);
        }
      }
    }
  }
  
  // Handle xsd:include
  if (schema.include && Array.isArray(schema.include)) {
    for (const inc of schema.include) {
      if (inc.schemaLocation) {
        const includeName = inc.schemaLocation.replace(/\.xsd$/, '').replace(/^\.\.\/sap\//, '').replace(/^\.\.\/custom\//, '');
        let includedSchema = loadSchema(dir, includeName);
        if (!includedSchema) {
          includedSchema = loadSchema('.xsd/sap', includeName);
        }
        if (!includedSchema) {
          includedSchema = loadSchema('.xsd/custom', includeName);
        }
        if (includedSchema) {
          imports.push(includedSchema);
          const nestedImports = resolveImports(includedSchema, dir, visited);
          includedSchema.$imports = nestedImports;
          imports.push(...nestedImports);
        }
      }
    }
  }
  
  return imports;
}

function getSchemaNameFromNamespace(namespace: string): string | undefined {
  return NAMESPACE_TO_SCHEMA[namespace];
}

/**
 * Reverse the order of interfaces/types in generated code
 * so that main types appear first and subtypes appear after
 */
function reverseInterfaceOrder(code: string): string {
  // Split code into blocks - each block is a JSDoc comment + interface/type
  // We need to keep JSDoc with its following interface
  const blocks: string[] = [];
  let currentBlock = '';
  let inJsDoc = false;
  
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Start of a new JSDoc comment
    if (line.startsWith('/**')) {
      // If we have a previous block, save it
      if (currentBlock.trim()) {
        blocks.push(currentBlock.trim());
        currentBlock = '';
      }
      inJsDoc = true;
    }
    
    // Start of interface/type without preceding JSDoc
    if ((line.startsWith('export interface') || line.startsWith('export type')) && !inJsDoc) {
      if (currentBlock.trim()) {
        blocks.push(currentBlock.trim());
        currentBlock = '';
      }
    }
    
    currentBlock += line + '\n';
    
    // End of JSDoc
    if (inJsDoc && line.includes('*/')) {
      inJsDoc = false;
    }
  }
  
  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }
  
  // Reverse the blocks and join
  return blocks.reverse().join('\n\n');
}

function getRelativePath(fromSource: 'sap' | 'custom', toSchema: string): string {
  // Find the target schema's source
  const targetEntry = SCHEMAS_IN_ORDER.find(s => s.name === toSchema);
  const targetSource = targetEntry?.source ?? 'sap';
  
  if (fromSource === targetSource) {
    return `./${toSchema}.types`;
  } else if (fromSource === 'custom' && targetSource === 'sap') {
    return `../sap/${toSchema}.types`;
  } else {
    return `../custom/${toSchema}.types`;
  }
}

// =============================================================================
// Main Generation
// =============================================================================

interface GeneratedSchema {
  name: string;
  source: 'sap' | 'custom';
  localTypes: string[];
  externalTypes: Map<string, string[]>;
}

function main() {
  console.log('🔧 Generating per-schema TypeScript type files...\n');
  
  const outputBase = 'src/schemas/generated/types';
  const sapDir = join(outputBase, 'sap');
  const customDir = join(outputBase, 'custom');
  
  // Clean and create directories
  if (existsSync(outputBase)) {
    rmSync(outputBase, { recursive: true });
  }
  mkdirSync(sapDir, { recursive: true });
  mkdirSync(customDir, { recursive: true });
  
  const generatedSchemas: GeneratedSchema[] = [];
  let totalTypes = 0;
  
  for (const { name, dir, source } of SCHEMAS_IN_ORDER) {
    const xsdPath = join(dir, `${name}.xsd`);
    
    if (!existsSync(xsdPath)) {
      console.log(`⚠️  Skipping ${name} - XSD not found`);
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
      
      // Generate interfaces with dependency tracking
      const result = generateInterfacesWithDeps(schema, {
        generateAllTypes: true,
        addJsDoc: true,
      });
      
      // Find ALL root element types for this schema
      const rootTypes: { elementName: string; typeName: string }[] = [];
      if (schema.element && Array.isArray(schema.element)) {
        for (const el of schema.element) {
          if (el.name && el.type) {
            // Strip namespace prefix from type
            let typeName = el.type.includes(':') 
              ? el.type.split(':')[1] 
              : el.type;
            // Convert to PascalCase interface name
            typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
            rootTypes.push({ elementName: el.name, typeName });
          }
        }
      }
      
      // Track which types this schema exports
      for (const typeName of result.localTypes) {
        typeToSchema.set(typeName, name);
        typeToImportSource.set(typeName, name);
      }
      
      // For schemas with xsd:include, also register included types as importable from this schema
      if (schema.include && Array.isArray(schema.include)) {
        for (const inc of schema.include) {
          if (inc.schemaLocation) {
            const includeName = inc.schemaLocation
              .replace(/\.xsd$/, '')
              .replace(/^\.\.\/sap\//, '')
              .replace(/^\.\.\/custom\//, '');
            // Get types from the included schema and register them as importable from this schema
            const includedEntry = SCHEMAS_IN_ORDER.find(s => s.name === includeName);
            if (includedEntry) {
              const includedSchema = loadSchema(includedEntry.dir, includeName);
              if (includedSchema) {
                // Get types from included schema
                const includedTypes = [
                  ...(includedSchema.complexType?.map((ct: any) => ct.name) ?? []),
                  ...(includedSchema.simpleType?.map((st: any) => st.name) ?? []),
                ];
                for (const typeName of includedTypes) {
                  if (typeName) {
                    // Register this type as importable from the including schema (e.g., atomExtended)
                    typeToImportSource.set(typeName, name);
                  }
                }
              }
            }
          }
        }
      }
      
      generatedSchemas.push({
        name,
        source,
        localTypes: result.localTypes,
        externalTypes: result.externalTypes,
      });
      
      // Build import statements - group types by their import source
      const importStatements: string[] = [];
      const importsBySource = new Map<string, string[]>(); // schemaName -> typeNames[]
      
      for (const [_namespace, types] of result.externalTypes) {
        for (const typeName of types) {
          // Look up the best import source for this type
          const importSource = typeToImportSource.get(typeName);
          if (importSource && importSource !== name) {
            const existing = importsBySource.get(importSource) ?? [];
            if (!existing.includes(typeName)) {
              existing.push(typeName);
              importsBySource.set(importSource, existing);
            }
          }
        }
      }
      
      for (const [importSchemaName, types] of importsBySource) {
        const relativePath = getRelativePath(source, importSchemaName);
        const typeList = types.join(', ');
        importStatements.push(`import type { ${typeList} } from '${relativePath}';`);
      }
      
      // Handle xsd:include - re-export types from included schemas
      const reExportStatements: string[] = [];
      if (schema.include && Array.isArray(schema.include)) {
        for (const inc of schema.include) {
          if (inc.schemaLocation) {
            const includeName = inc.schemaLocation
              .replace(/\.xsd$/, '')
              .replace(/^\.\.\/sap\//, '')
              .replace(/^\.\.\/custom\//, '');
            const includeEntry = SCHEMAS_IN_ORDER.find(s => s.name === includeName);
            if (includeEntry) {
              const relativePath = getRelativePath(source, includeName);
              reExportStatements.push(`export * from '${relativePath}';`);
            }
          }
        }
      }
      
      // Generate SchemaType alias based on root elements
      let schemaTypeAlias = '';
      if (rootTypes.length === 1) {
        // Single root element
        schemaTypeAlias = `/** Main type for this schema (root element: <${rootTypes[0].elementName}>) */\nexport type SchemaType = ${rootTypes[0].typeName};\n`;
      } else if (rootTypes.length > 1) {
        // Multiple root elements - union type
        const typeUnion = rootTypes.map(r => r.typeName).join(' | ');
        const elementList = rootTypes.map(r => `<${r.elementName}>`).join(', ');
        schemaTypeAlias = `/** Main types for this schema (root elements: ${elementList}) */\nexport type SchemaType = ${typeUnion};\n`;
      }
      
      // Reverse the interface order so main types come first
      // The generated code has interfaces in dependency order (subtypes first)
      // We want main types first for readability
      const reversedCode = reverseInterfaceOrder(result.code);
      
      // Build output content
      const lines = [
        '/**',
        ` * Auto-generated TypeScript interfaces from XSD`,
        ' * ',
        ' * DO NOT EDIT - Generated by generate-types-v2.ts',
        ` * Source: ${source}/${basename(xsdPath)}`,
        ' */',
        '',
        ...importStatements,
        importStatements.length > 0 ? '' : '',
        // Re-export included schema types (for xsd:include)
        ...reExportStatements,
        reExportStatements.length > 0 ? '' : '',
        // SchemaType alias at the top
        schemaTypeAlias,
        // Interfaces in reverse order (main types first)
        reversedCode,
      ];
      
      const outputDir = source === 'sap' ? sapDir : customDir;
      const outputPath = join(outputDir, `${name}.types.ts`);
      writeFileSync(outputPath, lines.join('\n'));
      
      totalTypes += result.localTypes.length;
      console.log(`✅ ${name} [${source}] - ${result.localTypes.length} types`);
      
    } catch (error) {
      console.error(`❌ Failed ${name}:`, error instanceof Error ? error.message : error);
    }
  }
  
  // Generate index files
  generateIndexFiles(generatedSchemas, sapDir, customDir, outputBase);
  
  console.log(`\n📊 Summary: ${generatedSchemas.length} schemas, ${totalTypes} types`);
}

function generateIndexFiles(
  schemas: GeneratedSchema[],
  sapDir: string,
  customDir: string,
  outputBase: string
) {
  // SAP index
  const sapSchemas = schemas.filter(s => s.source === 'sap');
  const sapIndexLines = [
    '/**',
    ' * Auto-generated type index for SAP schemas',
    ' * ',
    ' * DO NOT EDIT - Generated by generate-types-v2.ts',
    ' */',
    '',
    ...sapSchemas.map(s => `export * from './${s.name}.types';`),
    '',
  ];
  writeFileSync(join(sapDir, 'index.ts'), sapIndexLines.join('\n'));
  console.log(`✅ Generated sap/index.ts`);
  
  // Custom index
  const customSchemas = schemas.filter(s => s.source === 'custom');
  const customIndexLines = [
    '/**',
    ' * Auto-generated type index for custom schemas',
    ' * ',
    ' * DO NOT EDIT - Generated by generate-types-v2.ts',
    ' */',
    '',
    ...customSchemas.map(s => `export * from './${s.name}.types';`),
    '',
  ];
  writeFileSync(join(customDir, 'index.ts'), customIndexLines.join('\n'));
  console.log(`✅ Generated custom/index.ts`);
  
  // Root index
  const rootIndexLines = [
    '/**',
    ' * Auto-generated type index for all schemas',
    ' * ',
    ' * DO NOT EDIT - Generated by generate-types-v2.ts',
    ' */',
    '',
    '// SAP schema types',
    `export * from './sap';`,
    '',
    '// Custom schema types',
    `export * from './custom';`,
    '',
  ];
  writeFileSync(join(outputBase, 'index.ts'), rootIndexLines.join('\n'));
  console.log(`✅ Generated types/index.ts`);
}

main();
