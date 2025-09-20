/**
 * Class namespace (class:*) - ABAP Class object model
 * Based on SAP ADT XML: <class:abapClass class:final="true" class:abstract="false">
 */

// Attributes that become XML attributes on the element
export interface ClassAttributes {
  final?: boolean;
  abstract?: boolean;
  visibility?: 'public' | 'protected' | 'private';
  category?: string;
  hasTests?: boolean;
  sharedMemoryEnabled?: boolean;
}

// Attributes for each <class:include> element
export interface ClassIncludeAttributes {
  includeType:
    | 'main'
    | 'testclasses'
    | 'locals_def'
    | 'locals_imp'
    | 'macros'
    | 'definitions'
    | 'implementations';
}

// Each <class:include> element with mixed attributes and child elements
export interface ClassIncludeType extends ClassIncludeAttributes {
  // Child elements (like atom:link) would go here
  atomLinks?: any[]; // For the atom:link child elements in the fixture
}

// Class elements
export interface ClassElements {
  includes?: ClassIncludeType[]; // These become <class:include> child elements
}

/**
 * Class namespace (class:*) - Smart namespace with automatic attribute/element detection
 * Attributes: simple values (string, number, boolean)
 * Elements: complex values (objects, arrays)
 */
export type ClassType = ClassAttributes & ClassElements;

// Class decorator - smart namespace with automatic attribute/element detection
import { createNamespace } from '../decorators/decorators-v2';

export const class_ = createNamespace<ClassElements, ClassAttributes>({
  name: 'class',
  uri: 'http://www.sap.com/adt/oo/classes',
});
