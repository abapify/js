#!/usr/bin/env npx tsx
/**
 * Generate a single barrel TypeScript file with all ADT types
 * 
 * DESIGN: All types are prefixed with their namespace to avoid collisions.
 * Example: AdtObject -> AdtcoreAdtObject, Root -> TmRoot
 * 
 * This ensures:
 * - No type name collisions between schemas
 * - xs:redefine scenarios work correctly (each schema's version is distinct)
 * - Clear provenance of each type
 * 
 * Usage:
 *   npx tsx scripts/generate-types-barrel.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseXsd, generateInterfaces } from 'ts-xsd';

// Namespace URI to prefix mapping
// These prefixes will be prepended to all type names from each schema
const NAMESPACE_TO_PREFIX: Record<string, string> = {
  'http://www.w3.org/2005/Atom': 'Atom',
  'http://www.sap.com/adt/core': 'Adtcore',
  'http://www.sap.com/adt/abapsource': 'Abapsource',
  'http://www.sap.com/adt/oo': 'Abapoo',
  'http://www.sap.com/adt/oo/classes': 'Class',
  'http://www.sap.com/adt/oo/interfaces': 'Intf',
  'http://www.sap.com/adt/packages': 'Pak',
  'http://www.sap.com/adt/atc': 'Atc',
  'http://www.sap.com/adt/atc/finding': 'AtcFinding',
  'http://www.sap.com/adt/atc/result': 'AtcResult',
  'http://www.sap.com/adt/atc/worklist': 'AtcWorklist',
  'http://www.sap.com/cts/adt/tm': 'Tm',
  'http://www.sap.com/adt/cts/transportsearch': 'TransportSearch',
  'http://www.sap.com/cts/adt/transports/search': 'TransportSearch',
  'http://www.sap.com/adt/configuration': 'Configuration',
  'http://www.sap.com/adt/configurations': 'Config',
  'http://www.sap.com/adt/checkrun': 'Checkrun',
  'http://www.sap.com/abapxml/checklist': 'Checklist',
  'http://www.sap.com/adt/debugger': 'Debugger',
  'http://www.sap.com/adt/categories/dynamiclogpoints': 'Logpoint',
  'http://www.sap.com/adt/categories/dynamiclogpoints/logs': 'LogpointLog',
  'http://www.sap.com/adt/crosstrace/traces': 'Traces',
  'http://www.sap.com/adt/quickfixes': 'Quickfix',
  'http://www.sap.com/adt/logs/': 'Log',
  'http://www.sap.com/adt/templatelinks': 'Templatelink',
  'http://www.sap.com/adt/compatibility': 'Compat',
  'http://www.w3.org/2007/app': 'App',
  'http://www.sap.com/adt/http': 'Http',
  'http://www.sap.com/abapxml': 'Asx',
  'http://www.eclipse.org/emf/2002/Ecore': 'Ecore',
};

// Schema-specific prefix overrides (for schemas that share a namespace but need different prefixes)
// This handles xs:redefine scenarios where a custom schema extends a base schema
const SCHEMA_TO_PREFIX: Record<string, string> = {
  'atomExtended': 'AtomExt',
  'templatelinkExtended': 'CompatExt',
  // Transport management schemas all share http://www.sap.com/cts/adt/tm namespace
  'transportmanagment': 'Tm',
  'transportmanagment-create': 'TmCreate',
  'transportmanagment-single': 'TmSingle',
};

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
  { name: 'http', dir: '.xsd/custom' },
  { name: 'transportfind', dir: '.xsd/custom' },
  { name: 'transportmanagment-create', dir: '.xsd/custom' },
  { name: 'transportmanagment-single', dir: '.xsd/custom' },
];

// Track generated types with their source schema for collision detection
const generatedTypes = new Map<string, string>(); // prefixedName -> schemaName

// Cache parsed schemas
const schemaCache = new Map<string, any>();

/**
 * Extract namespace prefix from targetNamespace URI or schema name
 * Priority: 1. Schema-specific override, 2. Namespace mapping, 3. Fallback from schema name
 */
function getNamespacePrefix(targetNamespace: string | undefined, schemaName: string): string {
  // 1. Check schema-specific override first (for xs:redefine scenarios)
  if (SCHEMA_TO_PREFIX[schemaName]) {
    return SCHEMA_TO_PREFIX[schemaName];
  }
  
  // 2. Check namespace mapping
  if (targetNamespace && NAMESPACE_TO_PREFIX[targetNamespace]) {
    return NAMESPACE_TO_PREFIX[targetNamespace];
  }
  
  // 3. Fallback: derive from schema name (PascalCase)
  console.warn(`⚠️  No prefix mapping for namespace "${targetNamespace}" in schema "${schemaName}"`);
  return schemaName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase());
}

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
  
  // Prevent infinite recursion
  if (visited.has(schema)) {
    return imports;
  }
  visited.add(schema);
  
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
          // Recursively resolve nested imports
          const nestedImports = resolveImports(importedSchema, dir, visited);
          importedSchema.$imports = nestedImports;
          imports.push(...nestedImports);
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
          // Recursively resolve nested imports
          const nestedImports = resolveImports(includedSchema, dir, visited);
          includedSchema.$imports = nestedImports;
          imports.push(...nestedImports);
        }
      }
    }
  }
  
  return imports;
}

/**
 * Add namespace prefix to all type names in generated interfaces
 * and check for collisions (which should never happen with prefixes)
 */
function prefixAndValidateTypes(interfaces: string, prefix: string, schemaName: string): string {
  const lines = interfaces.split('\n');
  const result: string[] = [];
  
  // First pass: collect all type names defined in this schema
  const localTypeNames = new Set<string>();
  for (const line of lines) {
    const typeMatch = line.match(/^export (?:interface|type) (\w+)/);
    if (typeMatch) {
      localTypeNames.add(typeMatch[1]);
    }
  }
  
  // Second pass: prefix type names and check for collisions
  for (let line of lines) {
    // Check if this is a type/interface declaration
    const typeMatch = line.match(/^export (interface|type) (\w+)/);
    
    if (typeMatch) {
      const keyword = typeMatch[1];
      const originalTypeName = typeMatch[2];
      const prefixedTypeName = `${prefix}${originalTypeName}`;
      
      // COLLISION CHECK - this should NEVER happen with proper prefixing
      if (generatedTypes.has(prefixedTypeName)) {
        const existingSchema = generatedTypes.get(prefixedTypeName);
        throw new Error(
          `TYPE COLLISION DETECTED!\n` +
          `  Type: ${prefixedTypeName}\n` +
          `  Already defined in: ${existingSchema}\n` +
          `  Attempting to define in: ${schemaName}\n` +
          `  This indicates a bug in the namespace prefix mapping.`
        );
      }
      
      // Register the prefixed type
      generatedTypes.set(prefixedTypeName, schemaName);
      
      // Replace the type name in the declaration
      line = line.replace(
        new RegExp(`^(export ${keyword}) ${originalTypeName}`),
        `$1 ${prefixedTypeName}`
      );
    }
    
    // Replace references to local types with prefixed versions
    // This handles: extends OtherType, property: OtherType, etc.
    for (const localType of localTypeNames) {
      // Match type references (not in strings, after : or extends or <)
      // Be careful not to replace partial matches
      const patterns = [
        // extends SomeType
        new RegExp(`(extends\\s+)${localType}(\\s|{|$)`, 'g'),
        // property: SomeType
        new RegExp(`(:\\s*)${localType}(\\s*[;,}\\[\\]|]|$)`, 'g'),
        // SomeType[]
        new RegExp(`(:\\s*)${localType}(\\[\\])`, 'g'),
        // Array<SomeType>
        new RegExp(`(Array<)${localType}(>)`, 'g'),
        // generic: SomeType<...>
        new RegExp(`(:\\s*)${localType}(<)`, 'g'),
      ];
      
      for (const pattern of patterns) {
        line = line.replace(pattern, `$1${prefix}${localType}$2`);
      }
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

function main() {
  console.log('🔧 Generating single barrel TypeScript file with all ADT types...\n');
  console.log('📋 All types will be prefixed with their namespace (e.g., AdtObject -> AdtcoreAdtObject)\n');
  
  const allInterfaces: string[] = [
    '/**',
    ' * Auto-generated TypeScript interfaces for all ADT schemas',
    ' * ',
    ' * DO NOT EDIT - Generated by generate-types-barrel.ts',
    ' * ',
    ' * NAMING CONVENTION: All types are prefixed with their namespace to avoid collisions.',
    ' * Example: AdtObject -> AdtcoreAdtObject, Root -> TmRoot',
    ' * ',
    ' * This ensures:',
    ' * - No type name collisions between schemas',
    ' * - xs:redefine scenarios work correctly',
    ' * - Clear provenance of each type',
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
      
      // Get namespace prefix for this schema
      const prefix = getNamespacePrefix(schema.targetNamespace, name);
      
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
      
      // Add namespace prefix to all types and validate no collisions
      const prefixedInterfaces = prefixAndValidateTypes(interfaces, prefix, name);
      
      if (prefixedInterfaces.trim()) {
        allInterfaces.push(`// ============================================================================`);
        allInterfaces.push(`// ${name.toUpperCase()} (prefix: ${prefix})`);
        allInterfaces.push(`// ============================================================================`);
        allInterfaces.push('');
        allInterfaces.push(prefixedInterfaces);
        allInterfaces.push('');
      }
      
      console.log(`✅ Processed ${name} [${prefix}*] (${generatedTypes.size} total types)`);
      processedCount++;
    } catch (error) {
      // Re-throw collision errors - these are fatal
      if (error instanceof Error && error.message.includes('TYPE COLLISION DETECTED')) {
        throw error;
      }
      console.error(`❌ Failed ${name}:`, error instanceof Error ? error.message : error);
    }
  }
  
  // Post-process: replace any remaining unprefixed type references with prefixed versions
  // This handles cross-schema references that weren't caught in the per-schema pass
  console.log('\n🔄 Post-processing cross-schema type references...');
  let content = allInterfaces.join('\n');
  
  // Build a map of unprefixed -> prefixed type names
  const unprefixedToPrefix = new Map<string, string>();
  for (const [prefixedName, _schemaName] of generatedTypes) {
    // Extract the unprefixed name by finding the prefix boundary
    // Prefixes are PascalCase, so we look for the pattern where
    // the prefix ends and the original type name begins
    // E.g., "AdtcoreAdtObject" -> "AdtObject" maps to "AdtcoreAdtObject"
    // This is tricky because we don't know where the prefix ends
    // Instead, we'll track original names during generation
  }
  
  // For now, let's do a simpler fix: find any type references that don't exist
  // and try to find a prefixed version
  const typeRefPattern = /(?<=:\s*|\[\s*|extends\s+|<)([A-Z][a-zA-Z0-9]*)(?=\s*[;\[\]<>,{}]|\s*$)/g;
  const allPrefixedTypes = new Set(generatedTypes.keys());
  
  // Find all type references that don't exist as prefixed types
  const missingRefs = new Set<string>();
  let match;
  while ((match = typeRefPattern.exec(content)) !== null) {
    const typeName = match[1];
    if (!allPrefixedTypes.has(typeName) && !['string', 'number', 'boolean', 'unknown', 'any', 'void', 'null', 'undefined', 'never', 'object', 'Date'].includes(typeName)) {
      missingRefs.add(typeName);
    }
  }
  
  // Manual mappings for known cross-schema type references
  // These are types that ts-xsd generates with different names than our prefixed versions
  // NOTE: ecore:name attributes in XSD are ignored - we use the W3C 'name' attribute only
  const manualMappings: Record<string, string> = {
    'Link': 'AtomLinkType',            // Various schemas reference atom's linkType
    'AdtObjectReference': 'AdtcoreAdtObjectReference',  // Use the base adtcore version
    'AtcFindingList': 'AtcFindingAtcFindingList',  // Use the atcfinding version
    'AdtMainObject': 'AdtcoreAdtMainObject',  // Base adtcore type
    'AdtObject': 'AdtcoreAdtObject',  // Base adtcore type
    'AdtExtension': 'AdtcoreAdtExtension',  // Base adtcore type
    'LinkType': 'AtomLinkType',  // atom's linkType
    'AbapOoObject': 'AbapooAbapOoObject',  // abapoo's main type
    'AbapSourceObject': 'AbapsourceAbapSourceObject',  // abapsource's main type
    'AbapSourceMainObject': 'AbapsourceAbapSourceMainObject',  // abapsource's main type
  };
  
  // Try to find prefixed versions for missing refs
  for (const missingRef of missingRefs) {
    // Check manual mappings first
    if (manualMappings[missingRef]) {
      const prefixedName = manualMappings[missingRef];
      console.log(`   Fixing (manual): ${missingRef} -> ${prefixedName}`);
      const safePattern = new RegExp(`(?<=:\\s*|\\[\\s*|extends\\s+|<)${missingRef}(?=\\s*[;\\[\\]<>,{}]|\\s*$)`, 'g');
      content = content.replace(safePattern, prefixedName);
      continue;
    }
    
    // Find any prefixed type that ends with this name
    const candidates = Array.from(allPrefixedTypes).filter(pt => pt.endsWith(missingRef));
    if (candidates.length === 1) {
      // Unambiguous match - replace it
      const prefixedName = candidates[0];
      console.log(`   Fixing: ${missingRef} -> ${prefixedName}`);
      // Replace all occurrences of the unprefixed type with the prefixed version
      // Be careful to only replace type references, not partial matches
      const safePattern = new RegExp(`(?<=:\\s*|\\[\\s*|extends\\s+|<)${missingRef}(?=\\s*[;\\[\\]<>,{}]|\\s*$)`, 'g');
      content = content.replace(safePattern, prefixedName);
    } else if (candidates.length > 1) {
      console.warn(`   ⚠️  Ambiguous: ${missingRef} could be: ${candidates.join(', ')}`);
    } else {
      console.warn(`   ⚠️  Unknown type: ${missingRef} (no prefixed version found)`);
    }
  }
  
  // Write single barrel file
  const outputDir = 'src/schemas/generated/types';
  mkdirSync(outputDir, { recursive: true });
  
  const outputPath = join(outputDir, 'index.ts');
  writeFileSync(outputPath, content);
  
  console.log(`\n✅ Generated ${outputPath}`);
  console.log(`📊 Summary: ${processedCount} schemas processed, ${skippedCount} skipped`);
  console.log(`📊 Total unique types: ${generatedTypes.size}`);
}

main();
