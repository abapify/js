/**
 * Examples showing the improved unified constructor interface
 */

import { Interface } from '../src/adt/oo/interfaces/interface.js';
import { Class } from '../src/adt/oo/classes/class.js';

// ✅ NEW: Clean, unified input interface
export function createInterfaceWithUnifiedInput() {
  const myInterface = new Interface({
    adtcore: {
      name: 'ZIF_MY_INTERFACE',
      type: 'INTF/OI',
      description: 'My awesome interface',
      masterLanguage: 'EN',
      version: 'inactive',
    },
    abapoo: { modeled: false },
    abapsource: {
      sourceUri: 'source/main',
      fixPointArithmetic: true,
      activeUnicodeCheck: true,
    },
    sections: {
      sourceMain:
        'INTERFACE zif_my_interface.\n  METHODS: do_something.\nENDINTERFACE.',
    },
  });

  return myInterface;
}

export function createClassWithUnifiedInput() {
  const myClass = new Class({
    adtcore: {
      name: 'ZCL_MY_CLASS',
      type: 'CLAS/OC',
      description: 'My awesome class',
      masterLanguage: 'EN',
      version: 'inactive',
    },
    abapoo: { modeled: false },
    abapsource: {
      sourceUri: 'source/main',
      fixPointArithmetic: true,
    },
    class: {
      final: false,
      abstract: false,
      visibility: 'public',
      category: 'generalObjectType',
      hasTests: true,
      sharedMemoryEnabled: false,
    },
    sections: {
      includes: [
        {
          includeType: 'definitions',
          name: '',
          type: 'CLAS/I',
          sourceUri: 'includes/definitions',
          links: [],
        },
        {
          includeType: 'implementations',
          name: '',
          type: 'CLAS/I',
          sourceUri: 'includes/implementations',
          links: [],
        },
      ],
    },
  });

  return myClass;
}

// ✅ Alternative: Using static factory methods for even cleaner syntax
export function createWithFactoryMethods() {
  const myInterface = Interface.create({
    adtcore: {
      name: 'ZIF_FACTORY_CREATED',
      type: 'INTF/OI',
      description: 'Created with factory method',
      masterLanguage: 'EN',
      version: 'inactive',
    },
  });

  const myClass = Class.create({
    adtcore: {
      name: 'ZCL_FACTORY_CREATED',
      type: 'CLAS/OC',
      description: 'Created with factory method',
      masterLanguage: 'EN',
      version: 'inactive',
    },
    class: {
      final: true,
      abstract: false,
      visibility: 'public',
    },
  });

  return { myInterface, myClass };
}

// ❌ OLD: Multiple constructor parameters (no longer needed!)
// new Interface(adtcore, abapoo, abapsource, sections)
// new Class(adtcore, abapoo, abapsource, sections)
