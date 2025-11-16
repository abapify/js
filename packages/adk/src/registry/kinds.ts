/**
 * ADK Object Kinds
 *
 * Centralized object type definitions:
 * - Kind enum (internal ADK identifier)
 * - ADT type mappings (SAP system identifiers)
 */

export enum Kind {
  Interface = 'Interface',
  Class = 'Class',
  Domain = 'Domain',
  Package = 'Package',
}

/**
 * Central mapping: ADT Type → Kind
 *
 * Single source of truth for all object type mappings.
 * Add new object types here.
 */
export const ADT_TYPE_TO_KIND: Record<string, Kind> = {
  'CLAS/OC': Kind.Class,
  'CLAS/OI': Kind.Class, // Class implementation
  'INTF/OI': Kind.Interface,
  'DOMA/DD': Kind.Domain,
  'DEVC/K': Kind.Package,
} as const;

/**
 * Reverse mapping: Kind → primary ADT Type
 */
export const KIND_TO_ADT_TYPE: Record<Kind, string> = {
  [Kind.Class]: 'CLAS/OC',
  [Kind.Interface]: 'INTF/OI',
  [Kind.Domain]: 'DOMA/DD',
  [Kind.Package]: 'DEVC/K',
} as const;
