import { BaseObject } from './base/base-object';
import { ObjectData } from './base/types';
import { ClasObject } from './clas/clas-object';
import { IntfObject } from './intf/intf-object';
import { DevcObject } from './devc/devc-object';
import { ADTClient } from '../adt-client';

export class ObjectRegistry {
  private static handlers = new Map<
    string,
    (client: ADTClient) => BaseObject<any>
  >();

  static {
    // Register object type handlers
    this.handlers.set('CLAS', (client) => new ClasObject(client));
    this.handlers.set('INTF', (client) => new IntfObject(client));
    this.handlers.set('DEVC', (client) => new DevcObject(client));
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
