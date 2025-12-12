/**
 * Schema to ts-morph SourceFile converter
 *
 * Converts XSD schemas directly to ts-morph SourceFiles with TypeScript interfaces.
 *
 * Features:
 * - schemaToSourceFile: Convert schema to ts-morph SourceFile with interfaces
 *   - If schema has schemaLocation imports -> uses loader to load them
 *   - If schema has $imports -> generates import statements and extends
 * - flattenType: Flatten a type from a SourceFile into a new file with inline types
 */

import { Project, SourceFile, Type, TypeChecker, Node } from 'ts-morph';
import type {
  Schema,
  TopLevelComplexType,
  TopLevelSimpleType,
  LocalComplexType,
  LocalElement,
  LocalAttribute,
  ExplicitGroup,
} from '../xsd/types';
// =============================================================================
// Public Types
// =============================================================================

/**
 * Resolver function for loading schemas by schemaLocation.
 * @param schemaLocation - The schemaLocation path from the import element
 * @param basePath - Optional base path for resolving relative paths
 * @returns The resolved Schema, or undefined if not found
 */
export type SchemaLocationResolver = (
  schemaLocation: string,
  basePath?: string
) => Schema | undefined;

export interface SchemaToSourceFileOptions {
  /** Custom root type name. Pass null to disable root type generation. */
  rootTypeName?: string | null;
  /** Add JSDoc comments */
  addJsDoc?: boolean;
  /** Existing project to use */
  project?: Project;
  /** Base path for loading schemaLocation imports */
  basePath?: string;
  /**
   * Resolver function for loading schemas by schemaLocation.
   * If provided, will be called for each `import` element with a schemaLocation.
   * The resolved schemas will be processed like $imports.
   */
  schemaLocationResolver?: SchemaLocationResolver;
}

export interface SchemaSourceFileResult {
  /** The ts-morph Project */
  project: Project;
  /** The generated SourceFile with all interfaces */
  sourceFile: SourceFile;
  /** The root type name (e.g., "DiscoverySchema") */
  rootTypeName: string | undefined;
}

export interface GenerateInterfacesOptions extends SchemaToSourceFileOptions {
  /**
   * If true, generates a single flattened type with all nested types inlined.
   * If false (default), generates interfaces with imports and extends.
   */
  flatten?: boolean;
  /**
   * Additional source files to include for resolving imports when flattening.
   * These are typically the generated source files from $imports schemas.
   */
  additionalSourceFiles?: SourceFile[];
}

export interface GenerateInterfacesResult {
  /** The generated TypeScript code */
  code: string;
  /** The ts-morph SourceFile */
  sourceFile: SourceFile;
  /** The root type name */
  rootTypeName: string | undefined;
  /** The ts-morph Project (useful for further manipulation) */
  project: Project;
}

// =============================================================================
// schemaToSourceFile - Main Entry Point
// =============================================================================

/**
 * Convert a schema to a ts-morph SourceFile with TypeScript interfaces.
 *
 * - If schema has `import` with schemaLocation -> loads and processes them
 * - If schema has `$imports` (already linked) -> generates import statements with extends
 */
export function schemaToSourceFile(
  schema: Schema,
  options: SchemaToSourceFileOptions = {}
): SchemaSourceFileResult {
  const project =
    options.project ?? new Project({ useInMemoryFileSystem: true });
  // Only derive rootTypeName if explicitly requested or not explicitly disabled
  // Pass rootTypeName: undefined to disable, or omit to auto-derive
  const rootTypeName =
    options.rootTypeName === undefined
      ? deriveRootTypeName(schema.$filename)
      : options.rootTypeName; // null or explicit name
  const filename = `${
    schema.$filename?.replace('.xsd', '') || 'schema'
  }.types.ts`;
  const sourceFile = project.createSourceFile(filename, '', {
    overwrite: true,
  });

  const ctx: GeneratorContext = {
    schema,
    sourceFile,
    project,
    generatedTypes: new Set<string>(),
    addJsDoc: options.addJsDoc,
    basePath: options.basePath,
    importedTypes: new Map<string, string>(), // typeName -> importPath
  };

  // Process schemaLocation imports via resolver
  if (options.schemaLocationResolver && schema.import) {
    for (const imp of schema.import) {
      if (imp.schemaLocation) {
        const resolvedSchema = options.schemaLocationResolver(
          imp.schemaLocation,
          options.basePath
        );
        if (resolvedSchema) {
          trackImportedTypes(resolvedSchema, ctx);
        }
      }
    }
  }

  // Process $imports - track types from already-linked schemas
  if (schema.$imports) {
    for (const importedSchema of schema.$imports) {
      trackImportedTypes(importedSchema, ctx);
    }
  }

  // Generate interfaces for all complex types
  for (const ct of schema.complexType ?? []) {
    if (ct.name) {
      generateInterface(ct.name, ct, ctx);
    }
  }

  // Generate interfaces for root elements with inline complexType
  for (const el of schema.element ?? []) {
    if (el.name && el.complexType) {
      // Generate interface for inline complexType (e.g., AbapGitType from abapGit element)
      const interfaceName = toInterfaceName(el.name);
      generateInterface(interfaceName, el.complexType, ctx);
    }
  }

  // Generate type aliases for all simple types
  for (const st of schema.simpleType ?? []) {
    if (st.name) {
      generateSimpleType(st.name, st, ctx);
    }
  }

  // Generate root schema type from elements
  if (rootTypeName) {
    generateRootType(rootTypeName, ctx);
  }

  // Add import statements for imported types
  addImportStatements(ctx);

  sourceFile.formatText();

  return {
    project,
    sourceFile,
    rootTypeName: rootTypeName ?? undefined,
  };
}

// =============================================================================
// flattenType - Flatten a type into a new file
// =============================================================================

export interface FlattenTypeOptions {
  /** Output filename */
  filename?: string;
  /** Additional source files to include for resolving imports (e.g., base type files) */
  additionalSourceFiles?: SourceFile[];
}

/**
 * Flatten a type from a SourceFile into a new file with all nested types inlined.
 *
 * @param sourceFile - The source file containing the type
 * @param typeName - Name of the type to flatten
 * @param options - Options
 * @returns New SourceFile with the flattened type
 */
export function flattenType(
  sourceFile: SourceFile,
  typeName: string,
  options: FlattenTypeOptions = {}
): SourceFile {
  const project = sourceFile.getProject();

  // Add additional source files to the project for cross-file type resolution
  if (options.additionalSourceFiles) {
    for (const additionalFile of options.additionalSourceFiles) {
      // Copy the content to the same project so types can be resolved
      const existingFile = project.getSourceFile(additionalFile.getFilePath());
      if (!existingFile) {
        project.createSourceFile(
          additionalFile.getFilePath(),
          additionalFile.getFullText(),
          { overwrite: true }
        );
      }
    }
  }

  const checker = project.getTypeChecker();

  // Find the type alias or interface
  const typeAlias = sourceFile.getTypeAlias(typeName);
  const iface = sourceFile.getInterface(typeName);
  const node = typeAlias ?? iface;

  if (!node) {
    throw new Error(`Type "${typeName}" not found in source file`);
  }

  const type = node.getType();
  const flattened = expandTypeToString(type, checker, node);

  const outputFilename =
    options.filename ?? `${typeName.toLowerCase()}.flattened.ts`;
  const flatFile = project.createSourceFile(outputFilename, '', {
    overwrite: true,
  });

  flatFile.addTypeAlias({
    name: typeName,
    isExported: true,
    type: flattened,
  });

  flatFile.formatText();
  return flatFile;
}

// =============================================================================
// generateInterfaces - High-level API
// =============================================================================

/**
 * Generate TypeScript interfaces from a schema.
 *
 * @param schema - The schema to generate interfaces from
 * @param options - Generation options
 * @returns Generated TypeScript code and metadata
 *
 * @example
 * // Generate interfaces with imports and extends
 * const { code } = generateInterfaces(schema);
 *
 * @example
 * // Generate a single flattened type with all nested types inlined
 * const { code } = generateInterfaces(schema, {
 *   flatten: true,
 *   additionalSourceFiles: [baseSchemaSourceFile]
 * });
 */
export function generateInterfaces(
  schema: Schema,
  options: GenerateInterfacesOptions = {}
): GenerateInterfacesResult {
  const { flatten, additionalSourceFiles, ...schemaOptions } = options;

  // Step 1: Generate the source file with interfaces
  const { project, sourceFile, rootTypeName } = schemaToSourceFile(
    schema,
    schemaOptions
  );

  // Step 2: If flatten is requested and we have a root type, flatten it
  if (flatten && rootTypeName) {
    const flattenedFile = flattenType(sourceFile, rootTypeName, {
      additionalSourceFiles,
      filename: `${
        schema.$filename?.replace('.xsd', '') ?? 'schema'
      }.flattened.ts`,
    });

    return {
      code: flattenedFile.getFullText(),
      sourceFile: flattenedFile,
      rootTypeName,
      project,
    };
  }

  // Return the non-flattened interfaces
  return {
    code: sourceFile.getFullText(),
    sourceFile,
    rootTypeName,
    project,
  };
}

// =============================================================================
// Type Expansion (for flattenType)
// =============================================================================

/**
 * Check if a type is a primitive that shouldn't be expanded.
 */
export function isPrimitiveType(type: Type): boolean {
  return (
    type.isString() ||
    type.isNumber() ||
    type.isBoolean() ||
    type.isUndefined() ||
    type.isNull() ||
    type.isUnknown() ||
    type.isStringLiteral() ||
    type.isNumberLiteral() ||
    type.isBooleanLiteral() ||
    type.isAny() ||
    type.isNever() ||
    type.isVoid()
  );
}

/**
 * Recursively expand a type to an inline string representation.
 * Fully inlines all types - no import() statements in output.
 */
export function expandTypeToString(
  type: Type,
  checker: TypeChecker,
  context: Node,
  indent = '',
  visited = new Set<string>()
): string {
  if (isPrimitiveType(type)) {
    return type.getText();
  }

  if (type.isArray()) {
    const elementType = type.getArrayElementType();
    if (elementType) {
      return `${expandTypeToString(
        elementType,
        checker,
        context,
        indent,
        visited
      )}[]`;
    }
    return 'unknown[]';
  }

  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes();
    if (unionTypes.every((t) => isPrimitiveType(t))) {
      return type.getText();
    }
    return unionTypes
      .map((t) => expandTypeToString(t, checker, context, indent, visited))
      .join(' | ');
  }

  if (type.isIntersection()) {
    return type
      .getIntersectionTypes()
      .map((t) => expandTypeToString(t, checker, context, indent, visited))
      .join(' & ');
  }

  // Get properties and expand them
  const props = type.getProperties();
  if (props.length > 0) {
    // Get a stable type identifier for cycle detection
    const symbol = type.getSymbol() ?? type.getAliasSymbol();
    const typeId = symbol?.getName() ?? type.getText();

    // Check for cycles ONLY when we're about to expand properties
    // This prevents infinite recursion on self-referential types
    if (visited.has(typeId)) {
      return 'unknown';
    }

    // Clone visited set and add current type for this expansion branch
    const newVisited = new Set(visited);
    newVisited.add(typeId);

    const lines: string[] = ['{'];
    for (const prop of props) {
      let name = prop.getName();

      // Handle namespaced property names like "xml: base" -> "base"
      // These come from XSD attribute references like xml:base
      if (name.includes(': ')) {
        name = name.split(': ').pop() ?? name;
      }

      const declarations = prop.getDeclarations();
      const declNode = declarations[0] ?? context;
      const propType = checker.getTypeOfSymbolAtLocation(prop, declNode);
      const optional = prop.isOptional() ? '?' : '';
      const expanded = expandTypeToString(
        propType,
        checker,
        context,
        indent + '  ',
        newVisited
      );
      lines.push(`${indent}  ${name}${optional}: ${expanded};`);
    }
    lines.push(`${indent}}`);
    return lines.join('\n');
  }

  // For types without properties, check if getText() returns an import() - if so, try to expand
  const textRepr = type.getText();
  if (textRepr.includes('import(')) {
    // This is a reference to another type - try to get its properties
    // The type should already be resolved, so getProperties() should work
    // If it doesn't have properties, it might be a type alias - get the base type
    const baseTypes = type.getBaseTypes();
    if (baseTypes.length > 0) {
      return expandTypeToString(
        baseTypes[0],
        checker,
        context,
        indent,
        visited
      );
    }
    // If still no properties, return unknown to avoid import() in output
    return 'unknown';
  }

  return textRepr;
}

// =============================================================================
// Helpers
// =============================================================================

export function deriveRootTypeName(
  filename: string | undefined
): string | undefined {
  if (!filename) return undefined;
  const baseName = filename.replace(/\.xsd$/, '').replace(/^.*\//, '');
  const pascalCase = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  return `${pascalCase}Schema`;
}

// =============================================================================
// Internal Types
// =============================================================================

interface GeneratorContext {
  schema: Schema;
  sourceFile: SourceFile;
  project: Project;
  generatedTypes: Set<string>;
  addJsDoc?: boolean;
  basePath?: string;
  importedTypes: Map<string, string>; // typeName -> schemaFilename (for imports)
}

// =============================================================================
// Internal: XSD Type Mapping
// =============================================================================

const XSD_BUILT_IN_TYPES: Record<string, string> = {
  string: 'string',
  normalizedString: 'string',
  token: 'string',
  language: 'string',
  Name: 'string',
  NCName: 'string',
  ID: 'string',
  IDREF: 'string',
  IDREFS: 'string',
  ENTITY: 'string',
  ENTITIES: 'string',
  NMTOKEN: 'string',
  NMTOKENS: 'string',
  anyURI: 'string',
  QName: 'string',
  NOTATION: 'string',
  integer: 'number',
  int: 'number',
  long: 'number',
  short: 'number',
  byte: 'number',
  decimal: 'number',
  float: 'number',
  double: 'number',
  nonNegativeInteger: 'number',
  positiveInteger: 'number',
  nonPositiveInteger: 'number',
  negativeInteger: 'number',
  unsignedLong: 'number',
  unsignedInt: 'number',
  unsignedShort: 'number',
  unsignedByte: 'number',
  boolean: 'boolean',
  date: 'string',
  time: 'string',
  dateTime: 'string',
  duration: 'string',
  gYear: 'string',
  gYearMonth: 'string',
  gMonth: 'string',
  gMonthDay: 'string',
  gDay: 'string',
  base64Binary: 'string',
  hexBinary: 'string',
  anyType: 'unknown',
  anySimpleType: 'unknown',
};

function stripNsPrefix(name: string): string {
  const idx = name.indexOf(':');
  return idx >= 0 ? name.slice(idx + 1) : name;
}

function toInterfaceName(name: string): string {
  const n = name.charAt(0).toUpperCase() + name.slice(1);
  return n.endsWith('Type') ? n : `${n}Type`;
}

// =============================================================================
// Internal: Import Tracking
// =============================================================================

function trackImportedTypes(
  importedSchema: Schema,
  ctx: GeneratorContext
): void {
  const schemaName = importedSchema.$filename?.replace('.xsd', '') ?? 'unknown';

  for (const ct of importedSchema.complexType ?? []) {
    if (ct.name) {
      ctx.importedTypes.set(ct.name, schemaName);
    }
  }
  for (const st of importedSchema.simpleType ?? []) {
    if (st.name) {
      ctx.importedTypes.set(st.name, schemaName);
    }
  }

  // Recursively track nested imports
  if (importedSchema.$imports) {
    for (const nested of importedSchema.$imports) {
      trackImportedTypes(nested, ctx);
    }
  }
}

function addImportStatements(ctx: GeneratorContext): void {
  // Group imports by schema
  const importsBySchema = new Map<string, Set<string>>();

  for (const [typeName, schemaName] of ctx.importedTypes) {
    const interfaceName = toInterfaceName(typeName);
    // Only add import if we actually reference this type
    if (ctx.generatedTypes.has(`import:${interfaceName}`)) {
      let types = importsBySchema.get(schemaName);
      if (!types) {
        types = new Set();
        importsBySchema.set(schemaName, types);
      }
      types.add(interfaceName);
    }
  }

  // Add import declarations at the top
  for (const [schemaName, types] of importsBySchema) {
    ctx.sourceFile.addImportDeclaration({
      moduleSpecifier: `./${schemaName}.types`,
      namedImports: Array.from(types).sort(),
    });
  }
}

// =============================================================================
// Internal: Type Resolution
// =============================================================================

function resolveTypeName(typeName: string, ctx: GeneratorContext): string {
  const stripped = stripNsPrefix(typeName);

  // Built-in XSD type?
  if (XSD_BUILT_IN_TYPES[stripped]) {
    return XSD_BUILT_IN_TYPES[stripped];
  }

  // Simple type in current schema?
  const st = ctx.schema.simpleType?.find((s) => s.name === stripped);
  if (st?.restriction?.enumeration && st.restriction.enumeration.length > 0) {
    return st.restriction.enumeration.map((e) => `'${e.value}'`).join(' | ');
  }
  if (st?.restriction?.base) {
    return XSD_BUILT_IN_TYPES[stripNsPrefix(st.restriction.base)] ?? 'string';
  }

  // Complex type in current schema?
  const ct = ctx.schema.complexType?.find((c) => c.name === stripped);
  if (ct) {
    return toInterfaceName(stripped);
  }

  // Imported type?
  if (ctx.importedTypes.has(stripped)) {
    const interfaceName = toInterfaceName(stripped);
    ctx.generatedTypes.add(`import:${interfaceName}`); // Mark as used
    return interfaceName;
  }

  return 'unknown';
}

// =============================================================================
// Internal: Interface Generation
// =============================================================================

function generateInterface(
  name: string,
  ct: TopLevelComplexType | LocalComplexType,
  ctx: GeneratorContext
): void {
  const interfaceName = toInterfaceName(name);
  if (ctx.generatedTypes.has(interfaceName)) return;
  ctx.generatedTypes.add(interfaceName);

  const properties: Array<{
    name: string;
    type: string;
    hasQuestionToken: boolean;
  }> = [];
  const extendsTypes: string[] = [];

  // Handle complexContent extension (inheritance)
  if (ct.complexContent?.extension?.base) {
    const baseName = stripNsPrefix(ct.complexContent.extension.base);
    const baseInterfaceName = toInterfaceName(baseName);

    // Is it an imported type?
    if (ctx.importedTypes.has(baseName)) {
      ctx.generatedTypes.add(`import:${baseInterfaceName}`);
      extendsTypes.push(baseInterfaceName);
    } else {
      // Local type - generate it first
      const baseCt = ctx.schema.complexType?.find((c) => c.name === baseName);
      if (baseCt) {
        generateInterface(baseName, baseCt, ctx);
        extendsTypes.push(baseInterfaceName);
      }
    }

    // Collect extension's own properties
    const ext = ct.complexContent.extension;
    if (ext.sequence) collectFromGroup(ext.sequence, properties, ctx, false);
    if (ext.choice) collectFromGroup(ext.choice, properties, ctx, true);
    if (ext.all) collectFromGroup(ext.all, properties, ctx, false);
    collectAttributes(ext.attribute, properties, ctx);
  }
  // Handle simpleContent
  else if (ct.simpleContent?.extension) {
    const ext = ct.simpleContent.extension;
    const baseType = ext.base
      ? XSD_BUILT_IN_TYPES[stripNsPrefix(ext.base)] ?? 'string'
      : 'string';
    properties.push({ name: '_text', type: baseType, hasQuestionToken: true });
    collectAttributes(ext.attribute, properties, ctx);
  }
  // Handle direct content (no complexContent/simpleContent)
  else {
    if (ct.sequence) collectFromGroup(ct.sequence, properties, ctx, false);
    if (ct.choice) collectFromGroup(ct.choice, properties, ctx, true);
    if (ct.all) collectFromGroup(ct.all, properties, ctx, false);
    collectAttributes(ct.attribute, properties, ctx);

    if (ct.mixed) {
      properties.push({
        name: '_text',
        type: 'string',
        hasQuestionToken: true,
      });
    }

    // Handle group reference
    if (ct.group?.ref) {
      const groupName = stripNsPrefix(ct.group.ref);
      const group = ctx.schema.group?.find((g) => g.name === groupName);
      if (group) {
        if (group.sequence)
          collectFromGroup(group.sequence, properties, ctx, false);
        if (group.choice) collectFromGroup(group.choice, properties, ctx, true);
        if (group.all) collectFromGroup(group.all, properties, ctx, false);
      }
    }
  }

  ctx.sourceFile.addInterface({
    name: interfaceName,
    isExported: true,
    extends: extendsTypes.length > 0 ? extendsTypes : undefined,
    properties: properties.map((p) => ({
      name: p.name,
      type: p.type,
      hasQuestionToken: p.hasQuestionToken,
    })),
    docs: ctx.addJsDoc
      ? [{ description: `Generated from complexType: ${name}` }]
      : undefined,
  });
}

interface GroupLike {
  element?: readonly LocalElement[];
  sequence?: readonly ExplicitGroup[];
  choice?: readonly ExplicitGroup[];
  group?: readonly { ref?: string }[];
}

function collectFromGroup(
  group: GroupLike,
  properties: Array<{ name: string; type: string; hasQuestionToken: boolean }>,
  ctx: GeneratorContext,
  forceOptional: boolean
): void {
  for (const el of group.element ?? []) {
    addElementProperty(el, properties, ctx, forceOptional);
  }

  for (const seq of group.sequence ?? []) {
    collectFromGroup(seq, properties, ctx, forceOptional);
  }

  for (const ch of group.choice ?? []) {
    collectFromGroup(ch, properties, ctx, true);
  }

  for (const g of group.group ?? []) {
    if (g.ref) {
      const groupName = stripNsPrefix(g.ref);
      const namedGroup = ctx.schema.group?.find((gr) => gr.name === groupName);
      if (namedGroup) {
        if (namedGroup.sequence)
          collectFromGroup(namedGroup.sequence, properties, ctx, forceOptional);
        if (namedGroup.choice)
          collectFromGroup(namedGroup.choice, properties, ctx, true);
        if (namedGroup.all)
          collectFromGroup(namedGroup.all, properties, ctx, forceOptional);
      }
    }
  }
}

function addElementProperty(
  element: LocalElement,
  properties: Array<{ name: string; type: string; hasQuestionToken: boolean }>,
  ctx: GeneratorContext,
  forceOptional: boolean
): void {
  // Handle element reference
  if (element.ref) {
    const refName = stripNsPrefix(element.ref);
    const refElement = ctx.schema.element?.find((e) => e.name === refName);
    if (refElement) {
      addElementProperty(
        {
          ...refElement,
          minOccurs: element.minOccurs,
          maxOccurs: element.maxOccurs,
        },
        properties,
        ctx,
        forceOptional
      );
    }
    return;
  }

  if (!element.name) return;

  const isArray =
    element.maxOccurs === 'unbounded' ||
    (typeof element.maxOccurs === 'number' && element.maxOccurs > 1);
  const isOptional =
    forceOptional || element.minOccurs === '0' || element.minOccurs === 0;

  let tsType: string;
  if (element.type) {
    tsType = resolveTypeName(element.type, ctx);
  } else if (element.complexType) {
    // Inline complex type - generate anonymous interface
    tsType = 'unknown'; // TODO: could generate inline type
  } else if (element.simpleType?.restriction?.enumeration) {
    tsType = element.simpleType.restriction.enumeration
      .map((e: { value?: string }) => `'${e.value}'`)
      .join(' | ');
  } else if (element.simpleType?.restriction?.base) {
    tsType =
      XSD_BUILT_IN_TYPES[stripNsPrefix(element.simpleType.restriction.base)] ??
      'string';
  } else {
    tsType = 'string';
  }

  if (isArray) {
    tsType = `${tsType}[]`;
  }

  properties.push({
    name: element.name,
    type: tsType,
    hasQuestionToken: isOptional,
  });
}

function collectAttributes(
  attributes: readonly LocalAttribute[] | undefined,
  properties: Array<{ name: string; type: string; hasQuestionToken: boolean }>,
  ctx: GeneratorContext
): void {
  if (!attributes) return;

  for (const attr of attributes) {
    if (attr.ref) {
      // Always use the local name (strip namespace prefix)
      // xml:base -> base, xml:lang -> lang, etc.
      const refName = stripNsPrefix(attr.ref);
      properties.push({
        name: refName,
        type: 'string',
        hasQuestionToken: true,
      });
      continue;
    }

    if (!attr.name) continue;
    if (attr.use === 'prohibited') continue;

    const isOptional = attr.use !== 'required';
    let tsType = 'string';

    if (attr.type) {
      const typeName = stripNsPrefix(attr.type);
      tsType = XSD_BUILT_IN_TYPES[typeName] ?? resolveTypeName(attr.type, ctx);
    }

    properties.push({
      name: attr.name,
      type: tsType,
      hasQuestionToken: isOptional,
    });
  }
}

// =============================================================================
// Internal: Simple Type Generation
// =============================================================================

function generateSimpleType(
  name: string,
  st: TopLevelSimpleType,
  ctx: GeneratorContext
): void {
  const typeName = toInterfaceName(name);
  if (ctx.generatedTypes.has(typeName)) return;
  ctx.generatedTypes.add(typeName);

  let tsType = 'string';

  if (st.restriction?.enumeration && st.restriction.enumeration.length > 0) {
    tsType = st.restriction.enumeration.map((e) => `'${e.value}'`).join(' | ');
  } else if (st.restriction?.base) {
    tsType = XSD_BUILT_IN_TYPES[stripNsPrefix(st.restriction.base)] ?? 'string';
  }

  ctx.sourceFile.addTypeAlias({
    name: typeName,
    isExported: true,
    type: tsType,
    docs: ctx.addJsDoc
      ? [{ description: `Generated from simpleType: ${name}` }]
      : undefined,
  });
}

// =============================================================================
// Internal: Root Type Generation
// =============================================================================

function generateRootType(rootTypeName: string, ctx: GeneratorContext): void {
  // Find the primary root element - prefer elements with inline complexType
  // (like abapGit, abapClass) over abstract elements (Schema) or typed refs (abap)
  const elements = ctx.schema.element ?? [];
  
  // Priority: elements with inline complexType > elements with type ref > others
  const primaryElement = elements.find(el => el.name && el.complexType)
    ?? elements.find(el => el.name && el.type && !el.abstract)
    ?? elements.find(el => el.name && !el.abstract);
  
  if (!primaryElement?.name) return;

  // Determine the type for this element
  let elementType: string;
  if (primaryElement.type) {
    elementType = resolveTypeName(primaryElement.type, ctx);
  } else if (primaryElement.complexType) {
    // For inline complexType, use the generated interface name
    const interfaceName = toInterfaceName(primaryElement.name);
    elementType = ctx.generatedTypes.has(interfaceName) ? interfaceName : 'unknown';
  } else {
    elementType = 'string';
  }

  ctx.sourceFile.addTypeAlias({
    name: rootTypeName,
    isExported: true,
    type: `{ ${primaryElement.name}: ${elementType} }`,
    docs: ctx.addJsDoc ? [{ description: `Root schema type (${primaryElement.name} element)` }] : undefined,
  });
}
