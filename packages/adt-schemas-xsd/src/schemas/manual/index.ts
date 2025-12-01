/**
 * Manual Schemas Index
 * 
 * Export all manually created schemas (not generated from XSD).
 * These are for ABAP XML format schemas without official XSD definitions.
 * 
 * Note: XSD-based manual schemas (like transportmanagment-single.xsd)
 * are now generated to src/schemas/generated/ alongside SAP schemas.
 */

export { default as transportfind } from './transportfind';
export { default as transportmanagmentCreate } from './transportmanagment-create';
