import { BaseObject } from './base/base-object';
import { ObjectData } from './base/types';
import { ADTClient } from '../adt-client';
import { AdkObjectHandler } from './adk-bridge';
import { ClassAdtAdapter, InterfaceAdtAdapter } from '@abapify/adk';

export class ObjectRegistry {
  private static handlers = new Map<
    string,
    (client: ADTClient) => BaseObject<any>
  >();

  static {
    // ADK-based object handlers (native ADT format parsing)
    this.handlers.set(
      'CLAS',
      (client) =>
        new AdkObjectHandler(
          client,
          (xml) => ClassAdtAdapter.fromAdtXML(xml),
          (name) => `/sap/bc/adt/oo/classes/${name.toLowerCase()}`
        )
    );

    this.handlers.set(
      'INTF',
      (client) =>
        new AdkObjectHandler(
          client,
          (xml) => InterfaceAdtAdapter.fromAdtXML(xml),
          (name) => `/sap/bc/adt/oo/interfaces`
        )
    );

    // TODO: Migrate DEVC to ADK when adapter is available
    // this.handlers.set('DEVC', (client) => new AdkObjectHandler(...));
  }

  static get(objectType: string, adtClient: ADTClient): BaseObject<ObjectData> {
    const handlerFactory = this.handlers.get(objectType);
    if (!handlerFactory) {
      throw new Error(`No handler registered for object type: ${objectType}`);
    }
    return handlerFactory(adtClient);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  static isSupported(objectType: string): boolean {
    return this.handlers.has(objectType);
  }
}
