import { BaseObject } from './base/base-object';
import { ObjectData } from './base/types';
import { AdkObjectHandler } from './adk-bridge/adk-object-handler';
import {
  ADK_Class,
  ADK_Interface,
  ADK_Domain,
  ADK_Package,
  type AdkObject as AdkObjectType,
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
          (xml: string) => ADK_Class.fromAdtXml(xml) as any,
          (name: string) => `/sap/bc/adt/oo/classes/${name.toLowerCase()}`,
          getAdtClient(),
          'application/vnd.sap.adt.oo.classes.v4+xml, application/vnd.sap.adt.oo.classes.v3+xml, application/vnd.sap.adt.oo.classes.v2+xml, application/vnd.sap.adt.oo.classes+xml'
        )
    );
    this.handlers.set(
      'INTF',
      () =>
        new AdkObjectHandler(
          (xml: string) => ADK_Interface.fromAdtXml(xml) as any,
          (name: string) => `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`,
          getAdtClient(),
          'application/vnd.sap.adt.oo.interfaces.v5+xml, application/vnd.sap.adt.oo.interfaces.v4+xml, application/vnd.sap.adt.oo.interfaces.v3+xml, application/vnd.sap.adt.oo.interfaces.v2+xml, application/vnd.sap.adt.oo.interfaces+xml'
        )
    );
    this.handlers.set(
      'DOMA',
      () =>
        new AdkObjectHandler(
          (xml: string) => ADK_Domain.fromAdtXml(xml) as any,
          (name: string) => `/sap/bc/adt/ddic/domains/${name.toLowerCase()}`,
          getAdtClient(),
          'application/vnd.sap.adt.domains.v2+xml, application/vnd.sap.adt.domains.v1+xml, application/vnd.sap.adt.domains+xml'
        )
    );
    this.handlers.set(
      'DEVC',
      () =>
        new AdkObjectHandler(
          (xml: string) => ADK_Package.fromAdtXml(xml) as any,
          (name: string) => `/sap/bc/adt/packages/${name.toLowerCase()}`,
          getAdtClient(),
          'application/vnd.sap.adt.packages.v1+xml, application/vnd.sap.adt.packages+xml'
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
