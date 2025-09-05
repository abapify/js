import { ADTClient } from '../../adt-client';
import { ObjectData } from './types';

export abstract class BaseObject<T extends ObjectData> {
  constructor(protected adtClient: ADTClient) {}

  abstract read(name: string): Promise<T>;

  async getAdtXml(name: string, uri?: string): Promise<string> {
    throw new Error(`ADT XML fetching not implemented for this object type`);
  }

  async getStructure(name: string): Promise<void> {
    throw new Error(`Structure information not available for this object type`);
  }

  async create(objectData: T, transportRequest?: string): Promise<void> {
    throw new Error(`Object creation not implemented for this object type`);
  }

  async update(objectData: T, transportRequest?: string): Promise<void> {
    throw new Error(`Object update not implemented for this object type`);
  }

  protected async fetchFromAdt(
    uri: string,
    accept: string = 'text/plain'
  ): Promise<string> {
    try {
      const response = await this.adtClient.request(uri, {
        method: 'GET',
        headers: { Accept: accept },
      });

      return await response.text();
    } catch (error) {
      throw new Error(
        `Failed to fetch from ${uri}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
