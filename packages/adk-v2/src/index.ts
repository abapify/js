/**
 * ADK v2 - ABAP Development Kit
 * 
 * Facade over ADT client providing stable ABAP object interfaces.
 * 
 * Usage:
 *   import { createAdk, type AbapPackage } from '@abapify/adk-v2';
 *   
 *   const adk = createAdk(client);
 *   const pkg = await adk.getPackage('ZPACKAGE');
 *   const objects = await pkg.getObjects();
 */

// Base types
export type { AbapObject } from './base/types';
export type { AdkContext } from './base/context';

// Object types (interfaces only - implementations are internal)
export type { 
  AbapPackage, 
  PackageType,
  PackageAttributes,
  ObjectReference,
  ApplicationComponent,
  SoftwareComponent,
  TransportLayer,
  TransportConfig,
} from './objects/repository/devc';

// Factory
export type { AdkFactory } from './factory';
export { createAdk } from './factory';
