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

// Custom schemas (from .xsd/custom/)
export * from './generated/custom';

// JSON schemas (Zod)
export * from './json';
