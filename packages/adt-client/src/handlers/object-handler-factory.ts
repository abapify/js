import { ConnectionManager } from '../client/connection-manager.js';
import { ObjectHandler } from './base-object-handler.js';
import { ClassHandler } from './class-handler.js';
import { ProgramHandler } from './program-handler.js';
import { PackageHandler } from './package-handler.js';

export class ObjectHandlerFactory {
  private static handlers = new Map<
    string,
    new (connectionManager: ConnectionManager) => ObjectHandler
  >();

  static {
    // Register built-in handlers
    ObjectHandlerFactory.registerHandler('CLAS', ClassHandler);
    ObjectHandlerFactory.registerHandler('PROG', ProgramHandler);
    ObjectHandlerFactory.registerHandler('DEVC', PackageHandler);
  }

  /**
   * Register a new object handler for a specific object type
   */
  static registerHandler(
    objectType: string,
    handlerClass: new (connectionManager: ConnectionManager) => ObjectHandler
  ): void {
    this.handlers.set(objectType.toUpperCase(), handlerClass);
  }

  /**
   * Get handler for specific object type
   */
  static getHandler(
    objectType: string,
    connectionManager: ConnectionManager
  ): ObjectHandler {
    const HandlerClass = this.handlers.get(objectType.toUpperCase());

    if (!HandlerClass) {
      throw new Error(`No handler registered for object type: ${objectType}`);
    }

    return new HandlerClass(connectionManager);
  }

  /**
   * Check if handler exists for object type
   */
  static hasHandler(objectType: string): boolean {
    return this.handlers.has(objectType.toUpperCase());
  }

  /**
   * Get all supported object types
   */
  static getSupportedObjectTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}
