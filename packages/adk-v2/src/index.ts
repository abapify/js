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
export { AdkObject, type LockHandle } from './base/model';

// Global context management
export { 
  initializeAdk, 
  getGlobalContext, 
  isAdkInitialized, 
  resetAdk,
  tryGetGlobalContext,
} from './base/global-context';

// Package types and class
export type { 
  AbapPackage, 
  PackageType,
  PackageAttributes,
  ObjectReference,
  ApplicationComponent,
  SoftwareComponent,
  TransportLayer,
  TransportConfig,
  PackageXml,  // Raw API response type (inferred from schema)
} from './objects/repository/devc';
export { AdkPackage } from './objects/repository/devc';

// CTS types
export type {
  TransportData,
  TransportRequestData,
  TransportTaskData,
  TransportObjectData,
  TransportTask,
  TransportObject,
  TransportStatus,
  TransportType,
  TransportCreateOptions,
  TransportUpdateOptions,
  ReleaseResult,
} from './objects/cts';
export { AdkTransportItem, AdkTransportRequest, AdkTransportTask, AdkTransportObject } from './objects/cts';

// Factory
export type { AdkFactory } from './factory';
export { createAdk } from './factory';
