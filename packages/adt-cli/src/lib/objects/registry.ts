import { BaseObject } from './base/base-object';
import { ObjectData } from './base/types';
import { AdkObjectHandler } from './adk-bridge/adk-object-handler';
import {
  createClass,
  createInterface,
  createDomain,
  ClassSpec,
  IntfSpec,
  DomainSpec,
  Kind,
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
            // Parse XML using ADK ClassSpec and create Class object
            const spec = ClassSpec.fromXMLString(xml);
            const classObj = createClass();
            classObj.spec = spec;
            // Populate top-level properties from spec
            (classObj as any).name = spec.core?.name || '';
            (classObj as any).description = spec.core?.description || '';
            return classObj;
          },
          (name: string) => `/sap/bc/adt/oo/classes/${name.toLowerCase()}`,
          getAdtClient(),
          'application/vnd.sap.adt.oo.classes.v4+xml, application/vnd.sap.adt.oo.classes.v3+xml, application/vnd.sap.adt.oo.classes.v2+xml, application/vnd.sap.adt.oo.classes+xml'
        )
    );
    this.handlers.set(
      'INTF',
      () =>
        new AdkObjectHandler(
          (xml: string) => {
            // Parse XML using ADK IntfSpec and create Interface object
            const spec = IntfSpec.fromXMLString(xml);
            const intfObj = createInterface();
            intfObj.spec = spec;
            // Populate top-level properties from spec
            (intfObj as any).name = spec.core?.name || '';
            (intfObj as any).description = spec.core?.description || '';
            return intfObj;
          },
          (name: string) => `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}`,
          getAdtClient(),
          'application/vnd.sap.adt.oo.interfaces.v5+xml, application/vnd.sap.adt.oo.interfaces.v4+xml, application/vnd.sap.adt.oo.interfaces.v3+xml, application/vnd.sap.adt.oo.interfaces.v2+xml, application/vnd.sap.adt.oo.interfaces+xml'
        )
    );
    this.handlers.set(
      'DOMA',
      () =>
        new AdkObjectHandler(
          (xml: string) => {
            // Parse XML using ADK DomainSpec and create Domain object
            const spec = DomainSpec.fromXMLString(xml);
            const domainObj = createDomain();
            domainObj.spec = spec;
            // Populate top-level properties from spec
            (domainObj as any).name = spec.core?.name || '';
            (domainObj as any).description = spec.core?.description || '';
            return domainObj;
          },
          (name: string) => `/sap/bc/adt/ddic/domains/${name.toLowerCase()}`,
          getAdtClient(),
          'application/vnd.sap.adt.ddic.domains.v2+xml, application/vnd.sap.adt.ddic.domains+xml'
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
