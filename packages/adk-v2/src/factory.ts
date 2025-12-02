/**
 * ADK v2 - Factory
 * 
 * Entry point for creating ADK instances.
 */

import type { AdkContext } from './base/context';
import type { AbapPackage } from './objects/repository/devc';
import { AdkPackage } from './objects/repository/devc';

/**
 * ADK Factory interface
 * 
 * This is what users interact with.
 */
export interface AdkFactory {
  /**
   * Get a package by name
   */
  getPackage(name: string): Promise<AbapPackage>;
  
  // TODO: Add more object types
  // getClass(name: string): Promise<AbapClass>;
  // getInterface(name: string): Promise<AbapInterface>;
}

/**
 * Create ADK factory
 * 
 * @param client - ADT client instance
 * TODO: Type client properly when adt-client-v2 is ready
 */
export function createAdk(client: unknown): AdkFactory {
  const ctx: AdkContext = { client };
  
  return {
    async getPackage(name: string): Promise<AbapPackage> {
      // TODO: Call client.repository.packages.get(name)
      // TODO: Replace mock with actual client call and schema parsing
      const data = {
        name,
        type: 'DEVC/K',
        description: `Package ${name}`,
        responsible: '',
        masterLanguage: 'EN',
        language: 'EN',
        version: 'active',
        createdAt: new Date().toISOString(),
        createdBy: '',
        changedAt: new Date().toISOString(),
        changedBy: '',
        attributes: {
          packageType: 'development',
          isEncapsulated: false,
          isAddingObjectsAllowed: true,
          recordChanges: false,
          languageVersion: '',
        },
      };
      
      return new AdkPackage(ctx, data);
    },
  };
}
