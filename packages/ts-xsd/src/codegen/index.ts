/**
 * ts-xsd Code Generator
 *
 * Generate TypeScript schema files from XSD
 * 
 * Structure:
 * - xs/schema.ts   - xs:schema parsing
 * - xs/types.ts    - xs:simpleType / type mapping
 * - xs/element.ts  - xs:element handling
 * - xs/attribute.ts - xs:attribute handling
 * - xs/sequence.ts - xs:sequence / xs:choice handling
 * - generator.ts   - Pluggable generator interface
 */

export type { CodegenOptions, GeneratedSchema, ImportResolver, ImportedSchema } from './types';
export type { Generator, GeneratorContext, SchemaData, SchemaImport } from './generator';
export { 
  generateBatch, 
  scanXsdDirectory,
  collectDependencies,
  extractImportedSchemas,
  type BatchOptions, 
  type BatchResult,
} from './batch';

import type { CodegenOptions, GeneratedSchema, ImportResolver } from './types';
import type { Generator, SchemaData, SchemaImport, SchemaElementDecl } from './generator';
import { parseSchema } from './xs/schema';
import { generateElementObj } from './xs/sequence';
import { generateSimpleTypeObj } from './xs/types';
import rawGenerator from '../generators/raw';

/**
 * Default resolver - just strips .xsd extension
 */
const defaultResolver: ImportResolver = (schemaLocation) => {
  return schemaLocation.replace(/\.xsd$/, '');
};

/**
 * Get import variable name from schemaLocation
 */
function getImportName(schemaLocation: string): string {
  // Extract filename without extension and capitalize
  const filename = schemaLocation.split('/').pop()?.replace(/\.xsd$/, '') || 'Schema';
  return filename.charAt(0).toUpperCase() + filename.slice(1);
}

/**
 * Parse XSD and return schema data for generators
 */
export function parseXsdToSchemaData(xsd: string, options: CodegenOptions = {}): { schemaData: SchemaData; rawSchema: Record<string, unknown> } {
  const { targetNs, prefix, complexTypes, simpleTypes, elements: parsedElements, imports, redefines, nsMap, attributeFormDefault } = parseSchema(xsd, options);
  const importedSchemas = options.importedSchemas;
  const resolver = options.resolver || defaultResolver;

  // Build imports array from both imports and redefines
  const schemaImports: SchemaImport[] = imports.map(imp => ({
    name: getImportName(imp.schemaLocation),
    path: resolver(imp.schemaLocation, imp.namespace),
    namespace: imp.namespace,
  }));
  
  // Add redefines as imports (they reference base schemas)
  for (const redef of redefines) {
    schemaImports.push({
      name: getImportName(redef.schemaLocation),
      path: resolver(redef.schemaLocation, ''),
      namespace: '',
    });
  }

  // Merge redefined types into complexTypes
  // Redefined types use xs:extension internally, so they'll have 'extends' property
  const mergedComplexTypes = new Map(complexTypes);
  const mergedSimpleTypes = new Map(simpleTypes);
  for (const redef of redefines) {
    for (const [typeName, typeEl] of redef.complexTypes) {
      mergedComplexTypes.set(typeName, typeEl);
    }
    for (const [typeName, typeEl] of redef.simpleTypes) {
      mergedSimpleTypes.set(typeName, typeEl);
    }
  }

  // Build complexType object (new format)
  const complexTypeObj: Record<string, unknown> = {};
  for (const [typeName, typeEl] of mergedComplexTypes) {
    // Pass typeName to detect xs:redefine self-reference (where base === typeName)
    complexTypeObj[typeName] = generateElementObj(typeEl, mergedComplexTypes, mergedSimpleTypes, nsMap, importedSchemas, typeName);
  }

  // Build simpleType object (new format)
  const simpleTypeObj: Record<string, unknown> = {};
  for (const [typeName, typeEl] of mergedSimpleTypes) {
    const simpleType = generateSimpleTypeObj(typeEl);
    if (simpleType) {
      simpleTypeObj[typeName] = simpleType;
    }
  }

  // Build element declarations array (new format)
  const elementDecls: SchemaElementDecl[] = parsedElements.map(el => ({
    name: el.name,
    type: el.type,
  }));

  const schemaData: SchemaData = {
    namespace: targetNs,
    prefix,
    element: elementDecls,
    complexType: complexTypeObj,
    simpleType: Object.keys(simpleTypeObj).length > 0 ? simpleTypeObj : undefined,
    imports: schemaImports,
    attributeFormDefault,
  };

  // Raw schema for JSON output (backward compat)
  const rawSchema: Record<string, unknown> = { 
    element: elementDecls,
    complexType: complexTypeObj,
  };
  if (Object.keys(simpleTypeObj).length > 0) {
    rawSchema.simpleType = simpleTypeObj;
  }
  if (targetNs) {
    rawSchema.ns = targetNs;
    rawSchema.prefix = prefix;
  }
  if (imports.length > 0) {
    rawSchema.imports = imports;
  }

  return { schemaData, rawSchema };
}

/**
 * Generate ts-xsd schema from XSD string
 * 
 * @param xsd - XSD content
 * @param options - Codegen options
 * @param generator - Generator to use (default: raw)
 * @param args - Extra arguments for generator
 */
export function generateFromXsd(
  xsd: string, 
  options: CodegenOptions = {},
  generator: Generator = rawGenerator,
  args: Record<string, string> = {}
): GeneratedSchema {
  const { schemaData, rawSchema } = parseXsdToSchemaData(xsd, options);

  // Generate code using the generator
  const code = generator.generate({ schema: schemaData, args });

  return {
    code,
    root: schemaData.element[0]?.name || '',
    namespace: schemaData.namespace,
    schema: rawSchema,
  };
}

/**
 * Generate index file for multiple schemas
 */
export function generateIndex(
  schemas: string[],
  generator: Generator = rawGenerator,
  args: Record<string, string> = {}
): string | undefined {
  return generator.generateIndex?.(schemas, args);
}
