/**
 * Schema Visitor - Generic traversal with visitor pattern (OO implementation)
 * 
 * Provides a way to traverse ALL nodes in a schema with type-aware callbacks.
 * Unlike the walker (which yields flattened results), the visitor preserves
 * the tree structure and calls visitor methods for each node type.
 * 
 * Usage:
 * ```typescript
 * // Simple usage with convenience function
 * visitSchema(schema, {
 *   visitComplexType(node, ctx) {
 *     console.log('Found complexType:', node.name);
 *   },
 * });
 * 
 * // Advanced usage with class for extensibility
 * const traverser = new SchemaTraverser(schema, visitor, options);
 * traverser.traverse();
 * console.log('Visited nodes:', traverser.visitedNodes.size);
 * ```
 */

import type {
  Schema,
  TopLevelComplexType,
  LocalComplexType,
  TopLevelSimpleType,
  LocalSimpleType,
  TopLevelElement,
  LocalElement,
  TopLevelAttribute,
  LocalAttribute,
  NamedGroup,
  GroupRef,
  NamedAttributeGroup,
  AttributeGroupRef,
  ExplicitGroup,
  All,
  ComplexContent,
  SimpleContent,
  ComplexContentExtension,
  ComplexContentRestriction,
  SimpleContentExtension,
  SimpleContentRestriction,
  SimpleTypeRestriction,
  List,
  Union,
  Annotation,
  Import,
  Include,
  Any,
  AnyAttribute,
} from '../xsd/types';

// =============================================================================
// Node Types Enum
// =============================================================================

/**
 * All possible XSD node types that can be visited
 */
export enum XsdNodeType {
  Schema = 'schema',
  ComplexType = 'complexType',
  SimpleType = 'simpleType',
  Element = 'element',
  Attribute = 'attribute',
  Group = 'group',
  GroupRef = 'groupRef',
  AttributeGroup = 'attributeGroup',
  AttributeGroupRef = 'attributeGroupRef',
  Sequence = 'sequence',
  Choice = 'choice',
  All = 'all',
  ComplexContent = 'complexContent',
  SimpleContent = 'simpleContent',
  Extension = 'extension',
  Restriction = 'restriction',
  List = 'list',
  Union = 'union',
  Annotation = 'annotation',
  Import = 'import',
  Include = 'include',
  Any = 'any',
  AnyAttribute = 'anyAttribute',
}

// =============================================================================
// Visitor Context
// =============================================================================

/**
 * Context passed to each visitor method
 */
export interface VisitorContext {
  /** Current schema being visited */
  readonly schema: Schema;
  /** Parent node (undefined for root) */
  readonly parent?: unknown;
  /** Parent node type */
  readonly parentType?: XsdNodeType;
  /** Path from root */
  readonly path: readonly (string | number)[];
  /** Depth in the tree (0 = schema level) */
  readonly depth: number;
  /** Whether this is a top-level declaration */
  readonly isTopLevel: boolean;
  /** Check if a node has been visited (uses object identity) */
  readonly hasVisited: (node: unknown) => boolean;
  /** Mark a node as visited. Returns true if newly marked, false if already visited */
  readonly markVisited: (node: unknown) => boolean;
}

// =============================================================================
// Visitor Interface (Callbacks)
// =============================================================================

/**
 * Visitor callbacks - implement only the ones you need.
 * Return \`false\` to skip visiting children of this node.
 */
export interface SchemaVisitorCallbacks {
  visitSchema?(node: Schema, ctx: VisitorContext): boolean | void;
  visitComplexType?(node: TopLevelComplexType | LocalComplexType, ctx: VisitorContext): boolean | void;
  visitSimpleType?(node: TopLevelSimpleType | LocalSimpleType, ctx: VisitorContext): boolean | void;
  visitElement?(node: TopLevelElement | LocalElement, ctx: VisitorContext): boolean | void;
  visitAttribute?(node: TopLevelAttribute | LocalAttribute, ctx: VisitorContext): boolean | void;
  visitGroup?(node: NamedGroup, ctx: VisitorContext): boolean | void;
  visitGroupRef?(node: GroupRef, ctx: VisitorContext): boolean | void;
  visitAttributeGroup?(node: NamedAttributeGroup, ctx: VisitorContext): boolean | void;
  visitAttributeGroupRef?(node: AttributeGroupRef, ctx: VisitorContext): boolean | void;
  visitSequence?(node: ExplicitGroup, ctx: VisitorContext): boolean | void;
  visitChoice?(node: ExplicitGroup, ctx: VisitorContext): boolean | void;
  visitAll?(node: All, ctx: VisitorContext): boolean | void;
  visitComplexContent?(node: ComplexContent, ctx: VisitorContext): boolean | void;
  visitSimpleContent?(node: SimpleContent, ctx: VisitorContext): boolean | void;
  visitExtension?(node: ComplexContentExtension | SimpleContentExtension, ctx: VisitorContext): boolean | void;
  visitRestriction?(node: ComplexContentRestriction | SimpleContentRestriction | SimpleTypeRestriction, ctx: VisitorContext): boolean | void;
  visitList?(node: List, ctx: VisitorContext): boolean | void;
  visitUnion?(node: Union, ctx: VisitorContext): boolean | void;
  visitAnnotation?(node: Annotation, ctx: VisitorContext): boolean | void;
  visitImport?(node: Import, ctx: VisitorContext): boolean | void;
  visitInclude?(node: Include, ctx: VisitorContext): boolean | void;
  visitAny?(node: Any, ctx: VisitorContext): boolean | void;
  visitAnyAttribute?(node: AnyAttribute, ctx: VisitorContext): boolean | void;
}

/** @deprecated Use SchemaVisitorCallbacks instead */
export type SchemaVisitor = SchemaVisitorCallbacks;

// =============================================================================
// Visitor Options
// =============================================================================

export interface VisitorOptions {
  /** Only visit these node types (optimization) */
  only?: XsdNodeType[];
  /** Skip these node types */
  skip?: XsdNodeType[];
  /** Follow \$imports to visit imported schemas */
  followImports?: boolean;
  /** Maximum depth to traverse (-1 = unlimited) */
  maxDepth?: number;
}

// =============================================================================
// Schema Traverser Class
// =============================================================================

/**
 * OO-based schema traverser with visitor pattern.
 * 
 * Advantages over function-based approach:
 * - Extensible via subclassing
 * - Inspectable state (visitedNodes, visitedSchemas)
 * - Reusable instance
 * - Cleaner code organization
 */
export class SchemaTraverser {
  /** Schemas visited (for circular import prevention) */
  readonly visitedSchemas = new Set<Schema>();
  
  /** Nodes marked as visited by user callbacks */
  readonly visitedNodes = new Set<unknown>();
  
  /** Current schema being traversed */
  protected currentSchema: Schema;
  
  /** Resolved options with defaults */
  protected readonly maxDepth: number;
  protected readonly followImports: boolean;
  protected readonly only: XsdNodeType[];
  protected readonly skip: XsdNodeType[];
  
  constructor(
    protected readonly rootSchema: Schema,
    protected readonly callbacks: SchemaVisitorCallbacks,
    options: VisitorOptions = {}
  ) {
    this.currentSchema = rootSchema;
    this.maxDepth = options.maxDepth ?? -1;
    this.followImports = options.followImports ?? false;
    this.only = options.only ?? [];
    this.skip = options.skip ?? [];
  }
  
  // ===========================================================================
  // Public API
  // ===========================================================================
  
  /** Start traversal from root schema */
  traverse(): void {
    this.visitSchemaRoot(this.rootSchema, undefined, undefined, [], 0, true);
  }
  
  /** Check if a node has been marked as visited */
  hasVisited(node: unknown): boolean {
    return this.visitedNodes.has(node);
  }
  
  /** Mark a node as visited. Returns true if newly marked, false if already visited */
  markVisited(node: unknown): boolean {
    if (this.visitedNodes.has(node)) return false;
    this.visitedNodes.add(node);
    return true;
  }
  
  // ===========================================================================
  // Protected: Override in subclasses to customize
  // ===========================================================================
  
  protected shouldVisit(type: XsdNodeType): boolean {
    if (this.skip.length > 0 && this.skip.includes(type)) return false;
    if (this.only.length > 0 && !this.only.includes(type)) return false;
    return true;
  }
  
  protected createContext(
    parent: unknown | undefined,
    parentType: XsdNodeType | undefined,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): VisitorContext {
    return {
      schema: this.currentSchema,
      parent,
      parentType,
      path,
      depth,
      isTopLevel,
      hasVisited: (node) => this.hasVisited(node),
      markVisited: (node) => this.markVisited(node),
    };
  }
  
  // ===========================================================================
  // Traversal Methods
  // ===========================================================================
  
  protected visitSchemaRoot(
    schema: Schema,
    parent: unknown | undefined,
    parentType: XsdNodeType | undefined,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): void {
    // Prevent infinite loops with circular imports
    if (this.visitedSchemas.has(schema)) return;
    this.visitedSchemas.add(schema);
    
    // Update current schema
    this.currentSchema = schema;
    
    // Check max depth
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    // Visit schema root
    if (this.shouldVisit(XsdNodeType.Schema) && this.callbacks.visitSchema) {
      const result = this.callbacks.visitSchema(schema, ctx);
      if (result === false) return;
    }
    
    // Visit imports
    if (schema.import) {
      for (let i = 0; i < schema.import.length; i++) {
        this.visitNode(XsdNodeType.Import, schema.import[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.Import, i], depth + 1, true);
      }
    }
    
    // Visit includes
    if (schema.include) {
      for (let i = 0; i < schema.include.length; i++) {
        this.visitNode(XsdNodeType.Include, schema.include[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.Include, i], depth + 1, true);
      }
    }
    
    // Visit annotations
    if (schema.annotation) {
      for (let i = 0; i < schema.annotation.length; i++) {
        this.visitNode(XsdNodeType.Annotation, schema.annotation[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.Annotation, i], depth + 1, true);
      }
    }
    
    // Visit top-level simple types
    if (schema.simpleType) {
      for (let i = 0; i < schema.simpleType.length; i++) {
        this.visitSimpleType(schema.simpleType[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.SimpleType, i], depth + 1, true);
      }
    }
    
    // Visit top-level complex types
    if (schema.complexType) {
      for (let i = 0; i < schema.complexType.length; i++) {
        this.visitComplexType(schema.complexType[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.ComplexType, i], depth + 1, true);
      }
    }
    
    // Visit top-level groups
    if (schema.group) {
      for (let i = 0; i < schema.group.length; i++) {
        this.visitNamedGroup(schema.group[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.Group, i], depth + 1, true);
      }
    }
    
    // Visit top-level attribute groups
    if (schema.attributeGroup) {
      for (let i = 0; i < schema.attributeGroup.length; i++) {
        this.visitNamedAttributeGroup(schema.attributeGroup[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.AttributeGroup, i], depth + 1, true);
      }
    }
    
    // Visit top-level elements
    if (schema.element) {
      for (let i = 0; i < schema.element.length; i++) {
        this.visitElement(schema.element[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.Element, i], depth + 1, true);
      }
    }
    
    // Visit top-level attributes
    if (schema.attribute) {
      for (let i = 0; i < schema.attribute.length; i++) {
        this.visitAttribute(schema.attribute[i], schema, XsdNodeType.Schema, [...path, XsdNodeType.Attribute, i], depth + 1, true);
      }
    }
    
    // Follow imports if requested
    if (this.followImports && schema.$imports) {
      for (const imported of schema.$imports) {
        this.visitSchemaRoot(imported, schema, XsdNodeType.Schema, [...path, '$imports'], depth + 1, false);
        // Restore currentSchema after visiting imported schema
        this.currentSchema = schema;
      }
    }
  }
  
  protected visitNode(
    type: XsdNodeType,
    node: unknown,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): boolean {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return false;
    if (!this.shouldVisit(type)) return true;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    const visitorMethod = `visit${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof SchemaVisitorCallbacks;
    const fn = this.callbacks[visitorMethod] as ((node: unknown, ctx: VisitorContext) => boolean | void) | undefined;
    
    if (fn) {
      const result = fn(node, ctx);
      return result !== false;
    }
    return true;
  }
  
  protected visitComplexType(
    ct: TopLevelComplexType | LocalComplexType,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    if (this.shouldVisit(XsdNodeType.ComplexType) && this.callbacks.visitComplexType) {
      const result = this.callbacks.visitComplexType(ct, ctx);
      if (result === false) return;
    }
    
    // Visit annotation
    if (ct.annotation) {
      this.visitNode(XsdNodeType.Annotation, ct.annotation, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.Annotation], depth + 1, false);
    }
    
    // Visit complexContent
    if (ct.complexContent) {
      this.visitComplexContent(ct.complexContent, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.ComplexContent], depth + 1);
    }
    
    // Visit simpleContent
    if (ct.simpleContent) {
      this.visitSimpleContent(ct.simpleContent, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.SimpleContent], depth + 1);
    }
    
    // Visit model group (short form)
    if (ct.sequence) {
      this.visitModelGroup(XsdNodeType.Sequence, ct.sequence, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.Sequence], depth + 1);
    }
    if (ct.choice) {
      this.visitModelGroup(XsdNodeType.Choice, ct.choice, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.Choice], depth + 1);
    }
    if (ct.all) {
      this.visitAll(ct.all, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.All], depth + 1);
    }
    if (ct.group) {
      this.visitNode(XsdNodeType.GroupRef, ct.group, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.Group], depth + 1, false);
    }
    
    // Visit attributes
    if (ct.attribute) {
      for (let i = 0; i < ct.attribute.length; i++) {
        this.visitAttribute(ct.attribute[i], ct, XsdNodeType.ComplexType, [...path, XsdNodeType.Attribute, i], depth + 1, false);
      }
    }
    if (ct.attributeGroup) {
      for (let i = 0; i < ct.attributeGroup.length; i++) {
        this.visitNode(XsdNodeType.AttributeGroupRef, ct.attributeGroup[i], ct, XsdNodeType.ComplexType, [...path, XsdNodeType.AttributeGroup, i], depth + 1, false);
      }
    }
    if (ct.anyAttribute) {
      this.visitNode(XsdNodeType.AnyAttribute, ct.anyAttribute, ct, XsdNodeType.ComplexType, [...path, XsdNodeType.AnyAttribute], depth + 1, false);
    }
  }
  
  protected visitSimpleType(
    st: TopLevelSimpleType | LocalSimpleType,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    if (this.shouldVisit(XsdNodeType.SimpleType) && this.callbacks.visitSimpleType) {
      const result = this.callbacks.visitSimpleType(st, ctx);
      if (result === false) return;
    }
    
    // Visit annotation
    if (st.annotation) {
      this.visitNode(XsdNodeType.Annotation, st.annotation, st, XsdNodeType.SimpleType, [...path, XsdNodeType.Annotation], depth + 1, false);
    }
    
    // Visit derivation
    if (st.restriction) {
      this.visitNode(XsdNodeType.Restriction, st.restriction, st, XsdNodeType.SimpleType, [...path, XsdNodeType.Restriction], depth + 1, false);
      if (st.restriction.simpleType) {
        this.visitSimpleType(st.restriction.simpleType, st.restriction, XsdNodeType.Restriction, [...path, XsdNodeType.Restriction, XsdNodeType.SimpleType], depth + 2, false);
      }
    }
    if (st.list) {
      this.visitNode(XsdNodeType.List, st.list, st, XsdNodeType.SimpleType, [...path, XsdNodeType.List], depth + 1, false);
      if (st.list.simpleType) {
        this.visitSimpleType(st.list.simpleType, st.list, XsdNodeType.List, [...path, XsdNodeType.List, XsdNodeType.SimpleType], depth + 2, false);
      }
    }
    if (st.union) {
      this.visitNode(XsdNodeType.Union, st.union, st, XsdNodeType.SimpleType, [...path, XsdNodeType.Union], depth + 1, false);
      if (st.union.simpleType) {
        for (let i = 0; i < st.union.simpleType.length; i++) {
          this.visitSimpleType(st.union.simpleType[i], st.union, XsdNodeType.Union, [...path, XsdNodeType.Union, XsdNodeType.SimpleType, i], depth + 2, false);
        }
      }
    }
  }
  
  protected visitElement(
    el: TopLevelElement | LocalElement,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    if (this.shouldVisit(XsdNodeType.Element) && this.callbacks.visitElement) {
      const result = this.callbacks.visitElement(el, ctx);
      if (result === false) return;
    }
    
    // Visit annotation
    if (el.annotation) {
      this.visitNode(XsdNodeType.Annotation, el.annotation, el, XsdNodeType.Element, [...path, XsdNodeType.Annotation], depth + 1, false);
    }
    
    // Visit inline types
    if (el.simpleType) {
      this.visitSimpleType(el.simpleType, el, XsdNodeType.Element, [...path, XsdNodeType.SimpleType], depth + 1, false);
    }
    if (el.complexType) {
      this.visitComplexType(el.complexType, el, XsdNodeType.Element, [...path, XsdNodeType.ComplexType], depth + 1, false);
    }
  }
  
  protected visitAttribute(
    attr: TopLevelAttribute | LocalAttribute,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    if (this.shouldVisit(XsdNodeType.Attribute) && this.callbacks.visitAttribute) {
      const result = this.callbacks.visitAttribute(attr, ctx);
      if (result === false) return;
    }
    
    // Visit annotation
    if (attr.annotation) {
      this.visitNode(XsdNodeType.Annotation, attr.annotation, attr, XsdNodeType.Attribute, [...path, XsdNodeType.Annotation], depth + 1, false);
    }
    
    // Visit inline simpleType
    if (attr.simpleType) {
      this.visitSimpleType(attr.simpleType, attr, XsdNodeType.Attribute, [...path, XsdNodeType.SimpleType], depth + 1, false);
    }
  }
  
  protected visitNamedGroup(
    grp: NamedGroup,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    if (this.shouldVisit(XsdNodeType.Group) && this.callbacks.visitGroup) {
      const result = this.callbacks.visitGroup(grp, ctx);
      if (result === false) return;
    }
    
    // Visit annotation
    if (grp.annotation) {
      this.visitNode(XsdNodeType.Annotation, grp.annotation, grp, XsdNodeType.Group, [...path, XsdNodeType.Annotation], depth + 1, false);
    }
    
    // Visit model group content
    if (grp.sequence) {
      this.visitModelGroup(XsdNodeType.Sequence, grp.sequence, grp, XsdNodeType.Group, [...path, XsdNodeType.Sequence], depth + 1);
    }
    if (grp.choice) {
      this.visitModelGroup(XsdNodeType.Choice, grp.choice, grp, XsdNodeType.Group, [...path, XsdNodeType.Choice], depth + 1);
    }
    if (grp.all) {
      this.visitAll(grp.all, grp, XsdNodeType.Group, [...path, XsdNodeType.All], depth + 1);
    }
  }
  
  protected visitNamedAttributeGroup(
    ag: NamedAttributeGroup,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number,
    isTopLevel: boolean
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, isTopLevel);
    
    if (this.shouldVisit(XsdNodeType.AttributeGroup) && this.callbacks.visitAttributeGroup) {
      const result = this.callbacks.visitAttributeGroup(ag, ctx);
      if (result === false) return;
    }
    
    // Visit annotation
    if (ag.annotation) {
      this.visitNode(XsdNodeType.Annotation, ag.annotation, ag, XsdNodeType.AttributeGroup, [...path, XsdNodeType.Annotation], depth + 1, false);
    }
    
    // Visit attributes
    if (ag.attribute) {
      for (let i = 0; i < ag.attribute.length; i++) {
        this.visitAttribute(ag.attribute[i], ag, XsdNodeType.AttributeGroup, [...path, XsdNodeType.Attribute, i], depth + 1, false);
      }
    }
    if (ag.attributeGroup) {
      for (let i = 0; i < ag.attributeGroup.length; i++) {
        this.visitNode(XsdNodeType.AttributeGroupRef, ag.attributeGroup[i], ag, XsdNodeType.AttributeGroup, [...path, XsdNodeType.AttributeGroup, i], depth + 1, false);
      }
    }
    if (ag.anyAttribute) {
      this.visitNode(XsdNodeType.AnyAttribute, ag.anyAttribute, ag, XsdNodeType.AttributeGroup, [...path, XsdNodeType.AnyAttribute], depth + 1, false);
    }
  }
  
  protected visitComplexContent(
    cc: ComplexContent,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, false);
    
    if (this.shouldVisit(XsdNodeType.ComplexContent) && this.callbacks.visitComplexContent) {
      const result = this.callbacks.visitComplexContent(cc, ctx);
      if (result === false) return;
    }
    
    // Visit extension or restriction
    if (cc.extension) {
      this.visitExtensionOrRestriction(XsdNodeType.Extension, cc.extension, cc, XsdNodeType.ComplexContent, [...path, XsdNodeType.Extension], depth + 1);
    }
    if (cc.restriction) {
      this.visitExtensionOrRestriction(XsdNodeType.Restriction, cc.restriction, cc, XsdNodeType.ComplexContent, [...path, XsdNodeType.Restriction], depth + 1);
    }
  }
  
  protected visitSimpleContent(
    sc: SimpleContent,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, false);
    
    if (this.shouldVisit(XsdNodeType.SimpleContent) && this.callbacks.visitSimpleContent) {
      const result = this.callbacks.visitSimpleContent(sc, ctx);
      if (result === false) return;
    }
    
    // Visit extension or restriction
    if (sc.extension) {
      this.visitNode(XsdNodeType.Extension, sc.extension, sc, XsdNodeType.SimpleContent, [...path, XsdNodeType.Extension], depth + 1, false);
      const ext = sc.extension;
      if (ext.attribute) {
        for (let i = 0; i < ext.attribute.length; i++) {
          this.visitAttribute(ext.attribute[i], ext, XsdNodeType.Extension, [...path, XsdNodeType.Extension, XsdNodeType.Attribute, i], depth + 2, false);
        }
      }
    }
    if (sc.restriction) {
      this.visitNode(XsdNodeType.Restriction, sc.restriction, sc, XsdNodeType.SimpleContent, [...path, XsdNodeType.Restriction], depth + 1, false);
    }
  }
  
  protected visitExtensionOrRestriction(
    type: XsdNodeType.Extension | XsdNodeType.Restriction,
    node: ComplexContentExtension | ComplexContentRestriction,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, false);
    
    if (type === XsdNodeType.Extension && this.shouldVisit(XsdNodeType.Extension) && this.callbacks.visitExtension) {
      const result = this.callbacks.visitExtension(node as ComplexContentExtension, ctx);
      if (result === false) return;
    }
    if (type === XsdNodeType.Restriction && this.shouldVisit(XsdNodeType.Restriction) && this.callbacks.visitRestriction) {
      const result = this.callbacks.visitRestriction(node as ComplexContentRestriction, ctx);
      if (result === false) return;
    }
    
    // Visit model group
    if (node.sequence) {
      this.visitModelGroup(XsdNodeType.Sequence, node.sequence, node, type, [...path, XsdNodeType.Sequence], depth + 1);
    }
    if (node.choice) {
      this.visitModelGroup(XsdNodeType.Choice, node.choice, node, type, [...path, XsdNodeType.Choice], depth + 1);
    }
    if (node.all) {
      this.visitAll(node.all, node, type, [...path, XsdNodeType.All], depth + 1);
    }
    if (node.group) {
      this.visitNode(XsdNodeType.GroupRef, node.group, node, type, [...path, XsdNodeType.Group], depth + 1, false);
    }
    
    // Visit attributes
    if (node.attribute) {
      for (let i = 0; i < node.attribute.length; i++) {
        this.visitAttribute(node.attribute[i], node, type, [...path, XsdNodeType.Attribute, i], depth + 1, false);
      }
    }
    if (node.attributeGroup) {
      for (let i = 0; i < node.attributeGroup.length; i++) {
        this.visitNode(XsdNodeType.AttributeGroupRef, node.attributeGroup[i], node, type, [...path, XsdNodeType.AttributeGroup, i], depth + 1, false);
      }
    }
    if (node.anyAttribute) {
      this.visitNode(XsdNodeType.AnyAttribute, node.anyAttribute, node, type, [...path, XsdNodeType.AnyAttribute], depth + 1, false);
    }
  }
  
  protected visitModelGroup(
    type: XsdNodeType.Sequence | XsdNodeType.Choice,
    group: ExplicitGroup,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, false);
    
    const visitorFn = type === XsdNodeType.Sequence ? this.callbacks.visitSequence : this.callbacks.visitChoice;
    if (this.shouldVisit(type) && visitorFn) {
      const result = visitorFn(group, ctx);
      if (result === false) return;
    }
    
    // Visit elements
    if (group.element) {
      for (let i = 0; i < group.element.length; i++) {
        this.visitElement(group.element[i], group, type, [...path, XsdNodeType.Element, i], depth + 1, false);
      }
    }
    
    // Visit nested groups
    if (group.group) {
      for (let i = 0; i < group.group.length; i++) {
        this.visitNode(XsdNodeType.GroupRef, group.group[i], group, type, [...path, XsdNodeType.Group, i], depth + 1, false);
      }
    }
    
    // Visit nested sequence/choice
    if (group.sequence) {
      for (let i = 0; i < group.sequence.length; i++) {
        this.visitModelGroup(XsdNodeType.Sequence, group.sequence[i], group, type, [...path, XsdNodeType.Sequence, i], depth + 1);
      }
    }
    if (group.choice) {
      for (let i = 0; i < group.choice.length; i++) {
        this.visitModelGroup(XsdNodeType.Choice, group.choice[i], group, type, [...path, XsdNodeType.Choice, i], depth + 1);
      }
    }
    
    // Visit any wildcards
    if (group.any) {
      for (let i = 0; i < group.any.length; i++) {
        this.visitNode(XsdNodeType.Any, group.any[i], group, type, [...path, XsdNodeType.Any, i], depth + 1, false);
      }
    }
  }
  
  protected visitAll(
    all: All,
    parent: unknown,
    parentType: XsdNodeType,
    path: (string | number)[],
    depth: number
  ): void {
    if (this.maxDepth >= 0 && depth > this.maxDepth) return;
    
    const ctx = this.createContext(parent, parentType, path, depth, false);
    
    if (this.shouldVisit(XsdNodeType.All) && this.callbacks.visitAll) {
      const result = this.callbacks.visitAll(all, ctx);
      if (result === false) return;
    }
    
    // Visit elements
    if (all.element) {
      for (let i = 0; i < all.element.length; i++) {
        this.visitElement(all.element[i], all, XsdNodeType.All, [...path, XsdNodeType.Element, i], depth + 1, false);
      }
    }
    
    // Visit any wildcards
    if (all.any) {
      for (let i = 0; i < all.any.length; i++) {
        this.visitNode(XsdNodeType.Any, all.any[i], all, XsdNodeType.All, [...path, XsdNodeType.Any, i], depth + 1, false);
      }
    }
    
    // Visit group refs
    if (all.group) {
      for (let i = 0; i < all.group.length; i++) {
        this.visitNode(XsdNodeType.GroupRef, all.group[i], all, XsdNodeType.All, [...path, XsdNodeType.Group, i], depth + 1, false);
      }
    }
  }
}

// =============================================================================
// Convenience Function (backward compatible)
// =============================================================================

/**
 * Visit all nodes in a schema using the visitor pattern.
 * This is a convenience wrapper around SchemaTraverser.
 */
export function visitSchema(
  schema: Schema,
  visitor: SchemaVisitorCallbacks,
  options: VisitorOptions = {}
): void {
  new SchemaTraverser(schema, visitor, options).traverse();
}

// =============================================================================
// Generator-based iteration
// =============================================================================

export interface VisitedNode {
  type: XsdNodeType;
  node: unknown;
  context: VisitorContext;
}

/**
 * Generator-based iteration over all nodes
 */
export function* walkSchemaNodes(
  schema: Schema,
  options: VisitorOptions = {}
): Generator<VisitedNode> {
  const nodes: VisitedNode[] = [];
  
  const collectingVisitor: SchemaVisitorCallbacks = {
    visitSchema: (node, ctx) => { nodes.push({ type: XsdNodeType.Schema, node, context: ctx }); },
    visitComplexType: (node, ctx) => { nodes.push({ type: XsdNodeType.ComplexType, node, context: ctx }); },
    visitSimpleType: (node, ctx) => { nodes.push({ type: XsdNodeType.SimpleType, node, context: ctx }); },
    visitElement: (node, ctx) => { nodes.push({ type: XsdNodeType.Element, node, context: ctx }); },
    visitAttribute: (node, ctx) => { nodes.push({ type: XsdNodeType.Attribute, node, context: ctx }); },
    visitGroup: (node, ctx) => { nodes.push({ type: XsdNodeType.Group, node, context: ctx }); },
    visitGroupRef: (node, ctx) => { nodes.push({ type: XsdNodeType.GroupRef, node, context: ctx }); },
    visitAttributeGroup: (node, ctx) => { nodes.push({ type: XsdNodeType.AttributeGroup, node, context: ctx }); },
    visitAttributeGroupRef: (node, ctx) => { nodes.push({ type: XsdNodeType.AttributeGroupRef, node, context: ctx }); },
    visitSequence: (node, ctx) => { nodes.push({ type: XsdNodeType.Sequence, node, context: ctx }); },
    visitChoice: (node, ctx) => { nodes.push({ type: XsdNodeType.Choice, node, context: ctx }); },
    visitAll: (node, ctx) => { nodes.push({ type: XsdNodeType.All, node, context: ctx }); },
    visitComplexContent: (node, ctx) => { nodes.push({ type: XsdNodeType.ComplexContent, node, context: ctx }); },
    visitSimpleContent: (node, ctx) => { nodes.push({ type: XsdNodeType.SimpleContent, node, context: ctx }); },
    visitExtension: (node, ctx) => { nodes.push({ type: XsdNodeType.Extension, node, context: ctx }); },
    visitRestriction: (node, ctx) => { nodes.push({ type: XsdNodeType.Restriction, node, context: ctx }); },
    visitList: (node, ctx) => { nodes.push({ type: XsdNodeType.List, node, context: ctx }); },
    visitUnion: (node, ctx) => { nodes.push({ type: XsdNodeType.Union, node, context: ctx }); },
    visitAnnotation: (node, ctx) => { nodes.push({ type: XsdNodeType.Annotation, node, context: ctx }); },
    visitImport: (node, ctx) => { nodes.push({ type: XsdNodeType.Import, node, context: ctx }); },
    visitInclude: (node, ctx) => { nodes.push({ type: XsdNodeType.Include, node, context: ctx }); },
    visitAny: (node, ctx) => { nodes.push({ type: XsdNodeType.Any, node, context: ctx }); },
    visitAnyAttribute: (node, ctx) => { nodes.push({ type: XsdNodeType.AnyAttribute, node, context: ctx }); },
  };
  
  visitSchema(schema, collectingVisitor, options);
  
  for (const node of nodes) {
    yield node;
  }
}
