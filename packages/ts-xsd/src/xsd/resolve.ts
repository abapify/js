/**
 * Schema Resolver
 * 
 * Resolves a schema with all its imports, includes, extensions, and substitution groups
 * into a single self-contained schema. This makes codegen straightforward - no need to
 * track cross-schema dependencies.
 * 
 * Uses the walker module for traversal to avoid code duplication.
 * 
 * Features:
 * - Merges types from $imports (xs:import)
 * - Expands complexContent/extension - flattens inheritance
 * - Expands substitutionGroup - replaces abstract element refs with concrete elements
 */

import type { SchemaLike, ComplexTypeLike, ElementLike, SimpleTypeLike, GroupLike, AttributeLike } from '../infer/types';
import { walkComplexTypes, walkSimpleTypes, walkTopLevelElements, walkElements } from '../walker';

// Local type aliases for types not exported from infer/types
type AttributeGroupLike = { readonly name?: string; readonly [key: string]: unknown };
type GroupContentLike = { readonly element?: readonly ElementLike[]; readonly [key: string]: unknown };

/** Options for schema resolution */
export interface ResolveOptions {
  /** Resolve xs:import - merge types from imported schemas (default: true) */
  resolveImports?: boolean;
  /** Resolve xs:include - merge content from included schemas (default: false) 
   *  When true, $includes content is merged directly into the schema */
  resolveIncludes?: boolean;
  /** Expand complexContent/extension - flatten inheritance (default: true) */
  expandExtensions?: boolean;
  /** Expand substitutionGroup - replace abstract refs with concrete elements (default: true) */
  expandSubstitutions?: boolean;
  /** Keep original $imports array for reference (default: false) */
  keepImportsRef?: boolean;
}

/**
 * Strip namespace prefix from a QName (e.g., "xs:string" -> "string")
 */
function stripNsPrefix(qname: string): string {
  const colonIndex = qname.indexOf(':');
  return colonIndex >= 0 ? qname.slice(colonIndex + 1) : qname;
}

/**
 * Resolve a schema by merging all imports/includes and expanding all references.
 * Returns a new self-contained schema with no external dependencies.
 */
export function resolveSchema(schema: SchemaLike, options: ResolveOptions = {}): SchemaLike {
  const {
    resolveImports = true,
    expandExtensions = true,
    expandSubstitutions = true,
    keepImportsRef = false,
  } = options;

  // Use walker to collect all types from schema and imports
  // NOTE: xs:include content should already be merged by the linking phase
  const allComplexTypes = new Map<string, ComplexTypeLike>();
  const allSimpleTypes = new Map<string, SimpleTypeLike>();
  const allElements = new Map<string, ElementLike>();
  const allGroups = new Map<string, GroupLike>();
  const allAttributeGroups = new Map<string, AttributeGroupLike>();
  
  // Track substitution groups: abstractElementName -> [concreteElements]
  const substitutionGroups = new Map<string, ElementLike[]>();

  // Use walkers to collect types (they handle $imports recursion)
  if (resolveImports) {
    // Collect complex types
    for (const { ct } of walkComplexTypes(schema)) {
      if (ct.name && !allComplexTypes.has(ct.name)) {
        allComplexTypes.set(ct.name, ct);
      }
    }

    // Collect simple types
    for (const { st } of walkSimpleTypes(schema)) {
      if (st.name && !allSimpleTypes.has(st.name)) {
        allSimpleTypes.set(st.name, st);
      }
    }

    // Collect elements and track substitution groups
    for (const { element } of walkTopLevelElements(schema)) {
      if (element.name) {
        if (!allElements.has(element.name)) {
          allElements.set(element.name, element);
        }
        
        // Track substitution groups
        if (element.substitutionGroup) {
          const abstractName = stripNsPrefix(element.substitutionGroup);
          const existing = substitutionGroups.get(abstractName) ?? [];
          existing.push(element);
          substitutionGroups.set(abstractName, existing);
        }
      }
    }
  } else {
    // Only collect from current schema (no imports)
    if (schema.complexType && Array.isArray(schema.complexType)) {
      for (const ct of schema.complexType) {
        if (ct.name) allComplexTypes.set(ct.name, ct);
      }
    }
    if (schema.simpleType && Array.isArray(schema.simpleType)) {
      for (const st of schema.simpleType) {
        if (st.name) allSimpleTypes.set(st.name, st);
      }
    }
    if (schema.element) {
      for (const el of schema.element) {
        if (el.name) {
          allElements.set(el.name, el);
          if (el.substitutionGroup) {
            const abstractName = stripNsPrefix(el.substitutionGroup);
            const existing = substitutionGroups.get(abstractName) ?? [];
            existing.push(el);
            substitutionGroups.set(abstractName, existing);
          }
        }
      }
    }
  }

  // Collect groups and attribute groups (walker doesn't have these yet)
  collectGroups(schema, allGroups, allAttributeGroups, resolveImports);

  // Expand extensions if requested
  let resolvedComplexTypes = Array.from(allComplexTypes.values());
  if (expandExtensions) {
    resolvedComplexTypes = resolvedComplexTypes.map(ct => 
      expandComplexTypeExtension(ct, allComplexTypes, schema)
    );
  }

  // Expand substitution groups in complex types if requested
  if (expandSubstitutions) {
    resolvedComplexTypes = resolvedComplexTypes.map(ct =>
      expandSubstitutionGroupsInType(ct, allElements, substitutionGroups)
    );
  }

  // Build resolved schema
  const resolved: Record<string, unknown> = {
    targetNamespace: schema.targetNamespace,
    $filename: schema.$filename,
    $xmlns: schema.$xmlns,
    element: Array.from(allElements.values()),
    complexType: resolvedComplexTypes,
    simpleType: Array.from(allSimpleTypes.values()),
    group: Array.from(allGroups.values()),
    attributeGroup: Array.from(allAttributeGroups.values()),
  };

  // Optionally keep imports reference
  if (keepImportsRef && schema.$imports) {
    resolved.$imports = schema.$imports;
  }

  // Clean up empty arrays
  if ((resolved.element as unknown[]).length === 0) delete resolved.element;
  if ((resolved.complexType as unknown[]).length === 0) delete resolved.complexType;
  if ((resolved.simpleType as unknown[]).length === 0) delete resolved.simpleType;
  if ((resolved.group as unknown[]).length === 0) delete resolved.group;
  if ((resolved.attributeGroup as unknown[]).length === 0) delete resolved.attributeGroup;

  return resolved as SchemaLike;
}

/**
 * Collect groups and attribute groups from schema and imports
 */
function collectGroups(
  schema: SchemaLike,
  allGroups: Map<string, GroupLike>,
  allAttributeGroups: Map<string, AttributeGroupLike>,
  resolveImports: boolean
): void {
  if (schema.group && Array.isArray(schema.group)) {
    for (const g of schema.group) {
      if (g.name && !allGroups.has(g.name)) {
        allGroups.set(g.name, g as GroupLike);
      }
    }
  }
  if (schema.attributeGroup && Array.isArray(schema.attributeGroup)) {
    for (const ag of schema.attributeGroup as AttributeGroupLike[]) {
      if (ag.name && !allAttributeGroups.has(ag.name)) {
        allAttributeGroups.set(ag.name, ag);
      }
    }
  }
  
  if (resolveImports && schema.$imports) {
    for (const imported of schema.$imports) {
      collectGroups(imported, allGroups, allAttributeGroups, true);
    }
  }
}

/**
 * Expand complexContent/extension by merging base type properties.
 * Uses walkElements from walker to properly handle inheritance.
 */
function expandComplexTypeExtension(
  ct: ComplexTypeLike,
  allTypes: Map<string, ComplexTypeLike>,
  schema: SchemaLike
): ComplexTypeLike {
  const extension = ct.complexContent?.extension;
  if (!extension?.base) return ct;

  // Use walkElements to get all inherited + extension elements
  const mergedElements: ElementLike[] = [];
  const mergedAttributes: AttributeLike[] = [];

  // walkElements handles inheritance automatically
  for (const { element } of walkElements(ct, schema)) {
    mergedElements.push(element);
  }

  // Collect attributes from base and extension
  const baseName = stripNsPrefix(extension.base);
  const baseType = allTypes.get(baseName);
  if (baseType?.attribute) {
    mergedAttributes.push(...baseType.attribute);
  }
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
    if (key !== 'name' && key !== 'complexContent' && key !== 'all' && key !== 'sequence' && key !== 'attribute') {
      flattened[key] = value;
    }
  }

  return flattened as ComplexTypeLike;
}

/**
 * Expand substitution group references in a complex type.
 * Replaces abstract element refs with concrete substitute elements.
 */
function expandSubstitutionGroupsInType(
  ct: ComplexTypeLike,
  allElements: Map<string, ElementLike>,
  substitutionGroups: Map<string, ElementLike[]>
): ComplexTypeLike {
  // Process sequence
  if (ct.sequence) {
    const expanded = expandSubstitutionGroupsInGroup(ct.sequence, allElements, substitutionGroups);
    if (expanded !== ct.sequence) {
      return { ...ct, sequence: expanded } as ComplexTypeLike;
    }
  }

  // Process all
  if (ct.all) {
    const expanded = expandSubstitutionGroupsInGroup(ct.all, allElements, substitutionGroups);
    if (expanded !== ct.all) {
      return { ...ct, all: expanded } as ComplexTypeLike;
    }
  }

  // Process choice
  if (ct.choice) {
    const expanded = expandSubstitutionGroupsInGroup(ct.choice, allElements, substitutionGroups);
    if (expanded !== ct.choice) {
      return { ...ct, choice: expanded } as ComplexTypeLike;
    }
  }

  return ct;
}

/**
 * Expand substitution groups in a group (sequence/all/choice)
 */
function expandSubstitutionGroupsInGroup(
  group: GroupContentLike,
  allElements: Map<string, ElementLike>,
  substitutionGroups: Map<string, ElementLike[]>
): GroupContentLike {
  if (!group.element) return group;

  const expandedElements: ElementLike[] = [];
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
              minOccurs: el.minOccurs ?? '0',
              maxOccurs: el.maxOccurs,
            } as ElementLike);
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
  } as GroupContentLike;
}

/**
 * Get all substitutes for an abstract element.
 * Uses walkTopLevelElements to search schema and imports.
 */
export function getSubstitutes(
  abstractElementName: string,
  schema: SchemaLike
): ElementLike[] {
  const substitutes: ElementLike[] = [];
  
  for (const { element } of walkTopLevelElements(schema)) {
    if (element.substitutionGroup) {
      const subGroupName = stripNsPrefix(element.substitutionGroup);
      if (subGroupName === abstractElementName) {
        substitutes.push(element);
      }
    }
  }

  return substitutes;
}

/**
 * Collect groups and attribute groups from schema and its $includes (not $imports).
 */
function collectGroupsFromIncludes(
  schema: SchemaLike,
  allGroups: Map<string, GroupLike>,
  allAttributeGroups: Map<string, AttributeGroupLike>
): void {
  if (schema.group && Array.isArray(schema.group)) {
    for (const g of schema.group) {
      if (g.name && !allGroups.has(g.name)) {
        allGroups.set(g.name, g as GroupLike);
      }
    }
  }
  if (schema.attributeGroup && Array.isArray(schema.attributeGroup)) {
    for (const ag of schema.attributeGroup as AttributeGroupLike[]) {
      if (ag.name && !allAttributeGroups.has(ag.name)) {
        allAttributeGroups.set(ag.name, ag);
      }
    }
  }
  
  // Recurse into $includes only (not $imports - different namespace)
  const includes = (schema as { $includes?: readonly SchemaLike[] }).$includes;
  if (includes) {
    for (const included of includes) {
      collectGroupsFromIncludes(included, allGroups, allAttributeGroups);
    }
  }
}

/**
 * Merge included schema content recursively into the main schema.
 * This resolves xs:include by merging element, complexType, simpleType, group, attributeGroup
 * from $includes schemas directly into the main schema.
 * 
 * Uses the walker module to traverse $includes recursively.
 * Requires schemas to be pre-linked with $includes (similar to $imports).
 * 
 * @param schema - Schema with $includes array of linked schemas
 * @returns New schema with included content merged, no $includes or include properties
 */
export function mergeIncludes(schema: SchemaLike): SchemaLike {
  const includes = (schema as { $includes?: readonly SchemaLike[] }).$includes;
  if (!includes || includes.length === 0) {
    // No includes, return schema without include property
    const { include: _, ...rest } = schema as Record<string, unknown>;
    return rest as SchemaLike;
  }

  // Use walkers to collect all content from schema + $includes only (not $imports)
  // Walker handles recursive $includes traversal with includesOnly option
  const allElements: ElementLike[] = [];
  const allComplexTypes: ComplexTypeLike[] = [];
  const allSimpleTypes: SimpleTypeLike[] = [];
  const allGroups: GroupLike[] = [];
  const allAttributeGroups: AttributeGroupLike[] = [];
  
  // Collect elements (includesOnly: true skips $imports)
  for (const { element } of walkTopLevelElements(schema, { includesOnly: true })) {
    allElements.push(element);
  }
  
  // Collect complex types
  for (const { ct } of walkComplexTypes(schema, { includesOnly: true })) {
    allComplexTypes.push(ct);
  }
  
  // Collect simple types
  for (const { st } of walkSimpleTypes(schema, { includesOnly: true })) {
    allSimpleTypes.push(st);
  }
  
  // Collect groups and attribute groups
  // Note: walker doesn't have group walkers yet, use collectGroups with $includes recursion
  const groupMap = new Map<string, GroupLike>();
  const attrGroupMap = new Map<string, AttributeGroupLike>();
  collectGroupsFromIncludes(schema, groupMap, attrGroupMap);
  allGroups.push(...groupMap.values());
  allAttributeGroups.push(...attrGroupMap.values());
  
  // Merge $xmlns from all included schemas
  let mergedXmlns: Record<string, string> = {};
  const collectXmlns = (s: SchemaLike) => {
    if (s.$xmlns) {
      mergedXmlns = { ...mergedXmlns, ...s.$xmlns };
    }
    const inc = (s as { $includes?: readonly SchemaLike[] }).$includes;
    if (inc) {
      for (const included of inc) {
        collectXmlns(included);
      }
    }
  };
  collectXmlns(schema);

  // Build result without include/$includes
  const result: Record<string, unknown> = {
    targetNamespace: schema.targetNamespace,
    $filename: schema.$filename,
    $xmlns: Object.keys(mergedXmlns).length > 0 ? mergedXmlns : schema.$xmlns,
  };
  
  // Add collected content (only if non-empty)
  if (allElements.length > 0) result.element = allElements;
  if (allComplexTypes.length > 0) result.complexType = allComplexTypes;
  if (allSimpleTypes.length > 0) result.simpleType = allSimpleTypes;
  if (allGroups.length > 0) result.group = allGroups;
  if (allAttributeGroups.length > 0) result.attributeGroup = allAttributeGroups;
  
  // Preserve $imports if present
  if (schema.$imports) {
    result.$imports = schema.$imports;
  }

  return result as SchemaLike;
}
