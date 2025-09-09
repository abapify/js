import {
  BaseObjectHandler,
  ObjectOutlineElement,
  ObjectProperties,
} from './base-object-handler.js';
import { AdtObject, ObjectMetadata } from '../types/objects.js';
import { UpdateResult, CreateResult, DeleteResult } from '../types/client.js';
import { XmlParser } from '../utils/xml-parser.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class ProgramHandler extends BaseObjectHandler {
  constructor(connectionManager: any) {
    super(connectionManager, 'PROG');
  }

  async getObject(objectName: string): Promise<AdtObject> {
    try {
      const metadata = await this.getObjectMetadata(objectName);
      const content: Record<string, string> = {};

      // Get main program source
      content.main = await this.getObjectSource(objectName);

      return {
        objectType: this.objectType,
        objectName,
        metadata,
        content,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectSource(objectName: string): Promise<string> {
    try {
      const url = this.buildProgramUrl(objectName, 'source/main');
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectMetadata(objectName: string): Promise<ObjectMetadata> {
    try {
      const url = this.buildProgramUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.programs.v2+xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const xmlContent = await response.text();
      return XmlParser.parseObjectMetadata(xmlContent);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async createObject(
    objectName: string,
    content: string,
    metadata?: Partial<ObjectMetadata>
  ): Promise<CreateResult> {
    try {
      const url = this.buildProgramUrl(objectName);

      // Build program creation XML
      const programXml = this.buildProgramCreationXml(objectName, metadata);

      const response = await this.connectionManager.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.programs.v2+xml',
          Accept: 'application/vnd.sap.adt.programs.v2+xml',
        },
        body: programXml,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      // After creating the program, set the source content
      if (content) {
        await this.updateObjectSource(objectName, content);
      }

      return {
        success: true,
        objectName,
        message: `Program ${objectName} created successfully`,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async updateObject(
    objectName: string,
    content: string
  ): Promise<UpdateResult> {
    return this.updateObjectSource(objectName, content);
  }

  async deleteObject(objectName: string): Promise<DeleteResult> {
    try {
      const url = this.buildProgramUrl(objectName);
      const response = await this.connectionManager.request(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      return {
        success: true,
        objectName,
        message: `Program ${objectName} deleted successfully`,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectOutline(objectName: string): Promise<ObjectOutlineElement[]> {
    try {
      const url = this.buildProgramUrl(objectName, 'objectstructure');
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const xmlContent = await response.text();
      return this.parseProgramOutline(xmlContent);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectProperties(objectName: string): Promise<ObjectProperties> {
    try {
      const metadata = await this.getObjectMetadata(objectName);

      // Get additional program-specific properties
      const url = this.buildProgramUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.programs.v2+xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const xmlContent = await response.text();
      const programProperties = this.parseProgramProperties(xmlContent);

      return {
        ...metadata,
        ...programProperties,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  // Program-specific methods

  async updateObjectSource(
    objectName: string,
    content: string
  ): Promise<UpdateResult> {
    try {
      const url = this.buildProgramUrl(objectName, 'source/main');
      const response = await this.connectionManager.request(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
        body: content,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      return {
        success: true,
        objectName,
        message: `Program ${objectName} source updated successfully`,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  protected buildProgramUrl(objectName: string, fragment?: string): string {
    const baseUrl = `/sap/bc/adt/programs/programs/${objectName}`;
    return fragment ? `${baseUrl}/${fragment}` : baseUrl;
  }

  private parseProgramOutline(xmlContent: string): ObjectOutlineElement[] {
    const outline: ObjectOutlineElement[] = [];

    try {
      const parsed = XmlParser.parse(xmlContent);
      const rootElement = parsed['abapsource:objectStructureElement'];

      if (rootElement) {
        this.extractProgramOutlineElements(rootElement, outline);
      }
    } catch (error) {
      // Return empty outline if parsing fails
    }

    return outline;
  }

  private extractProgramOutlineElements(
    element: any,
    outline: ObjectOutlineElement[],
    parentName = ''
  ): void {
    if (!element) return;

    const name = element['@_name'] || element.name || '';
    const type = element['@_type'] || element.type || 'unknown';
    const description = element['@_description'] || element.description || '';

    if (name) {
      const outlineElement: ObjectOutlineElement = {
        name: parentName ? `${parentName}.${name}` : name,
        type,
        description,
        children: [],
      };

      // Process children if they exist (subroutines, forms, etc.)
      const children = element['abapsource:objectStructureElement'];
      if (children) {
        const childArray = Array.isArray(children) ? children : [children];
        for (const child of childArray) {
          this.extractProgramOutlineElements(
            child,
            outlineElement.children!,
            outlineElement.name
          );
        }
      }

      outline.push(outlineElement);
    }
  }

  private parseProgramProperties(xmlContent: string): ObjectProperties {
    const properties: ObjectProperties = {};

    try {
      const parsed = XmlParser.parse(xmlContent);
      const programElement =
        parsed['program:abapProgram'] || parsed['abapProgram'];

      if (programElement) {
        properties.programType =
          programElement['@_programType'] || 'EXECUTABLE';
        properties.status = programElement['@_status'];
        properties.application = programElement['@_application'];
        properties.fixPointArithmetic =
          programElement['@_fixPointArithmetic'] === 'true';
        properties.unicode = programElement['@_unicode'] === 'true';
      }
    } catch (error) {
      // Return basic properties if parsing fails
    }

    return properties;
  }

  protected buildObjectUrl(objectName: string, fragment?: string): string {
    return this.buildProgramUrl(objectName, fragment);
  }

  private buildProgramCreationXml(
    objectName: string,
    metadata?: Partial<ObjectMetadata>
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<program:abapProgram xmlns:program="http://www.sap.com/adt/programs/programs" 
                     xmlns:adtcore="http://www.sap.com/adt/core"
                     adtcore:type="PROG/P"
                     adtcore:name="${objectName}"
                     adtcore:description="${metadata?.description || ''}"
                     adtcore:language="${metadata?.language || 'EN'}"
                     adtcore:masterLanguage="${
                       metadata?.masterLanguage || 'EN'
                     }"
                     adtcore:masterSystem="${metadata?.masterSystem || ''}"
                     adtcore:responsible="${metadata?.responsible || ''}"
                     program:programType="${
                       metadata?.programType || 'EXECUTABLE'
                     }">
  <adtcore:packageRef adtcore:name="${metadata?.packageName || '$TMP'}"/>
</program:abapProgram>`;
  }
}
