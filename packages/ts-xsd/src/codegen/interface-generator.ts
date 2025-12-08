/**
 * Interface Generator - Compiles Schema to TypeScript interfaces using ts-morph
 * 
 * This solves the TS2589 "Type instantiation is excessively deep" problem
 * by generating interfaces at build time (JS runtime) instead of relying
 * on TypeScript's compile-time type inference.
 */

import { Project, SourceFile, InterfaceDeclarationStructure, PropertySignatureStructure, OptionalKind } from 'ts-morph';
import type { SchemaLike, ComplexTypeLike, AttributeLike, ElementLike, SimpleTypeLike, GroupLike, GroupRefLike, AnyAttributeLike } from '../infer/types';

/**
 * Type for sources that can contain content model (sequence, choice, all, group)
 * Used by collectProperties methods
 */
type ContentModelSource = {
  readonly sequence?: GroupLike;
  readonly choice?: GroupLike;
  readonly all?: GroupLike;
  readonly group?: GroupRefLike;
  readonly attribute?: readonly AttributeLike[];
  readonly attributeGroup?: readonly unknown[];
  readonly anyAttribute?: AnyAttributeLike;
  readonly base?: string;
};
import {
  findElement as walkerFindElement,
  stripNsPrefix,
} from '../walker';

export interface GeneratorOptions {
  /** Root element name to generate interface for */
  rootElement?: string;
  /** Generate all complex types as separate interfaces */
  generateAllTypes?: boolean;
  /** Add JSDoc comments */
  addJsDoc?: boolean;
}

/**
 * Element to type mapping for substitution groups
 */
export interface SubstitutionElement {
  /** Element name (e.g., 'DD01V', 'VSEOCLASS') */
  elementName: string;
  /** Type name (e.g., 'Dd01vType', 'VseoClassType') */
  typeName: string;
  /** Whether this element is required (based on minOccurs) */
  required: boolean;
}

/**
 * Substitution type alias info
 */
export interface SubstitutionTypeAlias {
  /** Name of the type alias (e.g., 'AbapGitClas') */
  aliasName: string;
  /** Name of the values interface (e.g., 'ClasValuesType') */
  valuesTypeName: string;
  /** The generic type being specialized (e.g., 'AbapGit') */
  genericType: string;
  /** Elements that substitute the abstract element */
  elements: SubstitutionElement[];
  /** The abstract element being substituted (e.g., 'Schema') */
  substitutedElement: string;
}

/**
 * Result of generating interfaces with dependency tracking
 */
export interface GenerateResult {
  /** Generated TypeScript code */
  code: string;
  /** Types defined in this schema (local types) */
  localTypes: string[];
  /** Types imported from other schemas (external dependencies) */
  externalTypes: Map<string, string[]>; // schemaNamespace -> typeNames[]
  /** Substitution type aliases for elements in substitution groups */
  substitutionAliases: SubstitutionTypeAlias[];
}

/**
 * Generate TypeScript interfaces from a Schema
 */
export function generateInterfaces(
  schema: SchemaLike,
  options: GeneratorOptions = {}
): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('generated.ts', '');
  
  const generator = new InterfaceGenerator(schema, sourceFile, options);
  
  if (options.rootElement) {
    const entry = walkerFindElement(options.rootElement, schema);
    const element = entry?.element;
    if (element?.type) {
      const typeName = stripNsPrefix(element.type);
      generator.generateComplexType(typeName);
    } else if (element?.complexType) {
      // Element has inline complexType - generate it with the element name
      generator.generateInlineRootElement(options.rootElement, element.complexType);
    }
  }
  
  if (options.generateAllTypes) {
    // Generate interfaces for all elements with inline complexTypes
    const elements = schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.name && el.complexType) {
          generator.generateInlineRootElement(el.name, el.complexType);
        }
      }
    }
    
    // Generate all complex types
    const complexTypes = getComplexTypes(schema);
    for (const ct of complexTypes) {
      if (ct.name) {
        generator.generateComplexType(ct.name);
      }
    }
    // Generate all simple types
    const simpleTypes = getSimpleTypes(schema);
    for (const st of simpleTypes) {
      if (st.name) {
        generator.generateComplexType(st.name); // Will be handled as simpleType
      }
    }
  }
  
  sourceFile.formatText();
  return sourceFile.getFullText();
}

/**
 * Generate TypeScript interfaces with dependency tracking.
 * 
 * This function generates interfaces for a single schema and tracks:
 * - localTypes: Types defined in this schema
 * - externalTypes: Types imported from other schemas (via $imports)
 * 
 * Use this for generating per-schema type files with proper imports.
 * 
 * @example
 * ```typescript
 * const result = generateInterfacesWithDeps(classesSchema, { generateAllTypes: true });
 * // result.localTypes = ['AbapClass', 'AbapClassInclude', ...]
 * // result.externalTypes = Map { 'http://www.sap.com/adt/oo' => ['AbapOoObject'] }
 * ```
 */
export function generateInterfacesWithDeps(
  schema: SchemaLike,
  options: GeneratorOptions = {}
): GenerateResult {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('generated.ts', '');
  
  const generator = new InterfaceGeneratorWithDeps(schema, sourceFile, options);
  
  if (options.rootElement) {
    const entry = walkerFindElement(options.rootElement, schema);
    const element = entry?.element;
    if (element?.type) {
      const typeName = stripNsPrefix(element.type);
      generator.generateComplexType(typeName);
    } else if (element?.complexType) {
      generator.generateInlineRootElement(options.rootElement, element.complexType);
    }
  }
  
  if (options.generateAllTypes) {
    // Generate interfaces for all elements with inline complexTypes
    const elements = schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.name && el.complexType) {
          generator.generateInlineRootElement(el.name, el.complexType);
        }
      }
    }
    
    // Generate all complex types
    const complexTypes = getComplexTypes(schema);
    for (const ct of complexTypes) {
      if (ct.name) {
        generator.generateComplexType(ct.name);
      }
    }
    // Generate all simple types
    const simpleTypes = getSimpleTypes(schema);
    for (const st of simpleTypes) {
      if (st.name) {
        generator.generateComplexType(st.name);
      }
    }
  }
  
  sourceFile.formatText();
  
  return {
    code: sourceFile.getFullText(),
    localTypes: Array.from(generator.getLocalTypes()),
    externalTypes: generator.getExternalTypes(),
    substitutionAliases: generator.getSubstitutionAliases(),
  };
}

class InterfaceGenerator {
  private generatedTypes: Set<string>;
  private allImports: SchemaLike[];
  
  constructor(
    private schema: SchemaLike,
    private sourceFile: SourceFile,
    private options: GeneratorOptions,
    generatedTypes?: Set<string>,
    allImports?: SchemaLike[]
  ) {
    this.generatedTypes = generatedTypes ?? new Set<string>();
    // Collect all imports from the root schema for cross-reference
    this.allImports = allImports ?? this.collectAllImports(schema);
  }
  
  private collectAllImports(schema: SchemaLike, visited: Set<SchemaLike> = new Set()): SchemaLike[] {
    const result: SchemaLike[] = [];
    
    // Prevent infinite recursion
    if (visited.has(schema)) {
      return result;
    }
    visited.add(schema);
    
    // Collect from $imports (non-W3C extension)
    const imports = schema.$imports;
    if (imports && Array.isArray(imports)) {
      for (const imp of imports as SchemaLike[]) {
        result.push(imp);
        // Recursively collect nested imports
        result.push(...this.collectAllImports(imp, visited));
      }
    }
    
    // Collect from include (W3C standard)
    const includes = schema.include;
    if (includes && Array.isArray(includes)) {
      for (const inc of includes) {
        // include can be a schema object or a reference with schemaLocation
        if (typeof inc === 'object' && inc !== null) {
          // If it's a resolved schema object, add it
          if ('complexType' in inc || 'simpleType' in inc || 'element' in inc) {
            const incSchema = inc as SchemaLike;
            result.push(incSchema);
            // Recursively collect nested imports
            result.push(...this.collectAllImports(incSchema, visited));
          }
        }
      }
    }
    
    return result;
  }
  
  /**
   * Generate interface for an element with inline complexType (like xs:element name="schema")
   */
  generateInlineRootElement(elementName: string, complexType: ComplexTypeLike): string {
    const interfaceName = this.toInterfaceName(elementName);
    
    if (this.generatedTypes.has(elementName)) {
      return interfaceName;
    }
    this.generatedTypes.add(elementName);
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    const extendsTypes: string[] = [];
    
    // Handle complexContent extension
    if (complexType.complexContent?.extension) {
      const ext = complexType.complexContent.extension;
      if (ext.base) {
        const baseName = stripNsPrefix(ext.base);
        const baseInterface = this.resolveType(baseName);
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          extendsTypes.push(baseInterface);
        }
      }
      this.collectProperties(ext, properties);
    }
    // Handle direct content
    else {
      this.collectProperties(complexType, properties);
    }
    
    // Collect attributes from complexType itself
    if (!complexType.complexContent?.extension) {
      this.collectAttributes(complexType.attribute, properties, complexType.anyAttribute);
    }
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: interfaceName,
      isExported: true,
      properties,
    };
    
    if (extendsTypes.length > 0) {
      interfaceStructure.extends = extendsTypes;
    }
    
    if (this.options.addJsDoc) {
      interfaceStructure.docs = [{ description: `Generated from element: ${elementName}` }];
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    return interfaceName;
  }
  
  generateComplexType(typeName: string): string {
    const interfaceName = this.toInterfaceName(typeName);
    if (this.generatedTypes.has(interfaceName)) {
      return interfaceName;
    }
    this.generatedTypes.add(interfaceName);
    
    // Check for simpleType first (enums, restrictions)
    const simpleType = this.findSimpleType(typeName);
    if (simpleType) {
      return this.generateSimpleType(typeName, simpleType);
    }
    
    const complexType = this.findComplexType(typeName);
    if (!complexType) {
      return this.mapSimpleType(typeName);
    }
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    const extendsTypes: string[] = [];
    
    // Handle complexContent extension (inheritance)
    if (complexType.complexContent?.extension) {
      const ext = complexType.complexContent.extension;
      if (ext.base) {
        const baseName = stripNsPrefix(ext.base);
        const baseInterface = this.resolveType(baseName);
        // Don't extend primitive types like 'unknown'
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          extendsTypes.push(baseInterface);
        }
      }
      this.collectProperties(ext, properties);
    }
    // Handle complexContent restriction
    else if (complexType.complexContent?.restriction) {
      const rest = complexType.complexContent.restriction;
      this.collectPropertiesFromRestriction(rest, properties);
      
      if (rest.base) {
        const baseName = stripNsPrefix(rest.base);
        const baseInterface = this.resolveType(baseName);
        // Don't extend primitive types
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          // Get property names that are being redefined in this restriction
          const redefinedProps = properties.map(p => p.name).filter(Boolean);
          if (redefinedProps.length > 0) {
            // Use Omit to exclude redefined properties from base type
            extendsTypes.push(`Omit<${baseInterface}, ${redefinedProps.map(p => `'${p}'`).join(' | ')}>`);
          } else {
            extendsTypes.push(baseInterface);
          }
        }
      }
    }
    // Handle simpleContent extension (text content with attributes)
    else if (complexType.simpleContent?.extension) {
      const ext = complexType.simpleContent.extension;
      // Add $value property for text content
      if (ext.base) {
        const baseType = this.mapSimpleType(stripNsPrefix(ext.base));
        properties.push({
          name: '$value',
          type: baseType,
          hasQuestionToken: false,
        });
      }
      // Collect attributes from simpleContent extension
      this.collectAttributes(ext.attribute, properties);
    }
    // Handle direct content (no complexContent/simpleContent)
    else {
      this.collectProperties(complexType, properties);
    }
    
    // Collect attributes from complexType itself (for non-extension types)
    if (!complexType.complexContent?.extension && !complexType.simpleContent?.extension) {
      this.collectAttributes(complexType.attribute, properties, complexType.anyAttribute);
    }
    
    // Build interface structure
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: interfaceName,
      isExported: true,
      extends: extendsTypes.length > 0 ? extendsTypes : undefined,
      properties,
    };
    
    // Add JSDoc if requested
    if (this.options.addJsDoc) {
      interfaceStructure.docs = [{ description: `Generated from complexType: ${typeName}` }];
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    return interfaceName;
  }
  
  private collectProperties(
    source: ComplexTypeLike | ContentModelSource,
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    if (source.sequence) this.collectFromGroup(source.sequence, properties, false, false);
    if (source.all) this.collectFromGroup(source.all, properties, false, false);
    
    // Choice elements are always optional (only one is selected)
    // But if choice has maxOccurs="unbounded", elements should be arrays
    if (source.choice) {
      const choice = source.choice;
      const choiceIsArray = choice.maxOccurs === 'unbounded' || 
                           (typeof choice.maxOccurs === 'string' && choice.maxOccurs !== '1' && choice.maxOccurs !== '0') ||
                           (typeof choice.maxOccurs === 'number' && choice.maxOccurs > 1);
      this.collectFromGroup(choice, properties, choiceIsArray, true);
    }
    
    // Handle group reference
    const groupRef = source.group;
    if (groupRef?.ref) {
      // Check if the group reference has maxOccurs="unbounded"
      const groupIsArray = groupRef.maxOccurs === 'unbounded' || 
                          (typeof groupRef.maxOccurs === 'string' && groupRef.maxOccurs !== '1' && groupRef.maxOccurs !== '0') ||
                          (typeof groupRef.maxOccurs === 'number' && groupRef.maxOccurs > 1);
      // Check if the group reference has minOccurs="0"
      const groupIsOptional = groupRef.minOccurs === '0' || groupRef.minOccurs === 0;
      this.collectFromGroupRef(groupRef.ref, properties, groupIsArray, groupIsOptional);
    }
    
    // Only collect attributes from extension source (not from complexType - that's done separately)
    if (source.attribute && 'base' in source) {
      this.collectAttributes(source.attribute, properties);
    }
    
    // Handle attributeGroup references
    if (source.attributeGroup) {
      for (const ag of source.attributeGroup) {
        const agRef = ag as { ref?: string };
        if (agRef.ref) {
          this.collectFromAttributeGroupRef(agRef.ref, properties);
        }
      }
    }
  }
  
  /**
   * Collect properties from a restriction - handles attributes differently
   * In restrictions, attributes with use="prohibited" should be skipped,
   * and attributes without a type are just modifying parent's attribute
   */
  private collectPropertiesFromRestriction(
    source: ContentModelSource,
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    if (source.sequence) this.collectFromGroup(source.sequence, properties);
    if (source.all) this.collectFromGroup(source.all, properties);
    if (source.choice) this.collectFromGroup(source.choice, properties);
    
    // Handle group reference
    const groupRef = source.group;
    if (groupRef?.ref) {
      this.collectFromGroupRef(groupRef.ref, properties);
    }
    
    // Collect attributes with restriction semantics
    // Also handle anyAttribute for index signature
    if (source.attribute) {
      this.collectAttributes(source.attribute, properties, source.anyAttribute, true);
    } else if (source.anyAttribute) {
      // No attributes but has anyAttribute - add index signature
      this.collectAttributes(undefined, properties, source.anyAttribute, true);
    }
    
    // Handle attributeGroup references
    if (source.attributeGroup) {
      for (const ag of source.attributeGroup) {
        const agRef = ag as { ref?: string };
        if (agRef.ref) {
          this.collectFromAttributeGroupRef(agRef.ref, properties);
        }
      }
    }
  }
  
  private collectFromGroupRef(ref: string, properties: OptionalKind<PropertySignatureStructure>[], forceArray = false, forceOptional = false): void {
    const groupName = stripNsPrefix(ref);
    const { group, isChoice } = this.findGroupWithMeta(groupName);
    if (group) {
      // If the group's direct content is a choice, elements are optional
      this.collectFromGroup(group, properties, forceArray, forceOptional || isChoice);
    }
  }
  
  private collectFromAttributeGroupRef(ref: string, properties: OptionalKind<PropertySignatureStructure>[]): void {
    const groupName = stripNsPrefix(ref);
    const attrGroup = this.findAttributeGroup(groupName);
    if (attrGroup?.attribute) {
      this.collectAttributes(attrGroup.attribute as readonly AttributeLike[], properties);
    }
  }
  
  private collectFromGroup(
    group: GroupLike,
    properties: OptionalKind<PropertySignatureStructure>[],
    forceArray = false,
    forceOptional = false
  ): void {
    // Handle any wildcard
    if (group.any && group.any.length > 0) {
      // xs:any allows any element - represent as index signature
      // Only add if not already present
      const hasIndexSig = properties.some(p => p.name?.startsWith('['));
      if (!hasIndexSig) {
        properties.push({
          name: '[key: string]',
          type: 'unknown',
          hasQuestionToken: false,
        });
      }
    }
    
    // Handle nested group references within the group
    if (group.group) {
      for (const g of group.group) {
        if (g.ref) {
          // Check if the group reference has maxOccurs="unbounded"
          const groupIsArray = g.maxOccurs === 'unbounded' || 
                              (typeof g.maxOccurs === 'string' && g.maxOccurs !== '1' && g.maxOccurs !== '0') ||
                              (typeof g.maxOccurs === 'number' && g.maxOccurs > 1);
          // Check if the group reference has minOccurs="0"
          const groupIsOptional = g.minOccurs === '0' || g.minOccurs === 0;
          this.collectFromGroupRef(g.ref, properties, forceArray || groupIsArray, forceOptional || groupIsOptional);
        }
      }
    }
    
    // Handle nested sequence within the group
    if (group.sequence) {
      for (const seq of group.sequence) {
        // Check if the nested sequence has maxOccurs="unbounded"
        const seqIsArray = seq.maxOccurs === 'unbounded' || 
                          (typeof seq.maxOccurs === 'string' && seq.maxOccurs !== '1' && seq.maxOccurs !== '0') ||
                          (typeof seq.maxOccurs === 'number' && seq.maxOccurs > 1);
        // Check if the nested sequence has minOccurs="0"
        const seqIsOptional = seq.minOccurs === '0' || seq.minOccurs === 0;
        this.collectFromGroup(seq, properties, forceArray || seqIsArray, forceOptional || seqIsOptional);
      }
    }
    
    // Handle nested choice within the group - choices are always optional (only one is selected)
    if (group.choice) {
      for (const ch of group.choice) {
        // Check if the choice has maxOccurs="unbounded" for array typing
        const choiceIsArray = ch.maxOccurs === 'unbounded' || 
                             (typeof ch.maxOccurs === 'string' && ch.maxOccurs !== '1' && ch.maxOccurs !== '0') ||
                             (typeof ch.maxOccurs === 'number' && ch.maxOccurs > 1);
        // Check if the choice has minOccurs="0" for optionality
        const choiceIsOptional = ch.minOccurs === '0' || ch.minOccurs === 0;
        this.collectFromGroup(ch, properties, forceArray || choiceIsArray, forceOptional || choiceIsOptional || true);
      }
    }
    
    const elements = group.element;
    if (!elements) return;
    
    for (const el of elements) {
      // Handle element reference (ref="xs:include")
      if (el.ref) {
        const refName = stripNsPrefix(el.ref);
        const refElement = this.findElement(refName);
        
        // Use minOccurs/maxOccurs from the reference, not the target element
        // Also consider forceArray/forceOptional from parent group
        const isOptional = forceOptional || el.minOccurs === '0' || el.minOccurs === 0;
        const isArray = forceArray || el.maxOccurs === 'unbounded' || 
                        (typeof el.maxOccurs === 'string' && el.maxOccurs !== '1' && el.maxOccurs !== '0') ||
                        (typeof el.maxOccurs === 'number' && el.maxOccurs > 1);
        
        let typeName: string;
        if (refElement?.type) {
          typeName = this.resolveType(stripNsPrefix(refElement.type));
        } else if (refElement?.complexType) {
          typeName = this.generateInlineComplexType(refName, refElement.complexType);
        } else if (refElement && this.isAbstractElement(refElement)) {
          // Abstract element - find all substitutes and create union type
          const substitutes = this.findSubstitutes(refName);
          if (substitutes.length > 0) {
            const substituteTypes = substitutes.map(sub => {
              if (sub.type) {
                return this.resolveType(stripNsPrefix(sub.type));
              } else if (sub.complexType) {
                return sub.name ? this.generateInlineComplexType(sub.name, sub.complexType) : 'unknown';
              }
              return sub.name ? this.toInterfaceName(sub.name) : 'unknown';
            });
            typeName = substituteTypes.join(' | ');
          } else {
            // No substitutes found - use unknown
            typeName = 'unknown';
          }
        } else {
          // Element exists but has no type - use the element name as type
          typeName = this.toInterfaceName(refName);
        }
        
        if (isArray) {
          // Only wrap in parentheses if it's a union type (contains |)
          typeName = typeName.includes(' | ') ? `(${typeName})[]` : `${typeName}[]`;
        }
        
        // Skip if property already exists (deduplication)
        if (!properties.some(p => p.name === refName)) {
          properties.push({
            name: refName,
            type: typeName,
            hasQuestionToken: isOptional,
          });
        }
        continue;
      }
      
      if (!el.name) continue;
      
      const isOptional = forceOptional || el.minOccurs === '0' || el.minOccurs === 0;
      const isArray = forceArray || el.maxOccurs === 'unbounded' || 
                      (typeof el.maxOccurs === 'string' && el.maxOccurs !== '1' && el.maxOccurs !== '0') ||
                      (typeof el.maxOccurs === 'number' && el.maxOccurs > 1);
      
      let typeName: string;
      if (el.type) {
        const rawType = el.type;
        const baseType = stripNsPrefix(rawType);
        // Check for xsd:/xs: prefix types first (built-in XSD types)
        if (rawType.startsWith('xsd:') || rawType.startsWith('xs:')) {
          // Check if it's a built-in XSD type
          if (this.isBuiltInXsdType(baseType)) {
            typeName = this.mapSimpleType(baseType);
          } else {
            // It's a custom type defined in the schema (like xs:localSimpleType)
            typeName = this.resolveType(baseType);
          }
        } else {
          typeName = this.resolveType(baseType);
        }
      } else if (el.complexType) {
        typeName = this.generateInlineComplexType(el.name, el.complexType);
      } else {
        typeName = 'unknown';
      }
      
      if (isArray) {
        typeName = `${typeName}[]`;
      }
      
      // Skip if property already exists (deduplication)
      if (!properties.some(p => p.name === el.name)) {
        properties.push({
          name: el.name,
          type: typeName,
          hasQuestionToken: isOptional,
        });
      }
    }
  }
  
  private findElement(name: string): ElementLike | undefined {
    // Use walker's findElement which handles $imports traversal
    const entry = walkerFindElement(name, this.schema);
    return entry?.element;
  }
  
  /**
   * Find all elements that substitute for a given abstract element.
   * This handles XSD substitution groups where concrete elements can
   * substitute for an abstract element.
   */
  private findSubstitutes(abstractElementName: string): ElementLike[] {
    const substitutes: ElementLike[] = [];
    
    // Search in current schema
    const elements = this.schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.substitutionGroup) {
          const subGroupName = stripNsPrefix(el.substitutionGroup);
          if (subGroupName === abstractElementName) {
            substitutes.push(el);
          }
        }
      }
    }
    
    // Search in all imports
    for (const imported of this.allImports) {
      const importedElements = imported.element;
      if (importedElements && Array.isArray(importedElements)) {
        for (const el of importedElements) {
          const subGroup = el.substitutionGroup;
          if (subGroup) {
            const subGroupName = stripNsPrefix(subGroup);
            if (subGroupName === abstractElementName) {
              substitutes.push(el);
            }
          }
        }
      }
    }
    
    return substitutes;
  }
  
  /**
   * Check if an element is abstract
   */
  private isAbstractElement(element: ElementLike): boolean {
    return element.abstract === true;
  }
  
  private collectAttributes(
    attributes: readonly AttributeLike[] | undefined,
    properties: OptionalKind<PropertySignatureStructure>[],
    anyAttribute?: unknown,
    isRestriction = false
  ): void {
    if (attributes) {
      for (const attr of attributes) {
        // Handle attribute reference (ref="atcfinding:location" -> "location")
        if (attr.ref) {
          const refName = attr.ref;
          // Strip namespace prefix - the ref points to a global attribute by name
          // e.g., ref="atcfinding:location" -> property name is "location"
          // Exception: xml:lang and xml:base are special XML attributes that keep the prefix
          const isXmlNamespace = refName.startsWith('xml:');
          const propName = isXmlNamespace 
            ? `'${refName}'`  // Keep xml:lang, xml:base as quoted properties
            : stripNsPrefix(refName);  // Strip other namespace prefixes
          const isOptional = attr.use !== 'required';
          properties.push({
            name: propName,
            type: 'string',
            hasQuestionToken: isOptional,
          });
          continue;
        }
        
        if (!attr.name) continue;
        
        // In restrictions, use="prohibited" means skip this attribute
        if (attr.use === 'prohibited') continue;
        
        // In restrictions, attributes without a type are just modifying parent's attribute
        // Skip them to avoid type conflicts
        if (isRestriction && !attr.type) continue;
        
        const isOptional = attr.use !== 'required';
        let typeName: string;
        if (attr.type) {
          const rawType = attr.type;
          const baseType = stripNsPrefix(rawType);
          // Check for xsd:/xs: prefix types first (built-in XSD types)
          if (rawType.startsWith('xsd:') || rawType.startsWith('xs:')) {
            // Check if it's a built-in XSD type
            if (this.isBuiltInXsdType(baseType)) {
              typeName = this.mapSimpleType(baseType);
            } else {
              // It's a custom type defined in the schema
              typeName = this.resolveType(baseType);
            }
          } else {
            // Resolve custom types (will PascalCase them)
            typeName = this.resolveType(baseType);
          }
        } else {
          // No type specified = xs:anySimpleType, use unknown to allow narrowing in restrictions
          typeName = 'unknown';
        }
        
        properties.push({
          name: attr.name,
          type: typeName,
          hasQuestionToken: isOptional,
        });
      }
    }
    
    // Handle anyAttribute - allows any attribute
    // Only add if no index signature already present
    if (anyAttribute) {
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
  
  private generateInlineComplexType(parentName: string, ct: ComplexTypeLike): string {
    const baseName = this.toInterfaceName(parentName);
    // Don't add Type suffix if name already ends with Type
    const interfaceName = baseName.endsWith('Type') ? baseName : baseName + 'Type';
    
    // Check if already generated (deduplication)
    if (this.generatedTypes.has(interfaceName)) {
      return interfaceName;
    }
    this.generatedTypes.add(interfaceName);
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    const extendsTypes: string[] = [];
    
    // Handle mixed content - add _text property
    if (ct.mixed === true) {
      properties.push({
        name: '_text',
        type: 'string',
        hasQuestionToken: true,
      });
    }
    
    // Handle complexContent extension
    if (ct.complexContent?.extension) {
      const ext = ct.complexContent.extension;
      if (ext.base) {
        const baseName = stripNsPrefix(ext.base);
        const baseInterface = this.resolveType(baseName);
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          extendsTypes.push(baseInterface);
        }
      }
      this.collectProperties(ext, properties);
    } else {
      this.collectProperties(ct, properties);
      this.collectAttributes(ct.attribute, properties);
    }
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: interfaceName,
      isExported: true,
      properties,
    };
    
    if (extendsTypes.length > 0) {
      interfaceStructure.extends = extendsTypes;
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    
    return interfaceName;
  }
  
  private resolveType(typeName: string): string {
    const builtIn = this.mapSimpleType(typeName);
    if (builtIn !== typeName) {
      return builtIn;
    }
    
    // Check for simpleType first
    const st = this.findSimpleType(typeName);
    if (st) {
      return this.generateSimpleType(typeName, st);
    }
    
    const ct = this.findComplexType(typeName);
    if (ct) {
      return this.generateComplexType(typeName);
    }
    
    // Check in all imports (from root schema)
    for (const imported of this.allImports) {
      // Check for simpleType in imports first
      const importedSt = findSimpleTypeInSchema(imported, typeName);
      if (importedSt) {
        // Create generator for imported schema, sharing sourceFile, generatedTypes, and allImports
        const importedGenerator = new InterfaceGenerator(
          imported,
          this.sourceFile,
          this.options,
          this.generatedTypes,
          this.allImports
        );
        return importedGenerator.generateSimpleType(typeName, importedSt);
      }
      
      // Check for complexType in imports
      const importedCt = findComplexTypeInSchema(imported, typeName);
      if (importedCt) {
        // Create generator for imported schema, sharing sourceFile, generatedTypes, and allImports
        const importedGenerator = new InterfaceGenerator(
          imported,
          this.sourceFile,
          this.options,
          this.generatedTypes,
          this.allImports  // Pass all imports so nested schemas can resolve cross-references
        );
        return importedGenerator.generateComplexType(typeName);
      }
    }
    
    // For unknown types, still PascalCase them (they might be forward references)
    return this.toInterfaceName(typeName);
  }
  
  private findComplexType(name: string): ComplexTypeLike | undefined {
    return findComplexTypeInSchema(this.schema, name);
  }
  
  private findSimpleType(name: string): SimpleTypeLike | undefined {
    return findSimpleTypeInSchema(this.schema, name);
  }
  
  private findGroupWithMeta(name: string): { group: { element?: readonly ElementLike[] } | undefined; isChoice: boolean } {
    // Search in current schema
    const groups = this.schema.group;
    if (groups && Array.isArray(groups)) {
      const found = groups.find((g) => g.name === name);
      if (found) {
        // Group can have sequence/choice/all containing elements
        const isChoice = !!found.choice && !found.sequence && !found.all;
        const content = found.sequence || found.choice || found.all || found;
        return { group: content, isChoice };
      }
    }
    // Search in imports
    for (const imported of this.allImports) {
      const importedGroups = imported.group;
      if (importedGroups && Array.isArray(importedGroups)) {
        const found = importedGroups.find((g) => g.name === name);
        if (found) {
          const isChoice = !!found.choice && !found.sequence && !found.all;
          const content = found.sequence || found.choice || found.all || found;
          return { group: content, isChoice };
        }
      }
    }
    return { group: undefined, isChoice: false };
  }
  
  private findAttributeGroup(name: string): { attribute?: readonly AttributeLike[] } | undefined {
    // Search in current schema
    const groups = this.schema.attributeGroup;
    if (groups && Array.isArray(groups)) {
      const found = groups.find((g) => g.name === name);
      if (found) return found;
    }
    // Search in imports
    for (const imported of this.allImports) {
      const importedGroups = imported.attributeGroup;
      if (importedGroups && Array.isArray(importedGroups)) {
        const found = importedGroups.find((g) => g.name === name);
        if (found) return found;
      }
    }
    return undefined;
  }
  
  /**
   * Generate type alias for simpleType (enums, restrictions, unions)
   */
  private generateSimpleType(typeName: string, st: SimpleTypeLike): string {
    const aliasName = this.toInterfaceName(typeName);
    
    // Check if already generated
    if (this.generatedTypes.has(typeName)) {
      return aliasName;
    }
    this.generatedTypes.add(typeName);
    
    // Handle enumeration restriction
    if (st.restriction?.enumeration && st.restriction.enumeration.length > 0) {
      const enumValues = st.restriction.enumeration
        .map(e => `'${e.value}'`)
        .join(' | ');
      
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: enumValues,
      });
      return aliasName;
    }
    
    // Handle union types
    if (st.union) {
      const memberTypes = st.union.memberTypes?.split(/\s+/) ?? [];
      if (memberTypes.length > 0) {
        const unionTypes = memberTypes
          .map(t => {
            const baseType = stripNsPrefix(t);
            const mapped = this.mapSimpleType(baseType);
            // If it's a built-in type, use the mapped value; otherwise resolve/generate it
            if (mapped !== baseType) {
              return mapped;
            }
            // Try to generate the member type first
            return this.resolveType(baseType);
          })
          .join(' | ');
        
        this.sourceFile.addTypeAlias({
          name: aliasName,
          isExported: true,
          type: unionTypes || 'string',
        });
        return aliasName;
      }
      // Union with inline simpleTypes - fall back to string
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: 'string',
      });
      return aliasName;
    }
    
    // Handle list types
    if (st.list) {
      const itemType = st.list.itemType 
        ? this.mapSimpleType(stripNsPrefix(st.list.itemType))
        : 'string';
      
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: `${itemType}[]`,
      });
      return aliasName;
    }
    
    // Handle restriction with base type (no enum)
    if (st.restriction?.base) {
      const baseType = this.mapSimpleType(stripNsPrefix(st.restriction.base));
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: baseType,
      });
      return aliasName;
    }
    
    // Fallback to string
    return 'string';
  }
  
  private isBuiltInXsdType(typeName: string): boolean {
    const builtInTypes = new Set([
      'string', 'boolean', 'int', 'integer', 'long', 'short', 'decimal', 'float', 'double',
      'byte', 'unsignedInt', 'unsignedLong', 'unsignedShort', 'unsignedByte',
      'positiveInteger', 'negativeInteger', 'nonPositiveInteger', 'nonNegativeInteger',
      'date', 'dateTime', 'time', 'duration', 'anyURI', 'base64Binary', 'hexBinary',
      'QName', 'token', 'language', 'Name', 'NCName', 'ID', 'IDREF', 'NMTOKEN',
      'normalizedString', 'anyType', 'anySimpleType'
    ]);
    return builtInTypes.has(typeName);
  }
  
  private mapSimpleType(typeName: string): string {
    const mapping: Record<string, string> = {
      'string': 'string',
      'boolean': 'boolean',
      'int': 'number',
      'integer': 'number',
      'long': 'number',
      'short': 'number',
      'decimal': 'number',
      'float': 'number',
      'double': 'number',
      'byte': 'number',
      'unsignedInt': 'number',
      'unsignedLong': 'number',
      'unsignedShort': 'number',
      'unsignedByte': 'number',
      'positiveInteger': 'number',
      'negativeInteger': 'number',
      'nonPositiveInteger': 'number',
      'nonNegativeInteger': 'number',
      'date': 'string',
      'dateTime': 'string',
      'time': 'string',
      'duration': 'string',
      'anyURI': 'string',
      'base64Binary': 'string',
      'hexBinary': 'string',
      'QName': 'string',
      'token': 'string',
      'language': 'string',
      'Name': 'string',
      'NCName': 'string',
      'ID': 'string',
      'IDREF': 'string',
      'NMTOKEN': 'string',
      'normalizedString': 'string',
      'anyType': 'unknown',
      'anySimpleType': 'unknown',
    };
    return mapping[typeName] ?? typeName;
  }
  
  private toInterfaceName(typeName: string): string {
    // PascalCase the type name
    return typeName.charAt(0).toUpperCase() + typeName.slice(1);
  }
}

// Helper functions - using walker for findElement and stripNsPrefix

function getComplexTypes(schema: SchemaLike): ComplexTypeLike[] {
  const ct = schema.complexType;
  if (!ct) return [];
  if (Array.isArray(ct)) return ct as ComplexTypeLike[];
  return Object.values(ct) as ComplexTypeLike[];
}

function findComplexTypeInSchema(schema: SchemaLike, name: string): ComplexTypeLike | undefined {
  const types = getComplexTypes(schema);
  return types.find((ct: ComplexTypeLike) => ct.name === name);
}

function getSimpleTypes(schema: SchemaLike): SimpleTypeLike[] {
  const st = schema.simpleType;
  if (!st) return [];
  if (Array.isArray(st)) return st as SimpleTypeLike[];
  return Object.values(st) as SimpleTypeLike[];
}

function findSimpleTypeInSchema(schema: SchemaLike, name: string): SimpleTypeLike | undefined {
  const types = getSimpleTypes(schema);
  return types.find((st: SimpleTypeLike) => st.name === name);
}

/**
 * Extended InterfaceGenerator that tracks local vs external types.
 * 
 * This generator only generates types defined in the current schema (localTypes),
 * and tracks references to types from imported schemas (externalTypes).
 */
class InterfaceGeneratorWithDeps {
  private generatedTypes: Set<string>;
  private localTypes: Set<string>;
  private externalTypes: Map<string, string[]>; // namespace -> typeNames[]
  private allImports: SchemaLike[];
  /** Types that need a generic parameter due to abstract element references */
  private genericTypes: Set<string>;
  /** Map from type name to the property that uses the generic */
  private genericPropertyMap: Map<string, string>;
  
  constructor(
    private schema: SchemaLike,
    private sourceFile: SourceFile,
    private options: GeneratorOptions,
  ) {
    this.generatedTypes = new Set<string>();
    this.localTypes = new Set<string>();
    this.externalTypes = new Map<string, string[]>();
    this.allImports = this.collectAllImports(schema);
    this.genericTypes = new Set<string>();
    this.genericPropertyMap = new Map<string, string>();
    
    // Pre-scan to identify types that need generics
    this.scanForAbstractElements();
  }
  
  /**
   * Pre-scan schema to identify types that reference abstract elements.
   * These types will need generic type parameters.
   */
  private scanForAbstractElements(): void {
    // Find all abstract elements in this schema and imports
    const abstractElements = new Set<string>();
    
    const scanSchemaForAbstract = (schema: SchemaLike) => {
      const elements = schema.element;
      if (elements && Array.isArray(elements)) {
        for (const el of elements) {
          if (el.abstract === true && el.name) {
            abstractElements.add(el.name);
          }
        }
      }
    };
    
    scanSchemaForAbstract(this.schema);
    for (const imported of this.allImports) {
      scanSchemaForAbstract(imported);
    }
    
    if (abstractElements.size === 0) return;
    
    // Now scan complexTypes to find which ones reference abstract elements
    const scanComplexType = (typeName: string, ct: ComplexTypeLike) => {
      const checkGroup = (group: GroupLike | undefined) => {
        if (!group?.element) return;
        for (const el of group.element) {
          if (el.ref) {
            const refName = stripNsPrefix(el.ref);
            if (abstractElements.has(refName)) {
              // This type references an abstract element - needs generic
              this.genericTypes.add(typeName);
              this.genericPropertyMap.set(typeName, refName);
              return;
            }
          }
        }
        // Check nested groups
        if (group.sequence) {
          const seqs = Array.isArray(group.sequence) ? group.sequence : [group.sequence];
          for (const seq of seqs) checkGroup(seq);
        }
        if (group.choice) {
          const choices = Array.isArray(group.choice) ? group.choice : [group.choice];
          for (const ch of choices) checkGroup(ch);
        }
      };
      
      checkGroup(ct.sequence);
      checkGroup(ct.choice);
      checkGroup(ct.all);
      if (ct.complexContent?.extension) {
        checkGroup(ct.complexContent.extension.sequence);
        checkGroup(ct.complexContent.extension.choice);
      }
    };
    
    // Scan all complex types in current schema
    const complexTypes = getComplexTypes(this.schema);
    for (const ct of complexTypes) {
      if (ct.name) {
        scanComplexType(ct.name, ct);
      }
    }
    
    // Also scan elements with inline complexTypes in current schema
    const elements = this.schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.name && el.complexType) {
          scanComplexType(el.name, el.complexType);
        }
      }
    }
    
    // IMPORTANT: Also scan imported schemas' types to mark them as needing generics
    // This is needed so that when we propagate, we know which imported types need generics
    for (const imported of this.allImports) {
      const importedComplexTypes = getComplexTypes(imported);
      for (const ct of importedComplexTypes) {
        if (ct.name) {
          scanComplexType(ct.name, ct);
        }
      }
      
      const importedElements = imported.element;
      if (importedElements && Array.isArray(importedElements)) {
        for (const el of importedElements) {
          if (el.name && el.complexType) {
            scanComplexType(el.name, el.complexType);
          }
        }
      }
    }
    
    // Propagate generics: if type A uses type B which has a generic, A also needs generic
    this.propagateGenerics();
  }
  
  /**
   * Propagate generic requirements through type hierarchy.
   * If type A has a property of type B, and B needs a generic, then A also needs a generic.
   */
  private propagateGenerics(): void {
    // Build a map of type dependencies
    const typeDeps = new Map<string, Set<string>>();
    
    // Helper to resolve element ref to its type
    const resolveElementType = (refName: string): string | undefined => {
      // Search in current schema
      const elements = this.schema.element;
      if (elements && Array.isArray(elements)) {
        const found = elements.find(e => e.name === refName);
        if (found?.type) return stripNsPrefix(found.type);
      }
      // Search in imports
      for (const imported of this.allImports) {
        const importedElements = imported.element;
        if (importedElements && Array.isArray(importedElements)) {
          const found = importedElements.find(e => e.name === refName);
          if (found?.type) return stripNsPrefix(found.type);
        }
      }
      return undefined;
    };
    
    const scanDeps = (typeName: string, ct: ComplexTypeLike) => {
      const deps = new Set<string>();
      
      const checkGroup = (group: GroupLike | undefined) => {
        if (!group?.element) return;
        for (const el of group.element) {
          if (el.type) {
            const refType = stripNsPrefix(el.type);
            deps.add(refType);
          } else if (el.ref) {
            // Handle element references - resolve to their type
            const refName = stripNsPrefix(el.ref);
            const refType = resolveElementType(refName);
            if (refType) {
              deps.add(refType);
            }
          }
        }
        if (group.sequence) {
          const seqs = Array.isArray(group.sequence) ? group.sequence : [group.sequence];
          for (const seq of seqs) checkGroup(seq);
        }
        if (group.choice) {
          const choices = Array.isArray(group.choice) ? group.choice : [group.choice];
          for (const ch of choices) checkGroup(ch);
        }
      };
      
      checkGroup(ct.sequence);
      checkGroup(ct.choice);
      checkGroup(ct.all);
      if (ct.complexContent?.extension) {
        checkGroup(ct.complexContent.extension.sequence);
        checkGroup(ct.complexContent.extension.choice);
      }
      
      typeDeps.set(typeName, deps);
    };
    
    const complexTypes = getComplexTypes(this.schema);
    for (const ct of complexTypes) {
      if (ct.name) {
        scanDeps(ct.name, ct);
      }
    }
    
    // Also scan elements with inline complexTypes
    const elements = this.schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.name && el.complexType) {
          scanDeps(el.name, el.complexType);
        }
      }
    }
    
    // IMPORTANT: Also scan imported schemas' types for dependency tracking
    for (const imported of this.allImports) {
      const importedComplexTypes = getComplexTypes(imported);
      for (const ct of importedComplexTypes) {
        if (ct.name) {
          scanDeps(ct.name, ct);
        }
      }
      
      const importedElements = imported.element;
      if (importedElements && Array.isArray(importedElements)) {
        for (const el of importedElements) {
          if (el.name && el.complexType) {
            scanDeps(el.name, el.complexType);
          }
        }
      }
    }
    
    // Iteratively propagate generics until no changes
    let changed = true;
    while (changed) {
      changed = false;
      for (const [typeName, deps] of typeDeps) {
        if (this.genericTypes.has(typeName)) continue;
        
        for (const dep of deps) {
          if (this.genericTypes.has(dep)) {
            this.genericTypes.add(typeName);
            // Track which property causes the generic need
            const depProp = this.genericPropertyMap.get(dep);
            if (depProp) {
              this.genericPropertyMap.set(typeName, depProp);
            }
            changed = true;
            break;
          }
        }
      }
    }
  }
  
  /**
   * Check if a type needs a generic parameter
   */
  private needsGeneric(typeName: string): boolean {
    return this.genericTypes.has(typeName);
  }
  
  getLocalTypes(): Set<string> {
    return this.localTypes;
  }
  
  getExternalTypes(): Map<string, string[]> {
    return this.externalTypes;
  }
  
  /**
   * Get substitution type aliases for elements in substitution groups.
   * For each schema with substitution elements, we generate:
   * 1. A values interface with element names as properties (e.g., DomaValuesType)
   * 2. A type alias using AbapGit with that values type (e.g., AbapGitDoma)
   */
  getSubstitutionAliases(): SubstitutionTypeAlias[] {
    const aliases: SubstitutionTypeAlias[] = [];
    
    const elements = this.schema.element;
    if (!elements || !Array.isArray(elements)) return aliases;
    
    // Collect all elements that substitute the same abstract element
    // Key: substitutedElement, Value: array of {elementName, typeName}
    const substitutionsByAbstract = new Map<string, SubstitutionElement[]>();
    
    for (const el of elements) {
      if (!el.substitutionGroup || !el.name || !el.type) continue;
      
      const substitutedElement = stripNsPrefix(el.substitutionGroup);
      const elementName = el.name; // Keep original element name (e.g., 'DD01V')
      const typeName = this.toInterfaceName(stripNsPrefix(el.type));
      
      // Find the abstract element to verify it exists
      const abstractElement = this.findElement(substitutedElement);
      if (!abstractElement) continue;
      
      const existing = substitutionsByAbstract.get(substitutedElement) ?? [];
      existing.push({
        elementName,
        typeName,
        required: true, // For now, assume first element is required, others optional
      });
      substitutionsByAbstract.set(substitutedElement, existing);
    }
    
    // For each abstract element, create a single alias with values interface
    for (const [substitutedElement, substitutionElements] of substitutionsByAbstract) {
      const rootGenericTypes = this.findRootGenericTypes(substitutedElement);
      
      for (const genericType of rootGenericTypes) {
        // Generate names from schema filename (4-letter object type)
        let schemaSuffix = this.schema.$filename?.replace('.xsd', '') ?? '';
        if (!schemaSuffix) {
          // Fallback: use first element name
          schemaSuffix = substitutionElements[0].elementName.toLowerCase();
        }
        const capitalizedSuffix = this.toInterfaceName(schemaSuffix);
        const aliasName = `${genericType}${capitalizedSuffix}`;
        const valuesTypeName = `${capitalizedSuffix}ValuesType`;
        
        // Mark first element as required, rest as optional
        const elementsWithRequired = substitutionElements.map((el, index) => ({
          ...el,
          required: index === 0,
        }));
        
        aliases.push({
          aliasName,
          valuesTypeName,
          genericType,
          elements: elementsWithRequired,
          substitutedElement,
        });
      }
    }
    
    return aliases;
  }
  
  /**
   * Find root types that have generics due to referencing the given abstract element.
   * These are typically the top-level types like AbapGit that eventually reference the abstract element.
   */
  private findRootGenericTypes(_abstractElementName: string): string[] {
    const rootTypes: string[] = [];
    
    // Look for types that need generics and are "root" types (not referenced by other generic types)
    // For now, we'll look for elements with inline complexTypes that need generics
    for (const imported of this.allImports) {
      const elements = imported.element;
      if (!elements || !Array.isArray(elements)) continue;
      
      for (const el of elements) {
        if (el.name && el.complexType && this.genericTypes.has(el.name)) {
          // Check if this is a "root" type (has no parent generic type referencing it)
          // For simplicity, we'll include all generic element types
          rootTypes.push(this.toInterfaceName(el.name));
        }
      }
    }
    
    // Also check current schema
    const elements = this.schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.name && el.complexType && this.genericTypes.has(el.name)) {
          rootTypes.push(this.toInterfaceName(el.name));
        }
      }
    }
    
    return rootTypes;
  }
  
  private collectAllImports(schema: SchemaLike, visited: Set<SchemaLike> = new Set()): SchemaLike[] {
    const result: SchemaLike[] = [];
    
    if (visited.has(schema)) {
      return result;
    }
    visited.add(schema);
    
    const imports = schema.$imports;
    if (imports && Array.isArray(imports)) {
      for (const imp of imports as SchemaLike[]) {
        result.push(imp);
        result.push(...this.collectAllImports(imp, visited));
      }
    }
    
    return result;
  }
  
  /**
   * Check if a type is defined locally in this schema (not in $imports)
   */
  private isLocalType(typeName: string): boolean {
    // Check complexTypes
    const complexTypes = getComplexTypes(this.schema);
    if (complexTypes.some(ct => ct.name === typeName)) {
      return true;
    }
    
    // Check simpleTypes
    const simpleTypes = getSimpleTypes(this.schema);
    if (simpleTypes.some(st => st.name === typeName)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Find which imported schema contains a type
   */
  private findImportedSchemaForType(typeName: string): SchemaLike | undefined {
    for (const imported of this.allImports) {
      const ct = findComplexTypeInSchema(imported, typeName);
      if (ct) return imported;
      
      const st = findSimpleTypeInSchema(imported, typeName);
      if (st) return imported;
    }
    return undefined;
  }
  
  /**
   * Track an external type reference
   */
  private trackExternalType(typeName: string, namespace: string): void {
    const existing = this.externalTypes.get(namespace) ?? [];
    if (!existing.includes(typeName)) {
      existing.push(typeName);
      this.externalTypes.set(namespace, existing);
    }
  }
  
  generateInlineRootElement(elementName: string, complexType: ComplexTypeLike): string {
    const interfaceName = this.toInterfaceName(elementName);
    const needsGeneric = this.needsGeneric(elementName);
    
    if (this.generatedTypes.has(elementName)) {
      return needsGeneric ? `${interfaceName}<T>` : interfaceName;
    }
    this.generatedTypes.add(elementName);
    this.localTypes.add(interfaceName);
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    const extendsTypes: string[] = [];
    
    // Handle complexContent extension
    if (complexType.complexContent?.extension) {
      const ext = complexType.complexContent.extension;
      if (ext.base) {
        const baseName = stripNsPrefix(ext.base);
        const baseInterface = this.resolveTypeWithGeneric(baseName);
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          extendsTypes.push(baseInterface);
        }
      }
      this.collectProperties(ext, properties);
    } else {
      this.collectProperties(complexType, properties);
    }
    
    // Collect attributes from complexType itself
    if (!complexType.complexContent?.extension) {
      this.collectAttributes(complexType.attribute, properties, complexType.anyAttribute);
    }
    
    // Build interface name with generic if needed
    const fullInterfaceName = needsGeneric ? `${interfaceName}<T = unknown>` : interfaceName;
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: fullInterfaceName,
      isExported: true,
      properties,
    };
    
    if (extendsTypes.length > 0) {
      interfaceStructure.extends = extendsTypes;
    }
    
    if (this.options.addJsDoc) {
      interfaceStructure.docs = [{ description: `Generated from element: ${elementName}` }];
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    return needsGeneric ? `${interfaceName}<T>` : interfaceName;
  }
  
  generateComplexType(typeName: string): string {
    const interfaceName = this.toInterfaceName(typeName);
    const needsGeneric = this.needsGeneric(typeName);
    
    if (this.generatedTypes.has(interfaceName)) {
      return needsGeneric ? `${interfaceName}<T>` : interfaceName;
    }
    
    // Check if this is a local type or imported
    if (!this.isLocalType(typeName)) {
      // It's an imported type - track it but don't generate
      this.generatedTypes.add(interfaceName);
      const importedSchema = this.findImportedSchemaForType(typeName);
      if (importedSchema?.targetNamespace) {
        this.trackExternalType(interfaceName, importedSchema.targetNamespace);
      }
      return needsGeneric ? `${interfaceName}<T>` : interfaceName;
    }
    
    // Check for simpleType first (enums, restrictions)
    // Don't add to generatedTypes yet - let generateSimpleType handle it
    const simpleType = this.findSimpleType(typeName);
    if (simpleType) {
      return this.generateSimpleType(typeName, simpleType);
    }
    
    // It's a local complexType - mark as generated and add to localTypes
    this.generatedTypes.add(interfaceName);
    this.localTypes.add(interfaceName);
    
    const complexType = this.findComplexType(typeName);
    if (!complexType) {
      return this.mapSimpleType(typeName);
    }
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    const extendsTypes: string[] = [];
    
    // Handle complexContent extension (inheritance)
    if (complexType.complexContent?.extension) {
      const ext = complexType.complexContent.extension;
      if (ext.base) {
        const baseName = stripNsPrefix(ext.base);
        const baseInterface = this.resolveTypeWithGeneric(baseName);
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          extendsTypes.push(baseInterface);
        }
      }
      this.collectProperties(ext, properties);
    }
    // Handle complexContent restriction
    else if (complexType.complexContent?.restriction) {
      const rest = complexType.complexContent.restriction;
      this.collectPropertiesFromRestriction(rest, properties);
      
      if (rest.base) {
        const baseName = stripNsPrefix(rest.base);
        const baseInterface = this.resolveType(baseName);
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          const redefinedProps = properties.map(p => p.name).filter(Boolean);
          if (redefinedProps.length > 0) {
            extendsTypes.push(`Omit<${baseInterface}, ${redefinedProps.map(p => `'${p}'`).join(' | ')}>`);
          } else {
            extendsTypes.push(baseInterface);
          }
        }
      }
    }
    // Handle simpleContent extension (text content with attributes)
    else if (complexType.simpleContent?.extension) {
      const ext = complexType.simpleContent.extension;
      if (ext.base) {
        const baseType = this.mapSimpleType(stripNsPrefix(ext.base));
        properties.push({
          name: '$value',
          type: baseType,
          hasQuestionToken: false,
        });
      }
      this.collectAttributes(ext.attribute, properties);
    }
    // Handle direct content (no complexContent/simpleContent)
    else {
      this.collectProperties(complexType, properties);
    }
    
    // Collect attributes from complexType itself
    if (!complexType.complexContent?.extension && !complexType.simpleContent?.extension) {
      this.collectAttributes(complexType.attribute, properties, complexType.anyAttribute);
    }
    
    // Build interface structure with generic if needed
    const fullInterfaceName = needsGeneric ? `${interfaceName}<T = unknown>` : interfaceName;
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: fullInterfaceName,
      isExported: true,
      extends: extendsTypes.length > 0 ? extendsTypes : undefined,
      properties,
    };
    
    if (this.options.addJsDoc) {
      interfaceStructure.docs = [{ description: `Generated from complexType: ${typeName}` }];
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    return needsGeneric ? `${interfaceName}<T>` : interfaceName;
  }
  
  private collectProperties(
    source: ComplexTypeLike | ContentModelSource,
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    const seq = source.sequence;
    if (seq) this.collectFromGroup(seq, properties, false, false);
    
    const all = source.all;
    if (all) this.collectFromGroup(all, properties, false, false);
    
    const choice = source.choice;
    if (choice) {
      const choiceIsArray = choice.maxOccurs === 'unbounded' || 
                           (typeof choice.maxOccurs === 'string' && choice.maxOccurs !== '1' && choice.maxOccurs !== '0') ||
                           (typeof choice.maxOccurs === 'number' && choice.maxOccurs > 1);
      this.collectFromGroup(choice, properties, choiceIsArray, true);
    }
    
    const groupRef = source.group;
    if (groupRef?.ref) {
      const groupIsArray = groupRef.maxOccurs === 'unbounded' || 
                          (typeof groupRef.maxOccurs === 'string' && groupRef.maxOccurs !== '1' && groupRef.maxOccurs !== '0') ||
                          (typeof groupRef.maxOccurs === 'number' && groupRef.maxOccurs > 1);
      const groupIsOptional = groupRef.minOccurs === '0' || groupRef.minOccurs === 0;
      this.collectFromGroupRef(groupRef.ref, properties, groupIsArray, groupIsOptional);
    }
    
    if ('attribute' in source && source.attribute && 'base' in source) {
      this.collectAttributes(source.attribute, properties);
    }
    
    const attrGroups = source.attributeGroup;
    if (attrGroups && Array.isArray(attrGroups)) {
      for (const ag of attrGroups) {
        if (ag.ref) {
          this.collectFromAttributeGroupRef(ag.ref, properties);
        }
      }
    }
  }
  
  private collectPropertiesFromRestriction(
    source: ContentModelSource,
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    const seq = source.sequence;
    if (seq) this.collectFromGroup(seq, properties);
    
    const all = source.all;
    if (all) this.collectFromGroup(all, properties);
    
    const choice = source.choice;
    if (choice) this.collectFromGroup(choice, properties);
    
    const groupRef = source.group;
    if (groupRef?.ref) {
      this.collectFromGroupRef(groupRef.ref, properties);
    }
    
    const anyAttr = source.anyAttribute;
    if ('attribute' in source && source.attribute) {
      this.collectAttributes(source.attribute, properties, anyAttr, true);
    } else if (anyAttr) {
      this.collectAttributes(undefined, properties, anyAttr, true);
    }
    
    const attrGroups = source.attributeGroup;
    if (attrGroups && Array.isArray(attrGroups)) {
      for (const ag of attrGroups) {
        if (ag.ref) {
          this.collectFromAttributeGroupRef(ag.ref, properties);
        }
      }
    }
  }
  
  private collectFromGroupRef(ref: string, properties: OptionalKind<PropertySignatureStructure>[], forceArray = false, forceOptional = false): void {
    const groupName = stripNsPrefix(ref);
    const { group, isChoice } = this.findGroupWithMeta(groupName);
    if (group) {
      this.collectFromGroup(group, properties, forceArray, forceOptional || isChoice);
    }
  }
  
  private collectFromAttributeGroupRef(ref: string, properties: OptionalKind<PropertySignatureStructure>[]): void {
    const groupName = stripNsPrefix(ref);
    const attrGroup = this.findAttributeGroup(groupName);
    if (attrGroup?.attribute) {
      this.collectAttributes(attrGroup.attribute as readonly AttributeLike[], properties);
    }
  }
  
  private collectFromGroup(
    group: GroupLike,
    properties: OptionalKind<PropertySignatureStructure>[],
    forceArray = false,
    forceOptional = false
  ): void {
    const anyElements = group.any;
    if (anyElements && Array.isArray(anyElements) && anyElements.length > 0) {
      const hasIndexSig = properties.some(p => p.name?.startsWith('['));
      if (!hasIndexSig) {
        properties.push({
          name: '[key: string]',
          type: 'unknown',
          hasQuestionToken: false,
        });
      }
    }
    
    const nestedGroups = group.group;
    if (nestedGroups) {
      const groupArray = Array.isArray(nestedGroups) ? nestedGroups : [nestedGroups];
      for (const g of groupArray) {
        if (g.ref) {
          const groupIsArray = g.maxOccurs === 'unbounded' || 
                              (typeof g.maxOccurs === 'string' && g.maxOccurs !== '1' && g.maxOccurs !== '0') ||
                              (typeof g.maxOccurs === 'number' && g.maxOccurs > 1);
          const groupIsOptional = g.minOccurs === '0' || g.minOccurs === 0;
          this.collectFromGroupRef(g.ref, properties, forceArray || groupIsArray, forceOptional || groupIsOptional);
        }
      }
    }
    
    const nestedSeq = group.sequence;
    if (nestedSeq) {
      const seqArray = Array.isArray(nestedSeq) ? nestedSeq : [nestedSeq];
      for (const seq of seqArray) {
        const seqIsArray = seq.maxOccurs === 'unbounded' || 
                          (typeof seq.maxOccurs === 'string' && seq.maxOccurs !== '1' && seq.maxOccurs !== '0') ||
                          (typeof seq.maxOccurs === 'number' && seq.maxOccurs > 1);
        const seqIsOptional = seq.minOccurs === '0' || seq.minOccurs === 0;
        this.collectFromGroup(seq, properties, forceArray || seqIsArray, forceOptional || seqIsOptional);
      }
    }
    
    const nestedChoice = group.choice;
    if (nestedChoice) {
      const choiceArray = Array.isArray(nestedChoice) ? nestedChoice : [nestedChoice];
      for (const ch of choiceArray) {
        const choiceIsArray = ch.maxOccurs === 'unbounded' || 
                             (typeof ch.maxOccurs === 'string' && ch.maxOccurs !== '1' && ch.maxOccurs !== '0') ||
                             (typeof ch.maxOccurs === 'number' && ch.maxOccurs > 1);
        this.collectFromGroup(ch, properties, forceArray || choiceIsArray, true);
      }
    }
    
    const elements = group.element;
    if (!elements) return;
    
    for (const el of elements) {
      if (el.ref) {
        const refName = stripNsPrefix(el.ref);
        const refElement = this.findElement(refName);
        
        const isOptional = forceOptional || el.minOccurs === '0' || el.minOccurs === 0;
        const isArray = forceArray || el.maxOccurs === 'unbounded' || 
                        (typeof el.maxOccurs === 'string' && el.maxOccurs !== '1' && el.maxOccurs !== '0') ||
                        (typeof el.maxOccurs === 'number' && el.maxOccurs > 1);
        
        let typeName: string;
        if (refElement?.type) {
          // Use resolveTypeWithGeneric to add <T> if the type needs it
          typeName = this.resolveTypeWithGeneric(stripNsPrefix(refElement.type));
        } else if (refElement && refElement.complexType) {
          typeName = this.generateInlineComplexType(refName, refElement.complexType);
        } else if (refElement && this.isAbstractElement(refElement)) {
          // Abstract element - use generic type parameter T instead of union
          // This allows the containing type to be parameterized with the concrete type
          typeName = 'T';
        } else {
          typeName = this.toInterfaceName(refName);
        }
        
        if (isArray) {
          typeName = `${typeName}[]`;
        }
        
        if (!properties.some(p => p.name === refName)) {
          properties.push({
            name: refName,
            type: typeName,
            hasQuestionToken: isOptional,
          });
        }
        continue;
      }
      
      if (!el.name) continue;
      
      const isOptional = forceOptional || el.minOccurs === '0' || el.minOccurs === 0;
      const isArray = forceArray || el.maxOccurs === 'unbounded' || 
                      (typeof el.maxOccurs === 'string' && el.maxOccurs !== '1' && el.maxOccurs !== '0') ||
                      (typeof el.maxOccurs === 'number' && el.maxOccurs > 1);
      
      let typeName: string;
      if (el.type) {
        const rawType = el.type;
        const baseType = stripNsPrefix(rawType);
        if (rawType.startsWith('xsd:') || rawType.startsWith('xs:')) {
          if (this.isBuiltInXsdType(baseType)) {
            typeName = this.mapSimpleType(baseType);
          } else {
            // Use resolveTypeWithGeneric to add <T> if the type needs it
            typeName = this.resolveTypeWithGeneric(baseType);
          }
        } else {
          // Use resolveTypeWithGeneric to add <T> if the type needs it
          typeName = this.resolveTypeWithGeneric(baseType);
        }
      } else if (el.complexType) {
        typeName = this.generateInlineComplexType(el.name, el.complexType);
      } else {
        typeName = 'unknown';
      }
      
      if (isArray) {
        typeName = `${typeName}[]`;
      }
      
      if (!properties.some(p => p.name === el.name)) {
        properties.push({
          name: el.name,
          type: typeName,
          hasQuestionToken: isOptional,
        });
      }
    }
  }
  
  private findElement(name: string): ElementLike | undefined {
    const entry = walkerFindElement(name, this.schema);
    return entry?.element;
  }
  
  private collectAttributes(
    attributes: readonly AttributeLike[] | undefined,
    properties: OptionalKind<PropertySignatureStructure>[],
    anyAttribute?: unknown,
    isRestriction = false
  ): void {
    if (attributes) {
      for (const attr of attributes) {
        if (attr.ref) {
          const refName = attr.ref;
          const isXmlNamespace = refName.startsWith('xml:');
          const propName = isXmlNamespace 
            ? `'${refName}'`
            : stripNsPrefix(refName);
          const isOptional = attr.use !== 'required';
          properties.push({
            name: propName,
            type: 'string',
            hasQuestionToken: isOptional,
          });
          continue;
        }
        
        if (!attr.name) continue;
        if (attr.use === 'prohibited') continue;
        if (isRestriction && !attr.type) continue;
        
        const isOptional = attr.use !== 'required';
        let typeName: string;
        if (attr.type) {
          const rawType = attr.type;
          const baseType = stripNsPrefix(rawType);
          if (rawType.startsWith('xsd:') || rawType.startsWith('xs:')) {
            if (this.isBuiltInXsdType(baseType)) {
              typeName = this.mapSimpleType(baseType);
            } else {
              typeName = this.resolveType(baseType);
            }
          } else {
            typeName = this.resolveType(baseType);
          }
        } else {
          typeName = 'unknown';
        }
        
        properties.push({
          name: attr.name,
          type: typeName,
          hasQuestionToken: isOptional,
        });
      }
    }
    
    if (anyAttribute) {
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
  
  private generateInlineComplexType(parentName: string, ct: ComplexTypeLike): string {
    const baseName = this.toInterfaceName(parentName);
    const interfaceName = baseName.endsWith('Type') ? baseName : baseName + 'Type';
    
    if (this.generatedTypes.has(interfaceName)) {
      return interfaceName;
    }
    this.generatedTypes.add(interfaceName);
    this.localTypes.add(interfaceName);
    
    const properties: OptionalKind<PropertySignatureStructure>[] = [];
    const extendsTypes: string[] = [];
    
    if (ct.mixed === true) {
      properties.push({
        name: '_text',
        type: 'string',
        hasQuestionToken: true,
      });
    }
    
    if (ct.complexContent?.extension) {
      const ext = ct.complexContent.extension;
      if (ext.base) {
        const baseName = stripNsPrefix(ext.base);
        const baseInterface = this.resolveType(baseName);
        if (baseInterface !== 'unknown' && baseInterface !== 'string' && baseInterface !== 'number' && baseInterface !== 'boolean') {
          extendsTypes.push(baseInterface);
        }
      }
      this.collectProperties(ext, properties);
    } else {
      this.collectProperties(ct, properties);
      this.collectAttributes(ct.attribute, properties);
    }
    
    const interfaceStructure: OptionalKind<InterfaceDeclarationStructure> = {
      name: interfaceName,
      isExported: true,
      properties,
    };
    
    if (extendsTypes.length > 0) {
      interfaceStructure.extends = extendsTypes;
    }
    
    this.sourceFile.addInterface(interfaceStructure);
    
    return interfaceName;
  }
  
  private resolveType(typeName: string): string {
    const builtIn = this.mapSimpleType(typeName);
    if (builtIn !== typeName) {
      return builtIn;
    }
    
    // Check if it's a local type
    if (this.isLocalType(typeName)) {
      const st = this.findSimpleType(typeName);
      if (st) {
        return this.generateSimpleType(typeName, st);
      }
      
      const ct = this.findComplexType(typeName);
      if (ct) {
        return this.generateComplexType(typeName);
      }
    }
    
    // Check in imports - track as external dependency
    const importedSchema = this.findImportedSchemaForType(typeName);
    if (importedSchema) {
      const interfaceName = this.toInterfaceName(typeName);
      if (importedSchema.targetNamespace) {
        this.trackExternalType(interfaceName, importedSchema.targetNamespace);
      }
      return interfaceName;
    }
    
    // Unknown type - still PascalCase it
    return this.toInterfaceName(typeName);
  }
  
  /**
   * Resolve a type name, adding generic parameter <T> if the type needs it
   */
  private resolveTypeWithGeneric(typeName: string): string {
    const baseType = this.resolveType(typeName);
    
    // Check if this type needs a generic parameter
    // But don't add <T> if it already has it (from generateComplexType)
    if (this.needsGeneric(typeName) && !baseType.includes('<T>')) {
      return `${baseType}<T>`;
    }
    
    return baseType;
  }
  
  private findComplexType(name: string): ComplexTypeLike | undefined {
    return findComplexTypeInSchema(this.schema, name);
  }
  
  private findSimpleType(name: string): SimpleTypeLike | undefined {
    return findSimpleTypeInSchema(this.schema, name);
  }
  
  private findGroupWithMeta(name: string): { group: { element?: readonly ElementLike[] } | undefined; isChoice: boolean } {
    const groups = this.schema.group;
    if (groups && Array.isArray(groups)) {
      const found = groups.find((g) => g.name === name);
      if (found) {
        const isChoice = !!found.choice && !found.sequence && !found.all;
        const content = found.sequence || found.choice || found.all || found;
        return { group: content, isChoice };
      }
    }
    for (const imported of this.allImports) {
      const importedGroups = imported.group;
      if (importedGroups && Array.isArray(importedGroups)) {
        const found = importedGroups.find((g) => g.name === name);
        if (found) {
          const isChoice = !!found.choice && !found.sequence && !found.all;
          const content = found.sequence || found.choice || found.all || found;
          return { group: content, isChoice };
        }
      }
    }
    return { group: undefined, isChoice: false };
  }
  
  private findAttributeGroup(name: string): { attribute?: readonly AttributeLike[] } | undefined {
    const groups = this.schema.attributeGroup;
    if (groups && Array.isArray(groups)) {
      const found = groups.find((g) => g.name === name);
      if (found) return found;
    }
    for (const imported of this.allImports) {
      const importedGroups = imported.attributeGroup;
      if (importedGroups && Array.isArray(importedGroups)) {
        const found = importedGroups.find((g) => g.name === name);
        if (found) return found;
      }
    }
    return undefined;
  }
  
  private generateSimpleType(typeName: string, st: SimpleTypeLike): string {
    const aliasName = this.toInterfaceName(typeName);
    
    if (this.generatedTypes.has(typeName)) {
      return aliasName;
    }
    this.generatedTypes.add(typeName);
    this.localTypes.add(aliasName);
    
    if (st.restriction?.enumeration && st.restriction.enumeration.length > 0) {
      const enumValues = st.restriction.enumeration
        .map(e => `'${e.value}'`)
        .join(' | ');
      
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: enumValues,
      });
      return aliasName;
    }
    
    if (st.union) {
      const memberTypes = st.union.memberTypes?.split(/\s+/) ?? [];
      if (memberTypes.length > 0) {
        const unionTypes = memberTypes
          .map(t => {
            const baseType = stripNsPrefix(t);
            const mapped = this.mapSimpleType(baseType);
            if (mapped !== baseType) {
              return mapped;
            }
            return this.resolveType(baseType);
          })
          .join(' | ');
        
        this.sourceFile.addTypeAlias({
          name: aliasName,
          isExported: true,
          type: unionTypes || 'string',
        });
        return aliasName;
      }
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: 'string',
      });
      return aliasName;
    }
    
    if (st.list) {
      const itemType = st.list.itemType 
        ? this.mapSimpleType(stripNsPrefix(st.list.itemType))
        : 'string';
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: `${itemType}[]`,
      });
      return aliasName;
    }
    
    // Simple restriction - use base type
    if (st.restriction?.base) {
      const baseType = this.mapSimpleType(stripNsPrefix(st.restriction.base));
      this.sourceFile.addTypeAlias({
        name: aliasName,
        isExported: true,
        type: baseType,
      });
      return aliasName;
    }
    
    // Default to string
    this.sourceFile.addTypeAlias({
      name: aliasName,
      isExported: true,
      type: 'string',
    });
    return aliasName;
  }
  
  private isBuiltInXsdType(typeName: string): boolean {
    const builtInTypes = [
      'string', 'boolean', 'int', 'integer', 'long', 'short', 'byte',
      'decimal', 'float', 'double', 'positiveInteger', 'nonNegativeInteger',
      'negativeInteger', 'nonPositiveInteger', 'unsignedLong', 'unsignedInt',
      'unsignedShort', 'unsignedByte', 'date', 'dateTime', 'time', 'duration',
      'anyURI', 'base64Binary', 'hexBinary', 'QName', 'token', 'language',
      'Name', 'NCName', 'ID', 'IDREF', 'NMTOKEN', 'normalizedString',
      'anyType', 'anySimpleType',
    ];
    return builtInTypes.includes(typeName);
  }
  
  private mapSimpleType(typeName: string): string {
    const mapping: Record<string, string> = {
      'string': 'string',
      'boolean': 'boolean',
      'int': 'number',
      'integer': 'number',
      'long': 'number',
      'short': 'number',
      'byte': 'number',
      'decimal': 'number',
      'float': 'number',
      'double': 'number',
      'positiveInteger': 'number',
      'nonNegativeInteger': 'number',
      'negativeInteger': 'number',
      'nonPositiveInteger': 'number',
      'unsignedLong': 'number',
      'unsignedInt': 'number',
      'unsignedShort': 'number',
      'unsignedByte': 'number',
      'date': 'string',
      'dateTime': 'string',
      'time': 'string',
      'duration': 'string',
      'anyURI': 'string',
      'base64Binary': 'string',
      'hexBinary': 'string',
      'QName': 'string',
      'token': 'string',
      'language': 'string',
      'Name': 'string',
      'NCName': 'string',
      'ID': 'string',
      'IDREF': 'string',
      'NMTOKEN': 'string',
      'normalizedString': 'string',
      'anyType': 'unknown',
      'anySimpleType': 'unknown',
    };
    return mapping[typeName] ?? typeName;
  }
  
  private toInterfaceName(typeName: string): string {
    return typeName.charAt(0).toUpperCase() + typeName.slice(1);
  }
  
  /**
   * Check if an element is abstract
   */
  private isAbstractElement(element: ElementLike): boolean {
    return element.abstract === true;
  }
  
  /**
   * Find all elements that substitute for an abstract element.
   * This handles XSD substitution groups where concrete elements can
   * substitute for an abstract element.
   */
  private findSubstitutes(abstractElementName: string): ElementLike[] {
    const substitutes: ElementLike[] = [];
    
    // Search in current schema
    const elements = this.schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.substitutionGroup) {
          const subGroupName = stripNsPrefix(el.substitutionGroup);
          if (subGroupName === abstractElementName) {
            substitutes.push(el);
          }
        }
      }
    }
    
    // Search in all imports
    for (const imported of this.allImports) {
      const importedElements = imported.element;
      if (importedElements && Array.isArray(importedElements)) {
        for (const el of importedElements) {
          const subGroup = el.substitutionGroup;
          if (subGroup) {
            const subGroupName = stripNsPrefix(subGroup);
            if (subGroupName === abstractElementName) {
              substitutes.push(el);
            }
          }
        }
      }
    }
    
    return substitutes;
  }
}
