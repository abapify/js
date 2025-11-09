import {
  BaseObjectHandler,
  ObjectOutlineElement,
  ObjectProperties,
} from './base-object-handler';
import { AdtObject, ObjectMetadata } from '../types/objects';
import { UpdateResult, CreateResult, DeleteResult } from '../types/client';
import { XmlParser } from '../utils/xml-parser';
import { ErrorHandler } from '../utils/error-handler';
import { IntfSpec } from '@abapify/adk';
import type { AdkObject } from '@abapify/adk';

export class InterfaceHandler extends BaseObjectHandler {
  constructor(connectionManager: any) {
    super(connectionManager, 'INTF');
  }

  /**
   * Get interface as ADK object
   * Returns ADK IntfSpec
   */
  async getAdkObject(objectName: string): Promise<AdkObject> {
    try {
      // Get metadata XML
      const url = this.buildInterfaceUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.oo.interfaces.v2+xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const metadataXml = await response.text();

      // Parse to ADK IntfSpec
      const spec = IntfSpec.fromXMLString(metadataXml);

      // Create ADK object
      const adkObject: AdkObject = {
        kind: 'Interface',
        name: spec.core?.name || objectName,
        type: 'INTF/OI',
        description: spec.core?.description,
        spec,
      };

      return adkObject;
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  private buildInterfaceUrl(objectName: string, fragment?: string): string {
    const base = `/sap/bc/adt/oo/interfaces/${objectName.toLowerCase()}`;
    return fragment ? `${base}/${fragment}` : base;
  }
}
