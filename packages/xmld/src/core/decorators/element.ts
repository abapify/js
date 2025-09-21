/**
 * @element decorator - Mark a property as an XML element with auto-instantiation support
 */

import 'reflect-metadata';
import { METADATA_TYPES } from '../constants';
import {
  setPropertyMetadata,
  getClassMetadata,
  type Constructor,
} from '../metadata';

/**
 * Options for @element decorator
 */
export interface ElementOptions {
  /** Explicit type for auto-instantiation */
  type?: Constructor;
  /** Whether this is an array of the specified type */
  array?: boolean;
  /** Custom element name (defaults to property name) */
  name?: string;
}

/**
 * @element - Explicitly mark a property as an XML element
 * Supports explicit type hints for reliable auto-instantiation
 */
export function element(options?: ElementOptions): PropertyDecorator;
export function element(target: any, propertyKey: string | symbol): void;
export function element(
  optionsOrTarget?: ElementOptions | any,
  propertyKey?: string | symbol
): PropertyDecorator | void {
  // Handle both decorator syntaxes: @element and @element(options)
  if (propertyKey !== undefined) {
    // Direct usage: @element
    setupElement(optionsOrTarget, String(propertyKey), {});
  } else {
    // With options: @element({ type: SomeClass })
    const options = (optionsOrTarget as ElementOptions) || {};
    return function (target: any, key: string | symbol) {
      setupElement(target, String(key), options);
    };
  }
}

/**
 * Set up element metadata and auto-instantiation
 */
function setupElement(
  target: any,
  propertyKey: string,
  options: ElementOptions
): void {
  // Set basic element metadata
  setPropertyMetadata(target, propertyKey, {
    type: METADATA_TYPES.ELEMENT,
    name: options.name || propertyKey,
  });

  // Determine the type for auto-instantiation
  let typeToUse = options.type;
  let isArray = options.array || false;

  // If no explicit type provided, try to infer from TypeScript metadata
  if (!typeToUse) {
    const inferredResult = inferTypeFromMetadata(target, propertyKey);
    if (inferredResult) {
      typeToUse = inferredResult.type;
      isArray = inferredResult.isArray;
    }
  }

  // Set up auto-instantiation if we have a type (explicit or inferred)
  if (typeToUse) {
    setupAutoInstantiationWithType(target, propertyKey, typeToUse, isArray);
  }
}

/**
 * Interface for inferred type information
 */
interface InferredTypeInfo {
  type: Constructor;
  isArray: boolean;
}

/**
 * Infer type information from TypeScript decorator metadata
 * Uses reflect-metadata to extract type information automatically
 */
function inferTypeFromMetadata(
  target: any,
  propertyKey: string
): InferredTypeInfo | null {
  try {
    // Get the design type from TypeScript's emitted metadata
    const designType = Reflect.getMetadata('design:type', target, propertyKey);

    if (!designType) {
      return null;
    }

    // Handle Array types
    if (designType === Array) {
      // For arrays, we need to look at the paramtypes or use other heuristics
      // Unfortunately, TypeScript doesn't emit generic type parameters in metadata
      // This is a limitation of the current decorator metadata system
      return null;
    }

    // Handle primitive types (string, number, boolean) - no auto-instantiation needed
    if (
      designType === String ||
      designType === Number ||
      designType === Boolean
    ) {
      return null;
    }

    // Check if the inferred type is an @xml decorated class
    const classMetadata = getClassMetadata(designType.prototype);

    if (!classMetadata?.isXMLClass) {
      // Not an XML class, don't auto-instantiate
      return null;
    }

    return {
      type: designType,
      isArray: false,
    };
  } catch (error) {
    // If reflection fails, silently return null
    // This maintains backward compatibility
    return null;
  }
}

/**
 * Set up auto-instantiation with explicit type information
 * This replaces the unreliable naming heuristics with explicit type checking
 */
function setupAutoInstantiationWithType(
  target: any,
  propertyKey: string,
  constructor: Constructor,
  isArray: boolean
): void {
  // Verify that the provided type is actually an @xml decorated class
  const classMetadata = getClassMetadata(constructor.prototype);
  if (!classMetadata?.isXMLClass) {
    console.warn(
      `[xmld] Type '${constructor.name}' for property '${propertyKey}' is not decorated with @xml. Auto-instantiation skipped.`
    );
    return;
  }

  // Store auto-instantiation metadata
  setPropertyMetadata(target, propertyKey, {
    autoInstantiate: constructor,
    isArray: isArray,
  });

  // Set up the appropriate auto-instantiation mechanism
  if (isArray) {
    setupAutoInstantiationArray(target, propertyKey, constructor);
  } else {
    setupAutoInstantiationObject(target, propertyKey, constructor);
  }
}

/**
 * Set up auto-instantiation for array properties
 */
function setupAutoInstantiationArray(
  target: any,
  propertyKey: string,
  constructor: Constructor
): void {
  const privateKey = `_${propertyKey}`;

  // Create a proxy array that auto-instantiates pushed objects
  Object.defineProperty(target, propertyKey, {
    get() {
      // If this instance has a property that shadows our getter, delete it first
      if (Object.hasOwn(this, propertyKey)) {
        Reflect.deleteProperty(this, propertyKey);
      }

      if (!this[privateKey]) {
        this[privateKey] = new Proxy([], {
          set(arr: any[], prop: string | symbol, value: any) {
            if (
              typeof prop === 'string' &&
              Number.isInteger(Number(prop)) &&
              Number(prop) >= 0
            ) {
              // Auto-instantiate if value is plain object
              if (
                value &&
                typeof value === 'object' &&
                !value.constructor.name.startsWith(constructor.name)
              ) {
                value = new constructor(value);
              }
            }
            arr[prop as any] = value;
            return true;
          },
        });
      }
      return this[privateKey];
    },
    set(value: any[]) {
      // Delete any shadowing instance property
      if (Object.hasOwn(this, propertyKey)) {
        Reflect.deleteProperty(this, propertyKey);
      }

      // Auto-instantiate all array items
      if (Array.isArray(value)) {
        this[privateKey] = value.map((item) => {
          if (
            item &&
            typeof item === 'object' &&
            !item.constructor.name.startsWith(constructor.name)
          ) {
            return new constructor(item);
          }
          return item;
        });
      } else {
        this[privateKey] = value;
      }
    },
    enumerable: true,
    configurable: true,
  });
}

/**
 * Set up auto-instantiation for object properties
 */
function setupAutoInstantiationObject(
  target: any,
  propertyKey: string,
  constructor: Constructor
): void {
  const privateKey = `_${propertyKey}`;

  // Define the getter/setter on the prototype
  Object.defineProperty(target, propertyKey, {
    get() {
      // If this instance has a property that shadows our getter, delete it first
      if (Object.hasOwn(this, propertyKey)) {
        Reflect.deleteProperty(this, propertyKey);
      }

      if (!this[privateKey]) {
        this[privateKey] = new constructor();
      }
      return this[privateKey];
    },
    set(value: any) {
      // Delete any shadowing instance property
      if (Object.hasOwn(this, propertyKey)) {
        Reflect.deleteProperty(this, propertyKey);
      }

      if (
        value &&
        typeof value === 'object' &&
        !value.constructor.name.startsWith(constructor.name)
      ) {
        this[privateKey] = new constructor(value);
      } else {
        this[privateKey] = value;
      }
    },
    enumerable: true,
    configurable: true,
  });
}
