import { BaseObject } from './base/base-object';
import { ObjectData } from './base/types';
import { adtClient } from '../shared/clients';
import { AdkObjectHandler } from './adk-bridge';
// Temporarily disable ADK imports due to const enum issues
// import { Kind } from '@abapify/adk';

// Local type definition for now
enum Kind {
  Domain = 'Domain',
  Class = 'Class',
  Interface = 'Interface',
}

export class ObjectRegistry {
  private static handlers = new Map<string, () => BaseObject<any>>();

  static {
    // ADK-based object handlers (native ADT format parsing)
    this.handlers.set(
      'CLAS',
      () =>
        new AdkObjectHandler(
          (xml) => ClassAdtAdapter.fromAdtXML(xml),
          (name) => `/sap/bc/adt/oo/classes/${name.toLowerCase()}`
        )
    );

    this.handlers.set(
      'INTF',
      () =>
        new AdkObjectHandler(
          (xml) => InterfaceAdtAdapter.fromAdtXML(xml),
          (name) => `/sap/bc/adt/oo/interfaces`
        )
    );

    // TODO: Migrate DEVC to ADK when adapter is available
    // this.handlers.set('DEVC', (client) => new AdkObjectHandler(...));
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
