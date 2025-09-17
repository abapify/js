import { AdtEndpointMapping } from '../types.js';

/**
 * Object-Oriented (OO) endpoint mappings for Classes and Interfaces
 */
export const OO_MAPPINGS: Record<string, AdtEndpointMapping> = {
  Interface: {
    baseEndpoint: '/sap/bc/adt/oo/interfaces',
    contentType: 'application/vnd.sap.adt.oo.interfaces.v1+xml',
    acceptType: 'application/vnd.sap.adt.oo.interfaces.v1+xml',
    getSourceEndpoint: (objectName: string) =>
      `/sap/bc/adt/oo/interfaces/${objectName.toLowerCase()}/source/main`,
    getActivationUri: (objectName: string) =>
      `/sap/bc/adt/oo/interfaces/${objectName.toLowerCase()}`,
  },

  Class: {
    baseEndpoint: '/sap/bc/adt/oo/classes',
    contentType: 'application/vnd.sap.adt.oo.classes.v1+xml',
    acceptType: 'application/vnd.sap.adt.oo.classes.v1+xml',
    getSourceEndpoint: (objectName: string) =>
      `/sap/bc/adt/oo/classes/${objectName.toLowerCase()}/source/main`,
    getActivationUri: (objectName: string) =>
      `/sap/bc/adt/oo/classes/${objectName.toLowerCase()}`,
  },
};
