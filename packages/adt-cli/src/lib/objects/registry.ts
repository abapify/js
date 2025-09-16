import { BaseObject } from './base/base-object';
import { ObjectData } from './base/types';
import { getAdtClient } from '../shared/clients';
import { AdkObjectHandler } from './adk-bridge';
// import { ClassAdtAdapter } from '@abapify/adk'; // Not exported yet

export class ObjectRegistry {
  private static handlers = new Map<string, () => BaseObject<any>>();

  static {
    // ADK-based object handlers (native ADT format parsing)
    // TODO: Re-enable when ClassAdtAdapter is exported from @abapify/adk
    // this.handlers.set(
    //   'CLAS',
    //   () =>
    //     new AdkObjectHandler(
    //       ClassAdtAdapter.parseXmlToSpec,
    //       ClassAdtAdapter.uriFactory,
    //       getAdtClient()
    //     )
    // );
    // TODO: Add InterfaceAdtAdapter when available in ADK
    // this.handlers.set(
    //   'INTF',
    //   () =>
    //     new AdkObjectHandler(
    //       InterfaceAdtAdapter.parseXmlToSpec,
    //       InterfaceAdtAdapter.uriFactory,
    //       getAdtClient()
    //     )
    // );
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
