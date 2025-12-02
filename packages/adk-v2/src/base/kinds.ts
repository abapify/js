/**
 * ADK Object Kinds
 * 
 * Central registry of all ADK object types.
 * Import specific kinds for type-safe usage:
 * 
 * @example
 * import { TransportRequest } from '../base/kinds';
 * class AdkTransportRequest extends AdkObject<typeof TransportRequest> { ... }
 */

// CTS
export const TransportRequest = 'TransportRequest' as const;
export const TransportTask = 'TransportTask' as const;

// Repository Objects
export const Package = 'Package' as const;
export const Class = 'Class' as const;
export const Interface = 'Interface' as const;
export const FunctionGroup = 'FunctionGroup' as const;
export const FunctionModule = 'FunctionModule' as const;
export const Program = 'Program' as const;
export const Include = 'Include' as const;

// Data Dictionary
export const Table = 'Table' as const;
export const Structure = 'Structure' as const;
export const DataElement = 'DataElement' as const;
export const Domain = 'Domain' as const;
export const TableType = 'TableType' as const;

// Other
export const MessageClass = 'MessageClass' as const;
export const EnhancementSpot = 'EnhancementSpot' as const;

/** Union type of all ADK kinds */
export type AdkKind = 
  | typeof TransportRequest
  | typeof TransportTask
  | typeof Package
  | typeof Class
  | typeof Interface
  | typeof FunctionGroup
  | typeof FunctionModule
  | typeof Program
  | typeof Include
  | typeof Table
  | typeof Structure
  | typeof DataElement
  | typeof Domain
  | typeof TableType
  | typeof MessageClass
  | typeof EnhancementSpot;
