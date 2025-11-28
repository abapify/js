/**
 * Shared types for codegen modules
 */

// Use 'any' for xmldom types to avoid compatibility issues
export type XmlElement = any;

/**
 * Resolver function to transform schemaLocation to file path
 * @param schemaLocation - Original schemaLocation from xsd:import
 * @param namespace - Namespace URI from xsd:import
 * @returns Resolved file path to the XSD file (absolute or relative to cwd)
 */
export type ImportResolver = (schemaLocation: string, namespace: string) => string;

/** Parsed imported schema info for resolving element references */
export interface ImportedSchema {
  /** Namespace URI */
  namespace: string;
  /** Element definitions: element name -> type name */
  elements: Map<string, string>;
}

export interface CodegenOptions {
  /** Namespace prefix to use */
  prefix?: string;
  /** Resolver for xsd:import schemaLocation */
  resolver?: ImportResolver;
  /** Pre-parsed imported schemas for resolving element references */
  importedSchemas?: ImportedSchema[];
}

export interface GeneratedSchema {
  /** Generated TypeScript code */
  code: string;
  /** Root element name */
  root: string;
  /** Target namespace */
  namespace?: string;
  /** Parsed schema as JSON object */
  schema: Record<string, unknown>;
}

/** XSD import declaration */
export interface XsdImport {
  namespace: string;
  schemaLocation: string;
}

/** Collected types from XSD parsing */
export interface ParsedSchema {
  targetNs?: string;
  prefix: string;
  complexTypes: Map<string, XmlElement>;
  simpleTypes: Map<string, XmlElement>;
  rootElement: { name: string; type?: string } | null;
  imports: XsdImport[];
  /** Namespace prefix to URI mapping from xmlns:* attributes */
  nsMap: Map<string, string>;
}
