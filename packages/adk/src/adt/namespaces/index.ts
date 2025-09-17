import { $namespaces } from 'fxmlp';

/**
 * Typed ABAP source namespace structure
 */
export interface AbapSourceNamespace {
  sourceUri?: string;
  fixPointArithmetic?: string;
  activeUnicodeCheck?: string;
  syntaxConfiguration?: {
    language?: {
      version?: string;
      description?: string;
    };
  };
}

/**
 * Typed ADT core namespace structure
 */
export interface AdtCoreNamespace {
  name?: string;
  type?: string;
  description?: string;
  language?: string;
  masterLanguage?: string;
  responsible?: string;
  changedBy?: string;
  createdBy?: string;
  changedAt?: string;
  createdAt?: string;
  version?: string;
  masterSystem?: string;
  abapLanguageVersion?: string;
}

/**
 * Typed interface namespace structure
 */
export interface InterfaceNamespace {
  abapInterface?: {
    [key: string]: any;
  };
}

/**
 * Typed class namespace structure
 */
export interface ClassNamespace {
  abapClass?: {
    [key: string]: any;
  };
  final?: string;
  abstract?: string;
  visibility?: string;
  include?: Array<{
    [key: string]: any;
  }>;
}

/**
 * Create all typed namespace functions
 */
function createTypedNamespaces() {
  const {
    intf,
    adtcore,
    abapsource,
    atom,
    class: classNs,
  } = $namespaces([
    ['intf', { recursive: true }],
    ['adtcore', { recursive: true }],
    ['abapsource', { recursive: true }],
    ['atom', { recursive: true }],
    ['class', { recursive: true }],
  ]);

  return {
    // Typed namespace functions
    intf: (input: InterfaceNamespace) => intf(input),
    adtcore: (input: AdtCoreNamespace) => adtcore(input),
    abapsource: (input: AbapSourceNamespace) => abapsource(input),
    class: (input: ClassNamespace) => classNs(input),

    // Keep atom as-is for now (could be typed later)
    atom,
  };
}

// Export typed namespace functions
const typedNamespaces = createTypedNamespaces();

export const { intf, adtcore, abapsource, atom } = typedNamespaces;
export const { class: classNs } = typedNamespaces;
