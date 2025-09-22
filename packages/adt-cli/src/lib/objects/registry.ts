import { BaseObject } from './base/base-object';
import { ObjectData } from './base/types';
import { AdkObjectHandler } from './adk-bridge/adk-object-handler';
import {
  objectRegistry,
  createInterface,
  createClass,
  createDomain,
} from '@abapify/adk';
import { getAdtClient } from '../shared/clients';

export class ObjectRegistry {
  private static handlers = new Map<string, () => BaseObject<any>>();

  static {
    // ADK-based object handlers using new client-agnostic architecture
    this.handlers.set(
      'CLAS',
      () =>
        new AdkObjectHandler(
          (xml: string) => {
            // Use ADK objectRegistry to parse XML to object
            try {
              return objectRegistry.createFromXml('CLAS', xml);
            } catch (error) {
              // Fallback: create empty object for now
              const classObj = createClass();
              classObj.name = 'UNKNOWN';
              return classObj;
            }
          },
          (name: string) => `/sap/bc/adt/oo/classes/${name.toLowerCase()}`,
          getAdtClient()
        )
    );
    this.handlers.set(
      'INTF',
      () =>
        new AdkObjectHandler(
          (xml: string) => {
            // Use ADK objectRegistry to parse XML to object
            try {
              return objectRegistry.createFromXml('INTF', xml);
            } catch (error) {
              // Fallback: create empty object for now
              const intfObj = createInterface();
              intfObj.name = 'UNKNOWN';
              return intfObj;
            }
          },
          (name: string) => `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`,
          getAdtClient()
        )
    );
    this.handlers.set(
      'DOMA',
      () =>
        new AdkObjectHandler(
          (xml: string) => {
            // Use ADK objectRegistry to parse XML to object
            try {
              return objectRegistry.createFromXml('DOMA', xml);
            } catch (error) {
              // Fallback: create empty object for now
              const domainObj = createDomain();
              domainObj.name = 'UNKNOWN';
              return domainObj;
            }
          },
          (name: string) => `/sap/bc/adt/ddic/domains/${name.toLowerCase()}`,
          getAdtClient()
        )
    );
  }

  static get(objectType: string): BaseObject<ObjectData> {
    const handlerFactory = this.handlers.get(objectType);
    if (!handlerFactory) {
      throw new Error(`No handler registered for object type: ${objectType}`);
    }
    return handlerFactory();
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  static isSupported(objectType: string): boolean {
    return this.handlers.has(objectType);
  }
}
