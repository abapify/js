/**
 * ADT Schemas Index
 * 
 * Flat exports for optimal tree-shaking.
 * 
 * Structure:
 *   generated/sap/    - SAP's original schemas (from SDK XSDs)
 *   generated/custom/ - Our extensions (discovery, transport variants, etc.)
 * 
 * Naming:
 *   - SAP schemas: original names (atom, templatelink, transportmanagment, etc.)
 *   - Custom schemas that extend SAP: suffixed names (atomExtended, etc.)
 *   - Custom-only schemas: original names (discovery, transportfind, etc.)
 */

// SAP schemas (from .xsd/sap/)
export * from './generated/sap';

// Custom schemas - non-conflicting names exported directly
export { default as discovery } from './generated/custom/discovery';
export { default as transportfind } from './generated/custom/transportfind';
export { default as transportmanagmentSingle } from './generated/custom/transportmanagment-single';
export { default as transportmanagmentCreate } from './generated/custom/transportmanagment-create';
