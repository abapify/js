/**
 * Enabled Endpoints Whitelist
 * 
 * Endpoints to generate contracts for. Use glob patterns.
 */

export const enabledEndpoints = {
  enabled: [
    '/sap/bc/adt/atc/**',
    '/sap/bc/adt/cts/transportrequests/**',
    '/sap/bc/adt/oo/classes',
    '/sap/bc/adt/oo/interfaces',
    '/sap/bc/adt/packages',
    '/sap/bc/adt/discovery',
  ],
  
  notes: {
    '/sap/bc/adt/atc/**': 'ABAP Test Cockpit - code quality checks',
    '/sap/bc/adt/cts/transportrequests/**': 'Transport management',
    '/sap/bc/adt/oo/classes': 'ABAP classes',
    '/sap/bc/adt/oo/interfaces': 'ABAP interfaces', 
    '/sap/bc/adt/packages': 'Package management',
    '/sap/bc/adt/discovery': 'ADT discovery service',
  },
} as const;
