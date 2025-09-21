/**
 * @element decorator - Mark a property as an XML element with auto-instantiation support
 */

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

  // Set up auto-instantiation if type is provided
  if (options.type) {
    setupAutoInstantiationWithType(
      target,
      propertyKey,
      options.type,
      options.array || false
    );
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
      if (Object.prototype.hasOwnProperty.call(this, propertyKey)) {
        delete this[propertyKey];
      }

      if (!this[privateKey]) {
        this[privateKey] = new Proxy([], {
          set(arr: any[], prop: string | symbol, value: any) {
            if (typeof prop === 'string' && /^\d+$/.test(prop)) {
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
      if (Object.prototype.hasOwnProperty.call(this, propertyKey)) {
        delete this[propertyKey];
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
      if (Object.prototype.hasOwnProperty.call(this, propertyKey)) {
        delete this[propertyKey];
      }

      if (!this[privateKey]) {
        this[privateKey] = new constructor();
      }
      return this[privateKey];
    },
    set(value: any) {
      // Delete any shadowing instance property
      if (Object.prototype.hasOwnProperty.call(this, propertyKey)) {
        delete this[propertyKey];
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
