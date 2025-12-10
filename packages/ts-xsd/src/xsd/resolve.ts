/**
 * Schema Resolver
 * 
 * Resolves a schema with all its imports, includes, extensions, and substitution groups
 * into a single self-contained schema. This makes codegen straightforward - no need to
 * track cross-schema dependencies.
 * 
 * Uses the SchemaTraverser for OO traversal with real W3C XSD types.
 * 
 * Features:
 * - Merges types from $imports (xs:import)
 * - Expands complexContent/extension - flattens inheritance
 * - Expands substitutionGroup - replaces abstract element refs with concrete elements
 */

import type {
  Schema,
  TopLevelComplexType,
  TopLevelSimpleType,
  TopLevelElement,
  NamedGroup,
  NamedAttributeGroup,
  LocalElement,
  LocalAttribute,
  ExplicitGroup,
  All,
} from './types';
import { SchemaTraverser, stripNsPrefix } from './traverser';

/** Options for schema resolution */
export interface ResolveOptions {
  /** Resolve xs:import - merge types from imported schemas (default: true) */
  resolveImports?: boolean;
  /** Resolve xs:include - merge content from included schemas (default: true) */
  resolveIncludes?: boolean;
  /** Expand complexContent/extension - flatten inheritance (default: true) */
  expandExtensions?: boolean;
  /** Expand substitutionGroup - replace abstract refs with concrete elements (default: true) */
  expandSubstitutions?: boolean;
  /** Keep original $imports array for reference (default: false) */
  keepImportsRef?: boolean;
}

// =============================================================================
// Schema Collector - Traverser that collects all schema components
// =============================================================================

/**
 * Collects all schema components into Maps for resolution.
 */
class SchemaCollector extends SchemaTraverser {
  readonly complexTypes = new Map<string, TopLevelComplexType>();
  readonly simpleTypes = new Map<string, TopLevelSimpleType>();
  readonly elements = new Map<string, TopLevelElement>();
  readonly groups = new Map<string, NamedGroup>();
  readonly attributeGroups = new Map<string, NamedAttributeGroup>();
  readonly substitutionGroups = new Map<string, TopLevelElement[]>();
  readonly xmlns = new Map<string, string>();
  
  protected override onEnterSchema(schema: Schema): void {
    if (schema.$xmlns) {
      for (const [prefix, uri] of Object.entries(schema.$xmlns)) {
        if (!this.xmlns.has(prefix)) {
          this.xmlns.set(prefix, uri);
        }
      }
    }
  }
  
  protected override onComplexType(ct: TopLevelComplexType): void {
    // First one wins (root schema takes precedence)
    if (!this.complexTypes.has(ct.name)) {
      this.complexTypes.set(ct.name, ct);
    }
  }
  
  protected override onSimpleType(st: TopLevelSimpleType): void {
    if (!this.simpleTypes.has(st.name)) {
      this.simpleTypes.set(st.name, st);
    }
  }
  
  protected override onElement(element: TopLevelElement): void {
    if (!this.elements.has(element.name)) {
      this.elements.set(element.name, element);
    }
    
    // Track substitution groups
    if (element.substitutionGroup) {
      const abstractName = stripNsPrefix(element.substitutionGroup);
      const existing = this.substitutionGroups.get(abstractName) ?? [];
      existing.push(element);
      this.substitutionGroups.set(abstractName, existing);
    }
  }
  
  protected override onGroup(group: NamedGroup): void {
    if (!this.groups.has(group.name)) {
      this.groups.set(group.name, group);
    }
  }
  
  protected override onAttributeGroup(group: NamedAttributeGroup): void {
    if (!this.attributeGroups.has(group.name)) {
      this.attributeGroups.set(group.name, group);
    }
  }
}

// =============================================================================
// Main Resolution Function
// =============================================================================

/**
 * Resolve a schema by merging all imports/includes and expanding all references.
 * Returns a new self-contained schema with no external dependencies.
 */
export function resolveSchema(schema: Schema, options: ResolveOptions = {}): Schema {
  const {
    resolveImports = true,
    resolveIncludes = true,
    expandExtensions = true,
    expandSubstitutions = true,
    keepImportsRef = false,
  } = options;

  // Use traverser to collect all types
  const collector = new SchemaCollector();
  collector.traverse(schema, {
    includeImports: resolveImports,
    includeIncludes: resolveIncludes,
  });

  // Expand extensions if requested
  let resolvedComplexTypes = Array.from(collector.complexTypes.values());
  if (expandExtensions) {
    resolvedComplexTypes = resolvedComplexTypes.map(ct => 
      expandComplexTypeExtension(ct, collector.complexTypes)
    );
  }

  // Expand substitution groups in complex types if requested
  if (expandSubstitutions) {
    resolvedComplexTypes = resolvedComplexTypes.map(ct =>
      expandSubstitutionGroupsInType(ct, collector.elements, collector.substitutionGroups)
    );
  }

  // Build resolved schema
  const resolved: Record<string, unknown> = {
    targetNamespace: schema.targetNamespace,
    $filename: schema.$filename,
    $xmlns: collector.xmlns.size > 0 
      ? Object.fromEntries(collector.xmlns) 
      : schema.$xmlns,
  };
  
  // Add collected content (only if non-empty)
  if (collector.elements.size > 0) {
    resolved.element = Array.from(collector.elements.values());
  }
  if (resolvedComplexTypes.length > 0) {
    resolved.complexType = resolvedComplexTypes;
  }
  if (collector.simpleTypes.size > 0) {
    resolved.simpleType = Array.from(collector.simpleTypes.values());
  }
  if (collector.groups.size > 0) {
    resolved.group = Array.from(collector.groups.values());
  }
  if (collector.attributeGroups.size > 0) {
    resolved.attributeGroup = Array.from(collector.attributeGroups.values());
  }

  // Optionally keep imports reference
  if (keepImportsRef && schema.$imports) {
    resolved.$imports = schema.$imports;
  }

  return resolved as Schema;
}

// =============================================================================
// Extension Expansion
// =============================================================================

/**
 * Expand complexContent/extension by merging base type properties.
 */
function expandComplexTypeExtension(
  ct: TopLevelComplexType,
  allTypes: Map<string, TopLevelComplexType>
): TopLevelComplexType {
  const extension = ct.complexContent?.extension;
  if (!extension?.base) return ct;

  // Collect elements from base type and extension
  const mergedElements: LocalElement[] = [];
  const mergedAttributes: LocalAttribute[] = [];

  // Get base type elements
  const baseName = stripNsPrefix(extension.base);
  const baseType = allTypes.get(baseName);
  if (baseType) {
    // Recursively expand base type first
    const expandedBase = expandComplexTypeExtension(baseType, allTypes);
    
    // Collect elements from base
    collectElementsFromType(expandedBase, mergedElements);
    
    // Collect attributes from base
    if (expandedBase.attribute) {
      mergedAttributes.push(...expandedBase.attribute);
    }
  }

  // Add extension elements
  collectElementsFromGroup(extension.sequence, mergedElements);
  collectElementsFromGroup(extension.choice, mergedElements);
  collectElementsFromGroup(extension.all, mergedElements);
  
  // Add extension attributes
  if (extension.attribute) {
    mergedAttributes.push(...extension.attribute);
  }

  // Build flattened type
  const flattened: Record<string, unknown> = {
    name: ct.name,
  };

  if (mergedElements.length > 0) {
    flattened.all = { element: mergedElements };
  }

  if (mergedAttributes.length > 0) {
    flattened.attribute = mergedAttributes;
  }

  // Copy other properties (excluding complexContent which we've flattened)
  for (const [key, value] of Object.entries(ct)) {
    if (!['name', 'complexContent', 'all', 'sequence', 'choice', 'attribute'].includes(key)) {
      flattened[key] = value;
    }
  }

  return flattened as TopLevelComplexType;
}

/**
 * Collect elements from a complex type's content model.
 */
function collectElementsFromType(ct: TopLevelComplexType, elements: LocalElement[]): void {
  collectElementsFromGroup(ct.sequence, elements);
  collectElementsFromGroup(ct.choice, elements);
  collectElementsFromGroup(ct.all, elements);
}

/**
 * Collect elements from a group (sequence/choice/all).
 */
function collectElementsFromGroup(group: ExplicitGroup | All | undefined, elements: LocalElement[]): void {
  if (!group?.element) return;
  elements.push(...group.element);
}

// =============================================================================
// Substitution Group Expansion
// =============================================================================

/**
 * Expand substitution group references in a complex type.
 * Replaces abstract element refs with concrete substitute elements.
 */
function expandSubstitutionGroupsInType(
  ct: TopLevelComplexType,
  allElements: Map<string, TopLevelElement>,
  substitutionGroups: Map<string, TopLevelElement[]>
): TopLevelComplexType {
  let changed = false;
  const result = { ...ct } as Record<string, unknown>;

  // Process sequence
  if (ct.sequence) {
    const expanded = expandSubstitutionGroupsInGroup(ct.sequence, allElements, substitutionGroups);
    if (expanded !== ct.sequence) {
      result.sequence = expanded;
      changed = true;
    }
  }

  // Process all
  if (ct.all) {
    const expanded = expandSubstitutionGroupsInGroup(ct.all, allElements, substitutionGroups);
    if (expanded !== ct.all) {
      result.all = expanded;
      changed = true;
    }
  }

  // Process choice
  if (ct.choice) {
    const expanded = expandSubstitutionGroupsInGroup(ct.choice, allElements, substitutionGroups);
    if (expanded !== ct.choice) {
      result.choice = expanded;
      changed = true;
    }
  }

  return changed ? (result as TopLevelComplexType) : ct;
}

/**
 * Expand substitution groups in a group (sequence/all/choice).
 */
function expandSubstitutionGroupsInGroup(
  group: ExplicitGroup | All,
  allElements: Map<string, TopLevelElement>,
  substitutionGroups: Map<string, TopLevelElement[]>
): ExplicitGroup | All {
  if (!group.element) return group;

  const expandedElements: LocalElement[] = [];
  let hasChanges = false;

  for (const el of group.element) {
    // Check if this is a ref to an abstract element
    if (el.ref) {
      const refName = stripNsPrefix(el.ref);
      const refElement = allElements.get(refName);
      
      if (refElement?.abstract) {
        // This is an abstract element - expand to substitutes
        const substitutes = substitutionGroups.get(refName);
        if (substitutes && substitutes.length > 0) {
          // Add each substitute as a separate optional element
          for (const sub of substitutes) {
            expandedElements.push({
              name: sub.name,
              type: sub.type,
              minOccurs: el.minOccurs ?? 0,
              maxOccurs: el.maxOccurs,
            });
          }
          hasChanges = true;
          continue;
        }
      }
    }
    
    // Keep original element
    expandedElements.push(el);
  }

  if (!hasChanges) return group;

  return {
    ...group,
    element: expandedElements,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get all substitutes for an abstract element.
 */
export function getSubstitutes(
  abstractElementName: string,
  schema: Schema
): TopLevelElement[] {
  const collector = new SchemaCollector();
  collector.traverse(schema);
  return collector.substitutionGroups.get(abstractElementName) ?? [];
}

/**
 * Merge included schema content recursively into the main schema.
 * This resolves xs:include by merging element, complexType, simpleType, group, attributeGroup
 * from $includes schemas directly into the main schema.
 * 
 * @param schema - Schema with $includes array of linked schemas
 * @returns New schema with included content merged, no $includes or include properties
 */
export function mergeIncludes(schema: Schema): Schema {
  if (!schema.$includes || schema.$includes.length === 0) {
    // No includes, return schema without include property
    const { include: _, ...rest } = schema as Record<string, unknown>;
    return rest as Schema;
  }

  // Use traverser to collect all content from schema + $includes only (not $imports)
  const collector = new SchemaCollector();
  collector.traverse(schema, {
    includeImports: false,
    includeIncludes: true,
  });

  // Build result without include/$includes
  const result: Record<string, unknown> = {
    targetNamespace: schema.targetNamespace,
    $filename: schema.$filename,
    $xmlns: collector.xmlns.size > 0 
      ? Object.fromEntries(collector.xmlns) 
      : schema.$xmlns,
  };
  
  // Add collected content (only if non-empty)
  if (collector.elements.size > 0) {
    result.element = Array.from(collector.elements.values());
  }
  if (collector.complexTypes.size > 0) {
    result.complexType = Array.from(collector.complexTypes.values());
  }
  if (collector.simpleTypes.size > 0) {
    result.simpleType = Array.from(collector.simpleTypes.values());
  }
  if (collector.groups.size > 0) {
    result.group = Array.from(collector.groups.values());
  }
  if (collector.attributeGroups.size > 0) {
    result.attributeGroup = Array.from(collector.attributeGroups.values());
  }
  
  // Preserve $imports if present
  if (schema.$imports) {
    result.$imports = schema.$imports;
  }

  return result as Schema;
}
