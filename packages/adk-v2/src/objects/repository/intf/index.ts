/**
 * INTF - ABAP Interface
 */

// Public types
export type { AbapInterface } from './intf.types';

// ADK object (internal implementation)
export { AdkInterface, AbapInterfaceModel } from './intf.model';

// Schema-inferred type for raw API response
export type { InterfaceXml } from './intf.model';
