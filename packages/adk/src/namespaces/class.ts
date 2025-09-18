/**
 * Class namespace (class:*) - ABAP Class specific attributes
 * Based on XML: class:final, class:abstract, class:visibility, etc.
 */
export interface ClassType {
  final?: boolean;
  abstract?: boolean;
  visibility?: 'public' | 'protected' | 'private';
  category?: string;
  hasTests?: boolean;
  sharedMemoryEnabled?: boolean;
}

// Class namespace URI (Note: ABAP classes don't typically have their own namespace in ADT XML)
export const CLASS_NAMESPACE_URI = 'http://www.sap.com/adt/oo/classes';

// Class-specific decorator
import { namespace } from '../decorators';
export const classNs = namespace('class', CLASS_NAMESPACE_URI);
