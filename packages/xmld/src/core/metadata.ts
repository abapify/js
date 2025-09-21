/**
 * Custom metadata storage and retrieval system
 * Zero dependencies - no reflect-metadata required
 */

import { type MetadataType } from './constants';

// Metadata storage interfaces
export interface ClassMetadata {
  isXMLClass?: boolean;
  xmlRoot?: string;
  namespace?: NamespaceInfo;
}

export interface PropertyMetadata {
  type?: MetadataType;
  name?: string;
  namespace?: NamespaceInfo;
  unwrap?: boolean;
  autoInstantiate?: Constructor;
  isArray?: boolean;
}

export interface NamespaceInfo {
  prefix: string;
  uri: string;
}

export type Constructor<T = any> = new (...args: any[]) => T;

// Custom metadata storage using WeakMaps (zero dependencies)
const CLASS_METADATA = new WeakMap<any, ClassMetadata>();
const PROPERTY_METADATA = new WeakMap<any, Map<string, PropertyMetadata>>();

// Global registry for XML class detection
const XML_CLASS_REGISTRY = new Map<string, Constructor>();

/**
 * Set metadata for a class
 */
export function setClassMetadata(target: any, metadata: ClassMetadata): void {
  const existing = CLASS_METADATA.get(target) || {};
  CLASS_METADATA.set(target, { ...existing, ...metadata });
}

/**
 * Get metadata for a class, including inherited metadata
 */
export function getClassMetadata(target: any): ClassMetadata | undefined {
  const allMetadata: ClassMetadata = {};

  // Traverse the prototype chain to collect metadata from all levels
  let currentPrototype = target;
  while (currentPrototype && currentPrototype !== Object.prototype) {
    const prototypeMetadata = CLASS_METADATA.get(currentPrototype);
    if (prototypeMetadata) {
      // Merge metadata, with derived class taking precedence
      if (
        prototypeMetadata.isXMLClass !== undefined &&
        allMetadata.isXMLClass === undefined
      ) {
        allMetadata.isXMLClass = prototypeMetadata.isXMLClass;
      }
      if (
        prototypeMetadata.xmlRoot !== undefined &&
        allMetadata.xmlRoot === undefined
      ) {
        allMetadata.xmlRoot = prototypeMetadata.xmlRoot;
      }
      if (
        prototypeMetadata.namespace !== undefined &&
        allMetadata.namespace === undefined
      ) {
        allMetadata.namespace = prototypeMetadata.namespace;
      }
    }
    currentPrototype = Object.getPrototypeOf(currentPrototype);
  }

  return Object.keys(allMetadata).length > 0 ? allMetadata : undefined;
}

/**
 * Set metadata for a property
 */
export function setPropertyMetadata(
  target: any,
  propertyKey: string,
  metadata: PropertyMetadata
): void {
  let propertyMap = PROPERTY_METADATA.get(target);
  if (!propertyMap) {
    propertyMap = new Map();
    PROPERTY_METADATA.set(target, propertyMap);
  }

  const existing = propertyMap.get(propertyKey) || {};
  propertyMap.set(propertyKey, { ...existing, ...metadata });
}

/**
 * Get metadata for a property
 */
export function getPropertyMetadata(
  target: any,
  propertyKey: string
): PropertyMetadata | undefined {
  const propertyMap = PROPERTY_METADATA.get(target);
  return propertyMap?.get(propertyKey);
}

/**
 * Get all property metadata for a class, including inherited properties
 */
export function getAllPropertyMetadata(
  target: any
): Map<string, PropertyMetadata> {
  const allMetadata = new Map<string, PropertyMetadata>();

  // Traverse the prototype chain to collect metadata from all levels
  let currentPrototype = target;
  while (currentPrototype && currentPrototype !== Object.prototype) {
    const prototypeMetadata = PROPERTY_METADATA.get(currentPrototype);
    if (prototypeMetadata) {
      // Add properties from this level, but don't override existing ones
      // (derived class properties take precedence over base class properties)
      for (const [key, metadata] of prototypeMetadata) {
        if (!allMetadata.has(key)) {
          allMetadata.set(key, metadata);
        }
      }
    }
    currentPrototype = Object.getPrototypeOf(currentPrototype);
  }

  return allMetadata;
}

/**
 * Register a class as XML-enabled in the global registry
 */
export function registerXMLClass(
  className: string,
  constructor: Constructor
): void {
  XML_CLASS_REGISTRY.set(className, constructor);
}

/**
 * Check if a class is registered as XML-enabled
 */
export function isRegisteredXMLClass(className: string): boolean {
  return XML_CLASS_REGISTRY.has(className);
}

/**
 * Get a registered XML class constructor
 */
export function getRegisteredXMLClass(
  className: string
): Constructor | undefined {
  return XML_CLASS_REGISTRY.get(className);
}

/**
 * Check if a class has XML metadata (is decorated with @xml)
 */
export function isXMLClass(constructor: Constructor): boolean {
  const metadata = getClassMetadata(constructor.prototype);
  return metadata?.isXMLClass === true;
}

/**
 * Get all registered XML classes (for debugging)
 */
export function getAllRegisteredXMLClasses(): Map<string, Constructor> {
  return new Map(XML_CLASS_REGISTRY);
}

/**
 * Clear all metadata (for testing)
 */
export function clearAllMetadata(): void {
  XML_CLASS_REGISTRY.clear();
  // Note: WeakMaps cannot be cleared, but they'll be garbage collected
  // when their keys are no longer referenced
}
