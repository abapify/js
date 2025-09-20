/**
 * Package reference attributes that become XML attributes on <adtcore:packageRef> element
 */
export interface PackageRefAttributes {
  uri: string;
  type: 'DEVC/K';
  name: string;
}

/**
 * Package reference element (adtcore:packageRef) with attributes - simple structure
 */
export interface PackageRefType {
  [$attributes]: PackageRefAttributes;
  // PackageRef is a child element with attributes using the special symbol
}

// Import the special symbol
import { $attributes } from '../decorators/decorators-v2';

/**
 * Utility type to flatten $attributes structure into a flat object
 * Extracts properties from [$attributes] and merges them with other properties
 */
export type FlattenAttributes<T> = T extends { [$attributes]: infer A }
  ? A & Omit<T, typeof $attributes>
  : T;

/**
 * Recursively flatten all $attributes in nested objects
 */
export type DeepFlattenAttributes<T> = T extends { [$attributes]: infer A }
  ? A & {
      [K in keyof Omit<T, typeof $attributes>]: T[K] extends {
        [$attributes]: any;
      }
        ? FlattenAttributes<T[K]>
        : T[K] extends object
        ? DeepFlattenAttributes<T[K]>
        : T[K];
    }
  : T extends object
  ? {
      [K in keyof T]: T[K] extends { [$attributes]: any }
        ? FlattenAttributes<T[K]>
        : T[K] extends object
        ? DeepFlattenAttributes<T[K]>
        : T[K];
    }
  : T;

// ADT Core attributes that become XML attributes on the root element
export interface AdtCoreAttributes {
  name: string;
  type: string;
  version?: string;
  description?: string;
  descriptionTextLimit?: number;
  language?: string;
  masterLanguage?: string;
  masterSystem?: string;
  abapLanguageVersion?: string;
  responsible?: string;
  changedBy?: string;
  createdBy?: string;
}

/**
 * ADT Core namespace (adtcore:*) - Clean structure with $attributes symbol
 * Uses the new pattern for clear separation of attributes vs elements
 */
export type AdtCoreType = {
  [$attributes]: AdtCoreAttributes;
  packageRef?: PackageRefType;
};

/**
 * Flattened version of AdtCoreType for easier usage and backward compatibility
 * Automatically flattens all $attributes into regular properties
 */
export type AdtCoreTypeFlat = DeepFlattenAttributes<AdtCoreType>;

// ADT Core decorator - simple namespace decorator
import { registerNamespace, namespace } from '../decorators/decorators-v2';

// Register the adtcore namespace
registerNamespace('adtcore', 'http://www.sap.com/adt/core');

// Export the simple namespace decorator
export const adtcore = namespace('adtcore');
