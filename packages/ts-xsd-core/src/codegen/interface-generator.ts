/**
 * Interface Generator - Compiles Schema to TypeScript interfaces using ts-morph
 * 
 * This solves the TS2589 "Type instantiation is excessively deep" problem
 * by generating interfaces at build time (JS runtime) instead of relying
 * on TypeScript's compile-time type inference.
 */

import { Project, SourceFile, InterfaceDeclarationStructure, PropertySignatureStructure, OptionalKind } from 'ts-morph';
import type { SchemaLike, ComplexTypeLike, AttributeLike, ElementLike, SimpleTypeLike } from '../infer/types';
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
    } else if (element && (element as any).complexType) {
      // Element has inline complexType - generate it with the element name
      generator.generateInlineRootElement(options.rootElement, (element as any).complexType);
    }
  }
  
  if (options.generateAllTypes) {
    // Generate interfaces for all elements with inline complexTypes
    const elements = schema.element;
    if (elements && Array.isArray(elements)) {
      for (const el of elements) {
        if (el.name && (el as any).complexType) {
          generator.generateInlineRootElement(el.name, (el as any).complexType);
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
    source: ComplexTypeLike | { sequence?: unknown; all?: unknown; choice?: unknown; group?: unknown; attribute?: readonly AttributeLike[]; attributeGroup?: readonly unknown[] },
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    const seq = (source as any).sequence;
    if (seq) this.collectFromGroup(seq, properties, false, false);
    
    const all = (source as any).all;
    if (all) this.collectFromGroup(all, properties, false, false);
    
    // Choice elements are always optional (only one is selected)
    // But if choice has maxOccurs="unbounded", elements should be arrays
    const choice = (source as any).choice;
    if (choice) {
      const choiceIsArray = choice.maxOccurs === 'unbounded' || 
                           (typeof choice.maxOccurs === 'string' && choice.maxOccurs !== '1' && choice.maxOccurs !== '0') ||
                           (typeof choice.maxOccurs === 'number' && choice.maxOccurs > 1);
      this.collectFromGroup(choice, properties, choiceIsArray, true);
    }
    
    // Handle group reference
    const groupRef = (source as any).group;
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
    if ('attribute' in source && source.attribute && 'base' in source) {
      this.collectAttributes(source.attribute, properties);
    }
    
    // Handle attributeGroup references
    const attrGroups = (source as any).attributeGroup;
    if (attrGroups && Array.isArray(attrGroups)) {
      for (const ag of attrGroups) {
        if (ag.ref) {
          this.collectFromAttributeGroupRef(ag.ref, properties);
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
    source: { sequence?: unknown; all?: unknown; choice?: unknown; group?: unknown; attribute?: readonly AttributeLike[]; attributeGroup?: readonly unknown[] },
    properties: OptionalKind<PropertySignatureStructure>[]
  ): void {
    const seq = (source as any).sequence;
    if (seq) this.collectFromGroup(seq, properties);
    
    const all = (source as any).all;
    if (all) this.collectFromGroup(all, properties);
    
    const choice = (source as any).choice;
    if (choice) this.collectFromGroup(choice, properties);
    
    // Handle group reference
    const groupRef = (source as any).group;
    if (groupRef?.ref) {
      this.collectFromGroupRef(groupRef.ref, properties);
    }
    
    // Collect attributes with restriction semantics
    // Also handle anyAttribute for index signature
    const anyAttr = (source as any).anyAttribute;
    if ('attribute' in source && source.attribute) {
      this.collectAttributes(source.attribute, properties, anyAttr, true);
    } else if (anyAttr) {
      // No attributes but has anyAttribute - add index signature
      this.collectAttributes(undefined, properties, anyAttr, true);
    }
    
    // Handle attributeGroup references
    const attrGroups = (source as any).attributeGroup;
    if (attrGroups && Array.isArray(attrGroups)) {
      for (const ag of attrGroups) {
        if (ag.ref) {
          this.collectFromAttributeGroupRef(ag.ref, properties);
        }
      }
    }
  }
  
  private collectFromGroupRef(ref: string, properties: OptionalKind<PropertySignatureStructure>[], forceArray: boolean = false, forceOptional: boolean = false): void {
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
    group: { element?: readonly ElementLike[]; any?: readonly unknown[]; group?: unknown; sequence?: unknown; choice?: unknown },
    properties: OptionalKind<PropertySignatureStructure>[],
    forceArray: boolean = false,
    forceOptional: boolean = false
  ): void {
    // Handle any wildcard
    const anyElements = (group as any).any;
    if (anyElements && Array.isArray(anyElements) && anyElements.length > 0) {
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
    const nestedGroups = (group as any).group;
    if (nestedGroups) {
      const groupArray = Array.isArray(nestedGroups) ? nestedGroups : [nestedGroups];
      for (const g of groupArray) {
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
    const nestedSeq = (group as any).sequence;
    if (nestedSeq) {
      const seqArray = Array.isArray(nestedSeq) ? nestedSeq : [nestedSeq];
      for (const seq of seqArray) {
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
    const nestedChoice = (group as any).choice;
    if (nestedChoice) {
      const choiceArray = Array.isArray(nestedChoice) ? nestedChoice : [nestedChoice];
      for (const ch of choiceArray) {
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
      if ((el as any).ref) {
        const refName = stripNsPrefix((el as any).ref);
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
        } else if (refElement && (refElement as any).complexType) {
          typeName = this.generateInlineComplexType(refName, (refElement as any).complexType);
        } else {
          // Element exists but has no type - use the element name as type
          typeName = this.toInterfaceName(refName);
        }
        
        if (isArray) {
          typeName = `${typeName}[]`;
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
      } else if ((el as any).complexType) {
        typeName = this.generateInlineComplexType(el.name, (el as any).complexType);
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
  
  private collectAttributes(
    attributes: readonly AttributeLike[] | undefined,
    properties: OptionalKind<PropertySignatureStructure>[],
    anyAttribute?: unknown,
    isRestriction: boolean = false
  ): void {
    if (attributes) {
      for (const attr of attributes) {
        // Handle attribute reference (ref="atcfinding:location" -> "location")
        if ((attr as any).ref) {
          const refName = (attr as any).ref;
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
    if ((ct as any).mixed === true || (ct as any).mixed === 'true') {
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
      const found = groups.find((g: any) => g.name === name);
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
        const found = importedGroups.find((g: any) => g.name === name);
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
      const found = groups.find((g: any) => g.name === name);
      if (found) return found;
    }
    // Search in imports
    for (const imported of this.allImports) {
      const importedGroups = imported.attributeGroup;
      if (importedGroups && Array.isArray(importedGroups)) {
        const found = importedGroups.find((g: any) => g.name === name);
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
