import { AdtCoreAttributes } from '../namespaces/adtcore.js';
import { AbapSourceAttributes } from '../namespaces/abapsource.js';
import { Kind } from '../kind.js';

/**
 * Base constructor input for AdtObject base class
 */
export interface AdtObjectConstructorInput<T = unknown, K extends Kind = Kind> {
  /** Core ADT attributes (name, type, description, etc.) */
  adtcore: AdtCoreAttributes;
  /** Object-specific sections */
  sections: T;
  /** Object kind */
  kind: K;
}

/**
 * Base input interface for all ADT objects (extends constructor input)
 */
export interface AdtObjectInput {
  /** Core ADT attributes (name, type, description, etc.) */
  adtcore: AdtCoreAttributes;

  /** ABAP source attributes (sourceUri, fixPointArithmetic, etc.) */
  abapsource?: AbapSourceAttributes;

  /** ABAP OO specific attributes */
  abapoo?: {
    modeled: boolean;
  };
}

/**
 * Interface-specific input extending the base
 */
export interface InterfaceInput extends AdtObjectInput {
  /** Interface-specific sections */
  sections?: {
    sourceMain?: string;
    syntaxConfiguration?: {
      language: {
        version: number;
        description: string;
      };
    };
  };
}

/**
 * Class-specific input extending the base
 */
export interface ClassInput extends AdtObjectInput {
  /** Class-specific attributes */
  class?: {
    final: boolean;
    abstract: boolean;
    visibility: 'public' | 'protected' | 'private';
    category?: string;
    hasTests?: boolean;
    sharedMemoryEnabled?: boolean;
  };

  /** Class-specific sections */
  sections?: {
    includes?: Array<{
      includeType:
        | 'definitions'
        | 'implementations'
        | 'macros'
        | 'testclasses'
        | 'main';
      name: string;
      type: string;
      sourceUri: string;
      changedAt?: Date;
      createdAt?: Date;
      changedBy?: string;
      createdBy?: string;
      version?: string;
      links: Array<{
        href: string;
        rel: string;
        type?: string;
        title?: string;
        etag?: string;
      }>;
    }>;
  };
}

/**
 * Domain-specific input extending the base
 */
export interface DomainInput extends AdtObjectInput {
  /** Domain-specific attributes */
  domain?: {
    dataType?: string;
    length?: number;
    decimals?: number;
    outputLength?: number;
    conversionExit?: string;
    valueTable?: string;
  };
  /** Domain sections */
  sections?: {
    fixedValues?: Array<{
      lowValue: string;
      highValue?: string;
      description?: string;
    }>;
  };
}
