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
  _schema: Schema,
  options: SimpleGeneratorOptions = {}
): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('generated.ts', '');
  
  const generator = new SimpleInterfaceGenerator(_schema, sourceFile, options);
  
  if (options.rootElement) {
    const element = _schema.element?.find(el => el.name === options.rootElement);
    if (element?.type) {
      const typeName = stripNsPrefix(element.type);
      generator.generateType(typeName);
    } else if (element?.complexType) {
      generator.generateInlineElement(options.rootElement, element.complexType);
    }
  }
  
  if (options.generateAllTypes) {
    // Generate all elements with inline types
    for (const el of _schema.element ?? []) {
      if (el.name && el.complexType) {
        generator.generateInlineElement(el.name, el.complexType);
      }
    }
    
    // Generate all complex types
    for (const ct of _schema.complexType ?? []) {
      if (ct.name) {
        generator.generateType(ct.name);
      }
    }
    
    // Generate all simple types (as type aliases)
    for (const st of _schema.simpleType ?? []) {
      if (st.name) {
        generator.generateSimpleType(st.name, st);
      }
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
 */
class SimpleInterfaceGenerator {
  private generatedTypes = new Set<string>();
  
  // Quick lookup maps (built once from the flat schema)
  private complexTypeMap: Map<string, TopLevelComplexType>;
  private simpleTypeMap: Map<string, TopLevelSimpleType>;
  private elementMap: Map<string, TopLevelElement>;
  private groupMap: Map<string, NamedGroup>;
  
  constructor(
    _schema: Schema,
    private sourceFile: SourceFile,
    private options: SimpleGeneratorOptions
  ) {
    // Build lookup maps from the flat resolved schema
    // Using type guards to avoid non-null assertions
    this.complexTypeMap = new Map(
      (_schema.complexType ?? [])
        .filter((ct): ct is TopLevelComplexType & { name: string } => Boolean(ct.name))
        .map(ct => [ct.name, ct])
    );
    this.simpleTypeMap = new Map(
      (_schema.simpleType ?? [])
        .filter((st): st is TopLevelSimpleType & { name: string } => Boolean(st.name))
        .map(st => [st.name, st])
    );
    this.elementMap = new Map(
      (_schema.element ?? [])
        .filter((el): el is TopLevelElement & { name: string } => Boolean(el.name))
        .map(el => [el.name, el])
    );
    this.groupMap = new Map(
      (_schema.group ?? [])
        .filter((g): g is NamedGroup & { name: string } => Boolean(g.name))
        .map(g => [g.name, g])
    );
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
    
    // Since extensions are already expanded by resolver,
    // we just need to collect direct properties
    this.collectProperties(complexType, properties);
    this.collectAttributes(complexType.attribute, properties);
    
    // Handle anyAttribute
    if (complexType.anyAttribute) {
      this.addIndexSignature(properties);
    }
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: interfaceName,
      isExported: true,
      properties,
    };
    
    if (this.options.addJsDoc) {
      interfaceStructure.docs = [{ description: `Generated from complexType: ${typeName}` }];
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    return interfaceName;
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
        // Generate the referenced type
        tsType = this.generateType(typeName);
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
          // Check if it's a simple type
          const st = this.simpleTypeMap.get(typeName);
          if (st) {
            tsType = this.generateSimpleType(typeName, st);
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
