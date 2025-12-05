/**
 * Generator Presets
 * 
 * Composable generators for different output formats.
 * All generators in one file to avoid DTS bundling issues.
 */

import { parseXsd } from '../xsd';
import type { Schema } from '../xsd/types';

// ============================================================================
// Types
// ============================================================================

export interface GeneratorContext {
  xsdContent: string;
  schema: Schema;
  name: string;
  tsImports: string[];
  importedSchemas: string[];
  outputSchema: Record<string, unknown>;
  options: PresetOptions;
}

export interface PresetOptions {
  name?: string;
  comment?: string;
  pretty?: boolean;
  indent?: string;
  features?: {
    $xmlns?: boolean;
    $imports?: boolean;
    $filename?: boolean;
    /** Import raw schemas (_schemaName) instead of wrapped schemas for $imports */
    rawImports?: boolean;
    /** Use default imports (import x from './x') instead of named imports */
    defaultImports?: boolean;
  };
  exclude?: string[];
  importResolver?: (schemaLocation: string) => string | null;
  factoryImport?: string;
  factoryName?: string;
}

export type GeneratorFn = (ctx: GeneratorContext) => GeneratorContext;

export class SchemaRef {
  constructor(public readonly name: string) {}
}

// ============================================================================
// Context Initialization
// ============================================================================

export function initContext(xsdContent: string, options: PresetOptions): GeneratorContext {
  const schema = parseXsd(xsdContent);
  const name = options.name ?? 'schema';
  
  return {
    xsdContent,
    schema,
    name,
    tsImports: [],
    importedSchemas: [],
    outputSchema: { ...schema },
    options,
  };
}

// ============================================================================
// Transform Generators
// ============================================================================

export const applyXmlns: GeneratorFn = (ctx) => {
  if (!ctx.options.features?.$xmlns) {
    const { $xmlns, ...rest } = ctx.outputSchema as { $xmlns?: unknown };
    return { ...ctx, outputSchema: rest };
  }
  return ctx;
};

export const applyImports: GeneratorFn = (ctx) => {
  const { features, importResolver } = ctx.options;
  const xsdImports = (ctx.schema.import ?? []) as Array<{ schemaLocation?: string }>;
  
  if (!features?.$imports || !importResolver) {
    const { import: _, ...rest } = ctx.outputSchema as { import?: unknown };
    return { ...ctx, outputSchema: rest };
  }
  
  const tsImports: string[] = [];
  const importedSchemas: string[] = [];
  
  // Check if we should use raw imports (for dual preset) or default imports (for raw preset)
  const useRawImports = features?.rawImports ?? false;
  const useDefaultImports = features?.defaultImports ?? false;
  
  for (const imp of xsdImports) {
    if (imp.schemaLocation) {
      const modulePath = importResolver(imp.schemaLocation);
      if (modulePath) {
        // Extract basename from schemaLocation (e.g., "../sap/adtcore.xsd" → "adtcore")
        const schemaName = imp.schemaLocation.replace(/\.xsd$/, '').replace(/^.*\//, '');
        if (useDefaultImports) {
          // Default import: import schemaName from './path'
          tsImports.push(`import ${schemaName} from '${modulePath}';`);
          importedSchemas.push(schemaName);
        } else {
          // Named import: import { _schemaName } from './path' or import { schemaName } from './path'
          const importName = useRawImports ? `_${schemaName}` : schemaName;
          tsImports.push(`import { ${importName} } from '${modulePath}';`);
          importedSchemas.push(importName);
        }
      }
    }
  }
  
  // Remove import, keep $xmlns at the start, add $imports right after
  const { import: _, $xmlns, ...rest } = ctx.outputSchema as { import?: unknown; $xmlns?: unknown };
  const outputSchema = importedSchemas.length > 0
    ? { $xmlns, $imports: importedSchemas.map(n => new SchemaRef(n)), ...rest }
    : { $xmlns, ...rest };
  
  return {
    ...ctx,
    tsImports: [...ctx.tsImports, ...tsImports],
    importedSchemas: [...ctx.importedSchemas, ...importedSchemas],
    outputSchema,
  };
};

export const applyFilename: GeneratorFn = (ctx) => {
  if (ctx.options.features?.$filename && ctx.name) {
    return {
      ...ctx,
      outputSchema: { $filename: `${ctx.name}.xsd`, ...ctx.outputSchema },
    };
  }
  return ctx;
};

export const applyExclude: GeneratorFn = (ctx) => {
  const exclude = new Set(ctx.options.exclude ?? []);
  if (exclude.size === 0) return ctx;
  
  return {
    ...ctx,
    outputSchema: filterDeep(ctx.outputSchema, exclude) as Record<string, unknown>,
  };
};

// ============================================================================
// Output Generators
// ============================================================================

export function outputLiteral(ctx: GeneratorContext): string {
  const { name, options } = ctx;
  const safeName = escapeReservedWord(name);
  const literal = objectToLiteral(ctx.outputSchema, options.pretty ?? true, options.indent ?? '  ', 0);
  
  return `export const ${safeName} = ${literal} as const;`;
}

export function outputFactory(ctx: GeneratorContext): string {
  const { name, options } = ctx;
  const safeName = escapeReservedWord(name);
  const factoryName = options.factoryName ?? 'createSchema';
  const literal = objectToLiteral(ctx.outputSchema, options.pretty ?? true, options.indent ?? '  ', 0);
  
  return `export const ${safeName} = ${factoryName}(${literal});`;
}

/**
 * Output both raw schema (for $imports) and wrapped schema (for usage).
 * 
 * Generates:
 * - `_schemaName` - raw schema object (for $imports)
 * - `schemaName` - wrapped with factory (for parse/build)
 */
export function outputDual(ctx: GeneratorContext): string {
  const { name, options } = ctx;
  const safeName = escapeReservedWord(name);
  const rawName = `_${safeName}`;
  const factoryName = options.factoryName ?? 'createSchema';
  const literal = objectToLiteral(ctx.outputSchema, options.pretty ?? true, options.indent ?? '  ', 0);
  
  return [
    `/** Raw schema for use in $imports */`,
    `export const ${rawName} = ${literal} as const;`,
    ``,
    `/** Wrapped schema with parse/build methods */`,
    `export const ${safeName} = ${factoryName}(${rawName});`,
  ].join('\n');
}

/**
 * Output only raw schema (for use with pre-computed types).
 * 
 * Generates:
 * - default export - raw schema object
 */
export function outputRaw(ctx: GeneratorContext): string {
  const { options } = ctx;
  const literal = objectToLiteral(ctx.outputSchema, options.pretty ?? true, options.indent ?? '  ', 0);
  
  return `export default ${literal} as const;`;
}

// ============================================================================
// Presets
// ============================================================================

export type PresetName = 'literal' | 'factory' | 'dual' | 'raw';

export interface Preset {
  generators: GeneratorFn[];
  output: (ctx: GeneratorContext) => string;
  extraImports?: (ctx: GeneratorContext) => string[];
  /** Custom type export line generator */
  typeExport?: (safeName: string, pascalName: string) => string | null;
}

export const PRESETS: Record<PresetName, Preset> = {
  literal: {
    generators: [applyXmlns, applyImports, applyFilename, applyExclude],
    output: outputLiteral,
  },
  factory: {
    generators: [applyXmlns, applyImports, applyFilename, applyExclude],
    output: outputFactory,
    extraImports: (ctx) => {
      const factoryImport = ctx.options.factoryImport;
      const factoryName = ctx.options.factoryName ?? 'createSchema';
      if (factoryImport) {
        // Use default import syntax
        return [`import ${factoryName} from '${factoryImport}';`];
      }
      return [];
    },
  },
  dual: {
    generators: [applyXmlns, applyImports, applyFilename, applyExclude],
    output: outputDual,
    extraImports: (ctx) => {
      const factoryImport = ctx.options.factoryImport;
      const factoryName = ctx.options.factoryName ?? 'createSchema';
      const imports: string[] = [];
      if (factoryImport) {
        imports.push(`import ${factoryName} from '${factoryImport}';`);
      }
      // Import InferSchema for type inference
      imports.push(`import type { InferSchema } from '@abapify/ts-xsd-core';`);
      return imports;
    },
    // For dual preset, export the inferred data type from the raw schema
    typeExport: (safeName, pascalName) => 
      `export type ${pascalName} = InferSchema<typeof _${safeName}>;`,
  },
  /**
   * Raw preset - exports only the raw schema literal.
   * Use with pre-computed types (generated separately).
   * 
   * Output:
   *   export const _schemaName = { ... } as const;
   */
  raw: {
    generators: [applyXmlns, applyImports, applyFilename, applyExclude],
    output: outputRaw,
    // No type export - types are generated separately
    typeExport: () => null,
  },
};

export function generateWithPreset(
  xsdContent: string,
  preset: PresetName,
  options: PresetOptions = {}
): string {
  const presetConfig = PRESETS[preset];
  const { name = 'schema', comment } = options;
  
  let ctx = initContext(xsdContent, options);
  for (const generator of presetConfig.generators) {
    ctx = generator(ctx);
  }
  
  const allImports: string[] = [];
  if (presetConfig.extraImports) {
    allImports.push(...presetConfig.extraImports(ctx));
  }
  allImports.push(...ctx.tsImports);
  
  const safeName = escapeReservedWord(name);
  const pascalName = pascalCase(name);
  
  // Use custom typeExport if provided, otherwise default to typeof
  const typeExportLine = presetConfig.typeExport
    ? presetConfig.typeExport(safeName, pascalName)
    : `export type ${pascalName}Type = typeof ${safeName};`;
  
  const lines: string[] = [
    '/**',
    ' * Auto-generated schema from XSD',
    ' * ',
    ' * DO NOT EDIT - Generated by ts-xsd-core codegen',
    comment ? ` * ${comment}` : null,
    ' */',
    '',
    ...allImports,
    allImports.length > 0 ? '' : null,
    presetConfig.output(ctx),
    '',
    typeExportLine,
    '',
  ].filter((line): line is string => line !== null);
  
  return lines.join('\n');
}

// ============================================================================
// Helpers
// ============================================================================

function filterDeep(value: unknown, exclude: Set<string>): unknown {
  if (value instanceof SchemaRef) {
    return value;
  }
  
  if (Array.isArray(value)) {
    return value.map(item => filterDeep(item, exclude));
  }
  
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (!exclude.has(k)) {
        result[k] = filterDeep(v, exclude);
      }
    }
    return result;
  }
  
  return value;
}

function objectToLiteral(value: unknown, pretty: boolean, indent: string, depth: number): string {
  if (value === null || value === undefined) {
    return 'undefined';
  }

  if (value instanceof SchemaRef) {
    return value.name;
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    
    const items = value.map(item => objectToLiteral(item, pretty, indent, depth + 1));
    
    if (pretty) {
      const itemIndent = indent.repeat(depth + 1);
      const closeIndent = indent.repeat(depth);
      return `[\n${items.map(item => `${itemIndent}${item}`).join(',\n')},\n${closeIndent}]`;
    }
    
    return `[${items.join(', ')}]`;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    
    if (entries.length === 0) return '{}';

    const props = entries.map(([key, val]) => {
      const keyStr = isValidIdentifier(key) ? key : JSON.stringify(key);
      const valStr = objectToLiteral(val, pretty, indent, depth + 1);
      return `${keyStr}: ${valStr}`;
    });

    if (pretty) {
      const propIndent = indent.repeat(depth + 1);
      const closeIndent = indent.repeat(depth);
      return `{\n${props.map(prop => `${propIndent}${prop}`).join(',\n')},\n${closeIndent}}`;
    }

    return `{ ${props.join(', ')} }`;
  }

  return 'undefined';
}

const RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
  'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
  'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
  'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends',
  'import', 'super', 'implements', 'interface', 'let', 'package', 'private',
  'protected', 'public', 'static', 'yield', 'await', 'null', 'true', 'false',
]);

function toValidIdentifier(name: string): string {
  // Convert hyphens to camelCase
  let result = name.replace(/-([a-zA-Z])/g, (_, c) => c.toUpperCase());
  // Escape reserved words
  if (RESERVED_WORDS.has(result)) {
    result = `${result}_`;
  }
  return result;
}

// Keep for backwards compatibility
function escapeReservedWord(name: string): string {
  return toValidIdentifier(name);
}

function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str) && !RESERVED_WORDS.has(str);
}

function pascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, s => s.toUpperCase());
}
