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

import type { CodegenOptions, GeneratedSchema, ImportResolver } from './types';
import type { Generator, SchemaData, SchemaImport } from './generator';
import { parseSchema } from './xs/schema';
import { generateElementObj } from './xs/sequence';
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
  const { targetNs, prefix, complexTypes, simpleTypes, rootElement, imports, nsMap } = parseSchema(xsd, options);
  const importedSchemas = options.importedSchemas;
  const resolver = options.resolver || defaultResolver;

  // Build imports array
  const schemaImports: SchemaImport[] = imports.map(imp => ({
    name: getImportName(imp.schemaLocation),
    path: resolver(imp.schemaLocation, imp.namespace),
    namespace: imp.namespace,
  }));

  // Build elements object
  const elements: Record<string, unknown> = {};
  for (const [typeName, typeEl] of complexTypes) {
    elements[typeName] = generateElementObj(typeEl, complexTypes, simpleTypes, nsMap, importedSchemas);
  }

  // Determine root
  const root = rootElement 
    ? rootElement.type?.split(':').pop() || rootElement.name
    : undefined;

  const schemaData: SchemaData = {
    namespace: targetNs,
    prefix,
    root,
    elements,
    imports: schemaImports,
  };

  // Raw schema for JSON output (backward compat)
  const rawSchema: Record<string, unknown> = { elements };
  if (root) rawSchema.root = root;
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
    root: schemaData.root || '',
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
