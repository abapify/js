/**
 * Eclipse EMF Ecore stub schema
 * 
 * This is a minimal stub for Eclipse EMF Ecore types used in ADT XSDs.
 * The actual Ecore schema is not part of the ADT SDK.
 */

import type { XsdSchema } from 'ts-xsd';

export default {
  ns: 'http://www.eclipse.org/emf/2002/Ecore',
  prefix: 'ecore',
  elements: {
    // Ecore types are mapped to primitives
  },
} as const satisfies XsdSchema;
