/**
 * Generator Interface for ts-xsd codegen
 * 
 * Generators are pluggable modules that control how TypeScript code is generated
 * from parsed XSD schemas. This allows different output formats:
 * - raw: Plain schema objects with XsdSchema type
 * - factory: Wrapped schemas using a factory function
 * - custom: User-defined generators
 */

// Types are self-contained - no imports needed from ./types

/**
 * Import info for a schema dependency
 */
export interface SchemaImport {
  /** Variable name to use in import statement */
  name: string;
  /** Resolved import path */
  path: string;
  /** Original namespace URI */
  namespace: string;
}

/**
 * Parsed schema data passed to generators
 */
export interface SchemaData {
  /** Target namespace URI */
  namespace?: string;
  /** Namespace prefix */
  prefix: string;
  /** Root element name */
  root?: string;
  /** Element definitions as object */
  elements: Record<string, unknown>;
  /** Schema imports/dependencies */
  imports: SchemaImport[];
}

/**
 * Context passed to generator functions
 */
export interface GeneratorContext {
  /** Parsed schema data */
  schema: SchemaData;
  /** Extra CLI arguments (--key=value) */
  args: Record<string, string>;
}

/**
 * Generator module interface
 * 
 * Generators can be:
 * - Built-in: ts-xsd/generators/raw, ts-xsd/generators/factory
 * - Custom: ./path/to/my-generator
 */
export interface Generator {
  /**
   * Generate TypeScript code for a single schema
   * @param ctx Generator context with schema data and args
   * @returns Generated TypeScript code
   */
  generate(ctx: GeneratorContext): string;
  
  /**
   * Generate index file for all schemas (optional)
   * @param schemas List of schema names
   * @param args Extra CLI arguments (deprecated, use generator options instead)
   * @returns Generated index.ts code, or undefined to skip
   */
  generateIndex?(schemas: string[], args?: Record<string, string>): string | undefined;
  
  /**
   * Generate stub for missing schema dependency (optional)
   * @param schemaName Name of the missing schema
   * @returns Generated stub code, or undefined to skip
   */
  generateStub?(schemaName: string): string | undefined;
}

/**
 * Convert a value to TypeScript literal (without JSON double-quoted keys)
 */
function toTsLiteral(value: unknown, indent: string, depth = 0): string {
  const currentIndent = indent + '  '.repeat(depth);
  const nextIndent = indent + '  '.repeat(depth + 1);
  
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(v => `${nextIndent}${toTsLiteral(v, indent, depth + 1)}`);
    return `[\n${items.join(',\n')},\n${currentIndent}]`;
  }
  
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    
    const props = entries.map(([k, v]) => {
      // Use unquoted key if it's a valid identifier
      const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`;
      return `${nextIndent}${key}: ${toTsLiteral(v, indent, depth + 1)}`;
    });
    return `{\n${props.join(',\n')},\n${currentIndent}}`;
  }
  
  return String(value);
}

/**
 * Helper to generate schema object literal (shared by generators)
 */
export function generateSchemaLiteral(schema: SchemaData, indent = ''): string {
  const lines: string[] = [];
  
  lines.push(`${indent}{`);
  
  if (schema.namespace) {
    lines.push(`${indent}  ns: '${schema.namespace}',`);
    lines.push(`${indent}  prefix: '${schema.prefix}',`);
  }
  
  if (schema.root) {
    lines.push(`${indent}  root: '${schema.root}',`);
  }
  
  if (schema.imports.length > 0) {
    const importNames = schema.imports.map(i => i.name).join(', ');
    lines.push(`${indent}  include: [${importNames}],`);
  }
  
  lines.push(`${indent}  elements: {`);
  
  for (const [name, def] of Object.entries(schema.elements)) {
    const defStr = toTsLiteral(def, `${indent}    `, 0);
    lines.push(`${indent}    ${name}: ${defStr},`);
  }
  
  lines.push(`${indent}  },`);
  lines.push(`${indent}}`);
  
  return lines.join('\n');
}

/**
 * Helper to generate import statements
 */
export function generateImports(imports: SchemaImport[]): string {
  return imports.map(i => `import ${i.name} from '${i.path}';`).join('\n');
}
