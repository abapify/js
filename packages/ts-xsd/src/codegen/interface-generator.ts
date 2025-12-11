/**
 * Simplified Interface Generator - Uses resolved schemas
 * 
 * This generator works with pre-resolved schemas (via loadSchema with autoResolve: true).
 * Since the schema is already flattened with all types merged and extensions expanded,
 * the generator logic is dramatically simplified:
 * 
 * - No need to traverse $imports
 * - No need to resolve QNames across namespaces
 * - No need to expand extensions manually
 * - All types are local to the single schema
 * 
 * Compare with interface-generator.ts (~2500 lines) vs this (~400 lines)
 */

import { Project, SourceFile, InterfaceDeclarationStructure, PropertySignatureStructure, OptionalKind } from 'ts-morph';
import type { 
  Schema, 
  TopLevelComplexType, 
  TopLevelSimpleType, 
  TopLevelElement,
  LocalElement,
  LocalComplexType,
  LocalAttribute,
  NamedGroup,
  ExplicitGroup,
} from '../xsd/types';

export interface SimpleGeneratorOptions {
  /** Root element name to generate interface for */
  rootElement?: string;
  /** Generate all complex types as separate interfaces */
  generateAllTypes?: boolean;
  /** Add JSDoc comments */
  addJsDoc?: boolean;
  /** 
   * Import path pattern for types from imported schemas.
   * Use {name} for schema name. e.g., './{name}.types'
   * If not provided, inheritance is flattened (all properties copied).
   */
  importPattern?: string;
  /**
   * Generate a root schema type that contains all root elements.
   * The type name will be derived from the schema filename (e.g., PackagesV1Schema).
   * This is useful for typing the result of parse() calls.
   */
  generateRootType?: boolean;
  /**
   * Custom name for the root schema type.
   * If not provided, derived from $filename (e.g., packagesV1.xsd -> PackagesV1Schema).
   */
  rootTypeName?: string;
}

/**
 * Generate TypeScript interfaces from a RESOLVED schema.
 * 
 * The schema should be loaded with `autoResolve: true` to ensure:
 * - All imports/includes are merged
 * - Extensions are expanded
 * - Substitution groups are resolved
 * 
 * @example
 * ```typescript
 * import { loadSchema } from '../xsd/loader';
 * import { generateInterfaces } from './interface-generator';
 * 
 * const schema = loadSchema('main.xsd', { 
 *   basePath: '/path/to/xsd',
 *   autoResolve: true  // Key: pre-resolve the schema
 * });
 * 
 * const code = generateInterfaces(schema, { generateAllTypes: true });
 * ```
 */
export function generateInterfaces(
  schema: Schema,
  options: SimpleGeneratorOptions = {}
): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('generated.ts', '');
  
  const generator = new SimpleInterfaceGenerator(schema, sourceFile, options);
  
  if (options.rootElement) {
    const element = schema.element?.find(el => el.name === options.rootElement);
    if (element?.type) {
      const typeName = stripNsPrefix(element.type);
      generator.generateType(typeName);
    } else if (element?.complexType) {
      generator.generateInlineElement(options.rootElement, element.complexType);
    }
  }
  
  if (options.generateAllTypes) {
    // Generate all elements with inline types
    for (const el of schema.element ?? []) {
      if (el.name && el.complexType) {
        generator.generateInlineElement(el.name, el.complexType);
      }
    }
    
    // Generate all complex types
    for (const ct of schema.complexType ?? []) {
      if (ct.name) {
        generator.generateType(ct.name);
      }
    }
    
    // Generate all simple types (as type aliases)
    for (const st of schema.simpleType ?? []) {
      if (st.name) {
        generator.generateSimpleType(st.name, st);
      }
    }
  }
  
  // Generate root schema type if requested
  if (options.generateRootType) {
    const rootTypeName = options.rootTypeName || deriveRootTypeName(schema.$filename);
    if (rootTypeName) {
      generator.generateRootSchemaType(rootTypeName);
    }
  }
  
  // Reverse the order: root/main types first, nested types after (top-down)
  // Interfaces are generated in dependency order (nested first), so we reverse
  const statements = sourceFile.getStatements();
  // Use getFullText() to include JSDoc comments (leading trivia)
  const textParts = statements.map(stmt => stmt.getFullText().trim());
  const reversedText = textParts.reverse().join('\n\n');
  
  // Clear and rebuild with reversed order
  sourceFile.removeStatements([0, statements.length]);
  sourceFile.addStatements(reversedText);
  
  sourceFile.formatText();
  
  // Prepend import statements if any
  const importStatements = generator.getImportStatements();
  if (importStatements.length > 0) {
    return importStatements.join('\n') + '\n\n' + sourceFile.getFullText();
  }
  
  return sourceFile.getFullText();
}

/** Alias for backward compatibility */
export const generateSimpleInterfaces = generateInterfaces;

/** Alias for SimpleGeneratorOptions */
export type GeneratorOptions = SimpleGeneratorOptions;

/**
 * Simplified interface generator that works with resolved schemas.
 * 
 * Key simplifications vs InterfaceGenerator:
 * - No collectAllImports() - schema is already merged
 * - No findComplexType() across imports - direct lookup
 * - No namespace prefix resolution - types are local
 * - No extension expansion - already done by resolver
 * 
 * With importPattern option:
 * - Tracks which types come from imported schemas
 * - Generates `extends` clauses instead of flattening
 * - Adds import statements for types from other schemas
 */
class SimpleInterfaceGenerator {
  private generatedTypes = new Set<string>();
  
  // Quick lookup maps (built once from the flat schema)
  private complexTypeMap: Map<string, TopLevelComplexType>;
  private simpleTypeMap: Map<string, TopLevelSimpleType>;
  private elementMap: Map<string, TopLevelElement>;
  private groupMap: Map<string, NamedGroup>;
  
  // Track which types come from which imported schema (by $filename)
  private typeToSchemaMap: Map<string, string> = new Map();
  
  // Track imports needed for extends clauses
  private requiredImports: Map<string, Set<string>> = new Map(); // schemaName -> Set<typeName>
  
  // Local types (from the main schema, not imports)
  private localTypes: Set<string>;
  
  constructor(
    private schema: Schema,
    private sourceFile: SourceFile,
    private options: SimpleGeneratorOptions
  ) {
    // Build lookup maps from the flat resolved schema
    // Using type guards to avoid non-null assertions
    this.complexTypeMap = new Map(
      (this.schema.complexType ?? [])
        .filter((ct): ct is TopLevelComplexType & { name: string } => Boolean(ct.name))
        .map(ct => [ct.name, ct])
    );
    this.simpleTypeMap = new Map(
      (this.schema.simpleType ?? [])
        .filter((st): st is TopLevelSimpleType & { name: string } => Boolean(st.name))
        .map(st => [st.name, st])
    );
    
    // Also add simple types from $imports (for resolving imported simple types)
    const addSimpleTypesFromImports = (schemas: readonly Schema[] | undefined): void => {
      if (!schemas) return;
      for (const importedSchema of schemas) {
        for (const st of importedSchema.simpleType ?? []) {
          if (st.name && !this.simpleTypeMap.has(st.name)) {
            this.simpleTypeMap.set(st.name, st);
          }
        }
        // Recursively add from nested imports
        addSimpleTypesFromImports(importedSchema.$imports);
      }
    };
    addSimpleTypesFromImports(this.schema.$imports);
    this.elementMap = new Map(
      (this.schema.element ?? [])
        .filter((el): el is TopLevelElement & { name: string } => Boolean(el.name))
        .map(el => [el.name, el])
    );
    this.groupMap = new Map(
      (this.schema.group ?? [])
        .filter((g): g is NamedGroup & { name: string } => Boolean(g.name))
        .map(g => [g.name, g])
    );
    
    // Track local types (from main schema, before resolution merged imports)
    this.localTypes = new Set<string>();
    
    // If importPattern is provided, build type-to-schema mapping from $imports
    if (options.importPattern && this.schema.$imports) {
      this.buildTypeToSchemaMap(this.schema);
    }
  }
  
  /**
   * Build a map of type names to their source schema filename.
   * This allows us to know which types need to be imported.
   */
  private buildTypeToSchemaMap(schema: Schema): void {
    // First, mark all types in the main schema as local
    for (const ct of schema.complexType ?? []) {
      if (ct.name) this.localTypes.add(ct.name);
    }
    for (const st of schema.simpleType ?? []) {
      if (st.name) this.localTypes.add(st.name);
    }
    
    // Then, map types from imported schemas to their source
    for (const importedSchema of schema.$imports ?? []) {
      const schemaName = this.getSchemaName(importedSchema);
      if (!schemaName) continue;
      
      for (const ct of importedSchema.complexType ?? []) {
        if (ct.name && !this.localTypes.has(ct.name)) {
          this.typeToSchemaMap.set(ct.name, schemaName);
        }
      }
      for (const st of importedSchema.simpleType ?? []) {
        if (st.name && !this.localTypes.has(st.name)) {
          this.typeToSchemaMap.set(st.name, schemaName);
        }
      }
      
      // Recursively process nested imports
      if (importedSchema.$imports) {
        for (const nestedSchema of importedSchema.$imports) {
          this.buildTypeToSchemaMapRecursive(nestedSchema);
        }
      }
    }
  }
  
  private buildTypeToSchemaMapRecursive(importedSchema: Schema): void {
    const schemaName = this.getSchemaName(importedSchema);
    if (!schemaName) return;
    
    for (const ct of importedSchema.complexType ?? []) {
      if (ct.name && !this.localTypes.has(ct.name) && !this.typeToSchemaMap.has(ct.name)) {
        this.typeToSchemaMap.set(ct.name, schemaName);
      }
    }
    for (const st of importedSchema.simpleType ?? []) {
      if (st.name && !this.localTypes.has(st.name) && !this.typeToSchemaMap.has(st.name)) {
        this.typeToSchemaMap.set(st.name, schemaName);
      }
    }
    
    if (importedSchema.$imports) {
      for (const nestedSchema of importedSchema.$imports) {
        this.buildTypeToSchemaMapRecursive(nestedSchema);
      }
    }
  }
  
  private getSchemaName(schema: Schema): string | undefined {
    if (schema.$filename) {
      // Extract name from filename: "adtcore.xsd" -> "adtcore"
      return schema.$filename.replace(/\.xsd$/, '');
    }
    return undefined;
  }
  
  /**
   * Check if a type is from an imported schema (not local).
   */
  private isImportedType(typeName: string): boolean {
    return this.typeToSchemaMap.has(typeName);
  }
  
  
  /**
   * Track that we need to import a type from another schema.
   */
  private trackImport(typeName: string): void {
    const schemaName = this.typeToSchemaMap.get(typeName);
    if (schemaName) {
      let typeSet = this.requiredImports.get(schemaName);
      if (!typeSet) {
        typeSet = new Set();
        this.requiredImports.set(schemaName, typeSet);
      }
      typeSet.add(toInterfaceName(typeName));
    }
  }
  
  /**
   * Get all required imports as import statements.
   */
  getImportStatements(): string[] {
    if (!this.options.importPattern) return [];
    
    const statements: string[] = [];
    for (const [schemaName, types] of this.requiredImports) {
      const importPath = this.options.importPattern.replace('{name}', schemaName);
      const typeList = Array.from(types).sort().join(', ');
      statements.push(`import type { ${typeList} } from '${importPath}';`);
    }
    return statements.sort();
  }
  
  /**
   * Generate interface for a named type.
   * Since schema is resolved, this is a simple direct lookup.
   */
  generateType(typeName: string): string {
    const interfaceName = toInterfaceName(typeName);
    
    if (this.generatedTypes.has(interfaceName)) {
      return interfaceName;
    }
    this.generatedTypes.add(interfaceName);
    
    // Check for simple type first
    const simpleType = this.simpleTypeMap.get(typeName);
    if (simpleType) {
      return this.generateSimpleType(typeName, simpleType);
    }
    
    // Look up complex type - direct map lookup, no import traversal needed!
    const complexType = this.complexTypeMap.get(typeName);
    if (!complexType) {
      // Unknown type - map to primitive or return as-is
      return mapBuiltInType(typeName);
    }
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    let extendsClause: string | undefined;
    
    // Check if this type extends a base type
    if (complexType.complexContent?.extension?.base) {
      const baseName = stripNsPrefix(complexType.complexContent.extension.base);
      
      // If importPattern is set and base type is from an imported schema, use extends
      if (this.options.importPattern && this.isImportedType(baseName)) {
        const baseInterfaceName = toInterfaceName(baseName);
        extendsClause = baseInterfaceName;
        this.trackImport(baseName);
        
        // Only collect extension's own properties (not base type's)
        this.collectExtensionProperties(complexType.complexContent.extension, properties);
        this.collectAttributes(complexType.complexContent.extension.attribute, properties);
      } else {
        // Flatten: collect all properties including base type's
        this.collectProperties(complexType, properties);
        this.collectAttributes(complexType.attribute, properties);
      }
    } else {
      // No extension - collect direct properties
      this.collectProperties(complexType, properties);
      this.collectAttributes(complexType.attribute, properties);
    }
    
    // Handle anyAttribute
    if (complexType.anyAttribute) {
      this.addIndexSignature(properties);
    }
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: interfaceName,
      isExported: true,
      properties,
    };
    
    // Add extends clause if we have a base type from import
    if (extendsClause) {
      interfaceStructure.extends = [extendsClause];
    }
    
    if (this.options.addJsDoc) {
      interfaceStructure.docs = [{ description: `Generated from complexType: ${typeName}` }];
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    return interfaceName;
  }
  
  /**
   * Collect only the extension's own properties (not base type's).
   * Used when generating extends clause.
   */
  private collectExtensionProperties(
    extension: NonNullable<TopLevelComplexType['complexContent']>['extension'],
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    if (!extension) return;
    
    // Collect extension's own elements
    if (extension.sequence) this.collectFromGroup(extension.sequence, properties, false);
    if (extension.choice) this.collectFromGroup(extension.choice, properties, false, true);
    if (extension.all) this.collectFromGroup(extension.all, properties, false);
  }
  
  /**
   * Generate interface for an element with inline complexType.
   */
  generateInlineElement(elementName: string, complexType: LocalComplexType): string {
    const interfaceName = toInterfaceName(elementName);
    
    if (this.generatedTypes.has(interfaceName)) {
      return interfaceName;
    }
    this.generatedTypes.add(interfaceName);
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    
    // Handle mixed content
    if (complexType.mixed) {
      properties.push({
        name: '_text',
        type: 'string',
        hasQuestionToken: true,
      });
    }
    
    this.collectProperties(complexType, properties);
    this.collectAttributes(complexType.attribute, properties);
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: interfaceName,
      isExported: true,
      properties,
    };
    
    if (this.options.addJsDoc) {
      interfaceStructure.docs = [{ description: `Generated from element: ${elementName}` }];
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    return interfaceName;
  }
  
  /**
   * Generate a root schema type as a union of possible root elements.
   * Each XML document has exactly one root element, so we use a discriminated union.
   * 
   * Example output:
   * ```typescript
   * export type PackagesV1Schema = 
   *   | { package: PackageType }
   *   | { packageTree: PackageTreeType };
   * ```
   */
  generateRootSchemaType(typeName: string): void {
    const unionMembers: string[] = [];
    
    // Build a union member for each root element
    for (const el of this.schema.element ?? []) {
      if (!el.name) continue;
      
      let elementType: string;
      if (el.type) {
        const baseTypeName = stripNsPrefix(el.type);
        // Check if it's a built-in XSD type first
        if (isBuiltInType(baseTypeName)) {
          elementType = mapBuiltInType(baseTypeName);
        } else {
          // Element references a named type
          elementType = toInterfaceName(baseTypeName);
        }
      } else if (el.complexType) {
        // Element has inline type - generate it
        elementType = this.generateInlineElement(el.name, el.complexType);
      } else {
        // Simple element without type - default to string
        elementType = 'string';
      }
      
      // Each union member is an object with exactly one property
      unionMembers.push(`{ ${el.name}: ${elementType} }`);
    }
    
    if (unionMembers.length === 0) return;
    
    // Generate type alias with union
    const typeAlias = unionMembers.length === 1
      ? unionMembers[0]  // Single element - no union needed
      : unionMembers.join('\n  | ');
    
    this.sourceFile.addTypeAlias({
      name: typeName,
      isExported: true,
      type: typeAlias,
      docs: this.options.addJsDoc ? [{ description: 'Root schema type - exactly one of these root elements' }] : undefined,
    });
  }
  
  /**
   * Generate type alias for simple type.
   */
  generateSimpleType(typeName: string, simpleType: TopLevelSimpleType): string {
    const aliasName = toInterfaceName(typeName);
    
    if (this.generatedTypes.has(aliasName)) {
      return aliasName;
    }
    this.generatedTypes.add(aliasName);
    
    let tsType = 'string'; // Default
    
    // Handle restriction with enumeration
    if (simpleType.restriction) {
      const restriction = simpleType.restriction;
      
      if (restriction.enumeration && restriction.enumeration.length > 0) {
        // Generate union of literal types
        const literals = restriction.enumeration
          .map(e => `'${e.value}'`)
          .join(' | ');
        tsType = literals;
      } else if (restriction.base) {
        tsType = mapBuiltInType(stripNsPrefix(restriction.base));
      }
    }
    
    // Handle union
    if (simpleType.union?.memberTypes) {
      const members = simpleType.union.memberTypes
        .split(/\s+/)
        .map(m => mapBuiltInType(stripNsPrefix(m)));
      tsType = members.join(' | ');
    }
    
    // Handle list
    if (simpleType.list?.itemType) {
      const itemType = mapBuiltInType(stripNsPrefix(simpleType.list.itemType));
      tsType = `${itemType}[]`;
    }
    
    this.sourceFile.addTypeAlias({
      name: aliasName,
      isExported: true,
      type: tsType,
    });
    
    return aliasName;
  }
  
  /**
   * Collect properties from content model (sequence, choice, all, group ref, complexContent).
   */
  private collectProperties(
    source: TopLevelComplexType | LocalComplexType,
    properties: OptionalKind<PropertySignatureStructure>[],
    visited: Set<string> = new Set()
  ): void {
    // Handle complexContent with extension - inherit from base type and add extension elements
    if (source.complexContent?.extension) {
      const ext = source.complexContent.extension;
      
      // First, collect properties from base type (with cycle detection)
      if (ext.base) {
        const baseName = stripNsPrefix(ext.base);
        
        // Prevent infinite recursion on self-referencing types
        if (!visited.has(baseName)) {
          visited.add(baseName);
          const baseType = this.complexTypeMap.get(baseName);
          if (baseType) {
            this.collectProperties(baseType, properties, visited);
            this.collectAttributes(baseType.attribute, properties);
          }
        }
      }
      
      // Then add extension's own elements
      if (ext.sequence) this.collectFromGroup(ext.sequence, properties, false);
      if (ext.choice) this.collectFromGroup(ext.choice, properties, false, true);
      if (ext.all) this.collectFromGroup(ext.all, properties, false);
      
      // Add extension's attributes
      this.collectAttributes(ext.attribute, properties);
      return;
    }
    
    // Handle complexContent with restriction
    if (source.complexContent?.restriction) {
      const rest = source.complexContent.restriction;
      
      // For restriction, we use the restricted content (not base type)
      if (rest.sequence) this.collectFromGroup(rest.sequence, properties, false);
      if (rest.choice) this.collectFromGroup(rest.choice, properties, false, true);
      if (rest.all) this.collectFromGroup(rest.all, properties, false);
      
      this.collectAttributes(rest.attribute, properties);
      return;
    }
    
    // Handle simpleContent with extension (adds attributes to simple type)
    if (source.simpleContent?.extension) {
      const ext = source.simpleContent.extension;
      // Add _text property for the simple content value
      properties.push({
        name: '_text',
        type: ext.base ? mapBuiltInType(stripNsPrefix(ext.base)) : 'string',
        hasQuestionToken: true,
      });
      this.collectAttributes(ext.attribute, properties);
      return;
    }
    
    // Handle sequence
    if (source.sequence) {
      this.collectFromGroup(source.sequence, properties, false);
    }
    
    // Handle all
    if (source.all) {
      this.collectFromGroup(source.all, properties, false);
    }
    
    // Handle choice - elements are optional
    if (source.choice) {
      const isArray = source.choice.maxOccurs === 'unbounded';
      this.collectFromGroup(source.choice, properties, isArray, true);
    }
    
    // Handle group reference
    if (source.group?.ref) {
      const groupName = stripNsPrefix(source.group.ref);
      const group = this.groupMap.get(groupName);
      if (group) {
        const isArray = source.group.maxOccurs === 'unbounded';
        const isOptional = source.group.minOccurs === '0' || source.group.minOccurs === 0;
        
        // Collect from the group's content
        if (group.sequence) this.collectFromGroup(group.sequence, properties, isArray, isOptional);
        if (group.choice) this.collectFromGroup(group.choice, properties, isArray, true);
        if (group.all) this.collectFromGroup(group.all, properties, isArray, isOptional);
      }
    }
  }
  
  /**
   * Collect properties from a group (sequence/choice/all).
   */
  private collectFromGroup(
    group: ExplicitGroup,
    properties: OptionalKind<PropertySignatureStructure>[],
    forceArray = false,
    forceOptional = false
  ): void {
    // Handle elements
    for (const el of group.element ?? []) {
      this.addElementProperty(el, properties, forceArray, forceOptional);
    }
    
    // Handle nested sequences (array in ExplicitGroup)
    for (const seq of group.sequence ?? []) {
      this.collectFromGroup(seq, properties, forceArray, forceOptional);
    }
    
    // Handle nested choices (array in ExplicitGroup)
    for (const ch of group.choice ?? []) {
      this.collectFromGroup(ch, properties, forceArray, true);
    }
    
    // Note: ExplicitGroup doesn't have nested 'all' - only NamedGroup does
    // All is handled separately in collectProperties
    
    // Handle group references within the group
    for (const g of group.group ?? []) {
      if (g.ref) {
        const groupName = stripNsPrefix(g.ref);
        const namedGroup = this.groupMap.get(groupName);
        if (namedGroup) {
          const isArray = g.maxOccurs === 'unbounded' || forceArray;
          const isOptional = g.minOccurs === '0' || g.minOccurs === 0 || forceOptional;
          
          if (namedGroup.sequence) this.collectFromGroup(namedGroup.sequence, properties, isArray, isOptional);
          if (namedGroup.choice) this.collectFromGroup(namedGroup.choice, properties, isArray, true);
          if (namedGroup.all) this.collectFromGroup(namedGroup.all, properties, isArray, isOptional);
        }
      }
    }
    
    // Handle xs:any
    if (group.any && group.any.length > 0) {
      this.addIndexSignature(properties);
    }
  }
  
  /**
   * Add a property for an element.
   */
  private addElementProperty(
    element: LocalElement,
    properties: OptionalKind<PropertySignatureStructure>[],
    forceArray = false,
    forceOptional = false
  ): void {
    // Handle element reference
    if (element.ref) {
      const refName = stripNsPrefix(element.ref);
      const refElement = this.elementMap.get(refName);
      if (refElement) {
        // Create a merged element with the ref's properties but local occurrence constraints
        const mergedElement: LocalElement = {
          name: refElement.name,
          type: refElement.type,
          complexType: refElement.complexType,
          simpleType: refElement.simpleType,
          minOccurs: element.minOccurs,
          maxOccurs: element.maxOccurs,
        };
        this.addElementProperty(mergedElement, properties, forceArray, forceOptional);
      }
      return;
    }
    
    if (!element.name) return;
    
    // Determine if array
    const isArray = forceArray || 
      element.maxOccurs === 'unbounded' ||
      (typeof element.maxOccurs === 'number' && element.maxOccurs > 1);
    
    // Determine if optional
    const isOptional = forceOptional ||
      element.minOccurs === '0' ||
      element.minOccurs === 0;
    
    // Determine type
    let tsType: string;
    if (element.type) {
      const typeName = stripNsPrefix(element.type);
      if (isBuiltInType(typeName)) {
        tsType = mapBuiltInType(typeName);
      } else {
        // Check if it's a simple type that should resolve to a primitive
        const st = this.simpleTypeMap.get(typeName);
        if (st && st.restriction?.base && !st.restriction.enumeration?.length) {
          const baseName = stripNsPrefix(st.restriction.base);
          if (isBuiltInType(baseName)) {
            tsType = mapBuiltInType(baseName);
          } else {
            tsType = this.generateType(typeName);
          }
        } else if (this.options.importPattern && this.isImportedType(typeName)) {
          // Track import and use the interface name directly (don't generate locally)
          this.trackImport(typeName);
          tsType = toInterfaceName(typeName);
        } else {
          // Generate the referenced type locally
          tsType = this.generateType(typeName);
        }
      }
    } else if (element.complexType) {
      // Inline complex type
      tsType = this.generateInlineElement(element.name + 'Type', element.complexType);
    } else if (element.simpleType) {
      // Inline simple type - use restriction base or string
      const st = element.simpleType;
      if (st.restriction?.base) {
        tsType = mapBuiltInType(stripNsPrefix(st.restriction.base));
      } else {
        tsType = 'string';
      }
    } else {
      tsType = 'unknown';
    }
    
    // Apply array modifier
    if (isArray) {
      tsType = `${tsType}[]`;
    }
    
    // Skip if property already exists (from base type inheritance)
    if (properties.some(p => p.name === element.name)) {
      return;
    }
    
    properties.push({
      name: element.name,
      type: tsType,
      hasQuestionToken: isOptional,
    });
  }
  
  /**
   * Collect attributes.
   */
  private collectAttributes(
    attributes: readonly LocalAttribute[] | undefined,
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    if (!attributes) return;
    
    for (const attr of attributes) {
      // Handle attribute reference
      if (attr.ref) {
        const refName = stripNsPrefix(attr.ref);
        // For xml:lang etc, keep as string
        properties.push({
          name: attr.ref.startsWith('xml:') ? `'${attr.ref}'` : refName,
          type: 'string',
          hasQuestionToken: attr.use !== 'required',
        });
        continue;
      }
      
      if (!attr.name) continue;
      if (attr.use === 'prohibited') continue;
      
      const isOptional = attr.use !== 'required';
      let tsType = 'string';
      
      if (attr.type) {
        const typeName = stripNsPrefix(attr.type);
        if (isBuiltInType(typeName)) {
          tsType = mapBuiltInType(typeName);
        } else {
          // Check if it's a simple type (local or from imports)
          const st = this.simpleTypeMap.get(typeName);
          if (st) {
            // Check if this simple type should be resolved to a primitive
            // (i.e., it's just a restriction on a built-in with no enumerations)
            if (st.restriction?.base && !st.restriction.enumeration?.length) {
              const baseName = stripNsPrefix(st.restriction.base);
              if (isBuiltInType(baseName)) {
                tsType = mapBuiltInType(baseName);
              } else {
                tsType = this.generateSimpleType(typeName, st);
              }
            } else {
              tsType = this.generateSimpleType(typeName, st);
            }
          } else if (this.options.importPattern && this.isImportedType(typeName)) {
            // Track import for complex types from imported schemas
            this.trackImport(typeName);
            tsType = toInterfaceName(typeName);
          } else {
            tsType = toInterfaceName(typeName);
          }
        }
      }
      
      properties.push({
        name: attr.name,
        type: tsType,
        hasQuestionToken: isOptional,
      });
    }
  }
  
  /**
   * Add index signature for xs:any or xs:anyAttribute.
   */
  private addIndexSignature(properties: OptionalKind<PropertySignatureStructure>[]): void {
    const hasIndexSig = properties.some(p => p.name?.startsWith('['));
    if (!hasIndexSig) {
      properties.push({
        name: '[key: string]',
        type: 'unknown',
        hasQuestionToken: false,
      });
    }
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Strip namespace prefix from QName.
 * e.g., "xs:string" -> "string", "adtcore:AdtObject" -> "AdtObject"
 */
function stripNsPrefix(qname: string): string {
  const colonIndex = qname.indexOf(':');
  return colonIndex >= 0 ? qname.slice(colonIndex + 1) : qname;
}

/**
 * Convert type name to PascalCase interface name.
 */
function toInterfaceName(name: string): string {
  // Already PascalCase or has Type suffix
  if (name.endsWith('Type')) return name;
  
  // Convert first char to uppercase
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  
  // Add Type suffix if not present
  return pascal.endsWith('Type') ? pascal : pascal + 'Type';
}

/** Set of all XSD built-in type names */
const XSD_BUILT_IN_TYPES = new Set([
  // String types
  'string', 'normalizedString', 'token', 'language', 'Name', 'NCName',
  'ID', 'IDREF', 'IDREFS', 'ENTITY', 'ENTITIES', 'NMTOKEN', 'NMTOKENS',
  'anyURI', 'QName', 'NOTATION',
  // Numeric types
  'integer', 'int', 'long', 'short', 'byte', 'decimal', 'float', 'double',
  'nonNegativeInteger', 'positiveInteger', 'nonPositiveInteger', 'negativeInteger',
  'unsignedLong', 'unsignedInt', 'unsignedShort', 'unsignedByte',
  // Boolean
  'boolean',
  // Date/time
  'date', 'time', 'dateTime', 'duration', 'gYear', 'gYearMonth', 'gMonth', 'gMonthDay', 'gDay',
  // Binary
  'base64Binary', 'hexBinary',
  // Any
  'anyType', 'anySimpleType',
]);

/**
 * Check if a type name is an XSD built-in type.
 */
function isBuiltInType(typeName: string): boolean {
  return XSD_BUILT_IN_TYPES.has(typeName);
}

/**
 * Map XSD built-in types to TypeScript types.
 */
function mapBuiltInType(typeName: string): string {
  const mapping: Record<string, string> = {
    // String types
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
    
    // Numeric types
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
    
    // Boolean
    boolean: 'boolean',
    
    // Date/time (as string in TS)
    date: 'string',
    time: 'string',
    dateTime: 'string',
    duration: 'string',
    gYear: 'string',
    gYearMonth: 'string',
    gMonth: 'string',
    gMonthDay: 'string',
    gDay: 'string',
    
    // Binary (as string in TS)
    base64Binary: 'string',
    hexBinary: 'string',
    
    // Any
    anyType: 'unknown',
    anySimpleType: 'unknown',
  };
  
  return mapping[typeName] ?? typeName;
}

/**
 * Derive a root type name from a schema filename or name.
 * e.g., "packagesV1.xsd" -> "PackagesV1Schema"
 *       "packagesV1" -> "PackagesV1Schema"
 */
export function deriveRootTypeName(filename: string | undefined): string | undefined {
  if (!filename) return undefined;
  // Remove .xsd extension and path
  const baseName = filename.replace(/\.xsd$/, '').replace(/^.*\//, '');
  // Convert to PascalCase and add Schema suffix
  const pascalCase = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  return `${pascalCase}Schema`;
}
