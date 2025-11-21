import {
  BaseObjectHandler,
  ObjectOutlineElement,
  ObjectProperties,
} from './base-object-handler';
import { AdtObject, ObjectMetadata } from '../types/objects';
import { UpdateResult, CreateResult, DeleteResult } from '../types/client';
import { XmlParser } from '../utils/xml-parser';
import { ErrorHandler } from '../utils/error-handler';
import { ADK_Class } from '@abapify/adk';
import type { AdkObject } from '@abapify/adk';

export class ClassHandler extends BaseObjectHandler {
  constructor(connectionManager: any) {
    super(connectionManager, 'CLAS');
  }

  /**
   * Get class as ADK object with lazy loading support
   */
  async getObject(objectName: string): Promise<AdtObject> {
    try {
      const metadata = await this.getObjectMetadata(objectName);
      const content: Record<string, string> = {};

      // Get main class definition
      content.main = await this.getObjectSource(objectName);

      // Get class-specific fragments
      const fragments = await this.getClassFragments(objectName);
      Object.assign(content, fragments);

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

  /**
   * Get class as ADK object with lazy loading
   * Returns ADK ClassSpec with lazy-loaded includes
   */
  async getAdkObject(
    objectName: string,
    options?: { lazyLoad?: boolean }
  ): Promise<AdkObject> {
    try {
      const lazyLoad = options?.lazyLoad ?? true;

      // Get metadata XML
      const url = this.buildClassUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.oo.classes.v2+xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const metadataXml = await response.text();

      // Parse to ADK Class
      const classObject = ADK_Class.fromAdtXml(metadataXml);

      // Attach lazy loaders to includes if requested
      if (lazyLoad) {
        const originalData = classObject.getData() as Record<string, unknown>;

        // Use Proxy to intercept getData() calls
        if (Array.isArray(originalData.include)) {
          const self = this; // Capture ClassHandler instance

          // Pre-compute includes with content loaders
          const includesWithContent = originalData.include.map((include) => {
            const inc = include as Record<string, unknown>;
            const includeType = String(inc.includeType);

            return {
              ...inc,
              content: async () => {
                return await self.getClassIncludeSource(
                  objectName,
                  includeType
                );
              },
            };
          });

          // Create modified data object once
          const modifiedData = {
            ...originalData,
            include: includesWithContent,
          };

          return new Proxy(classObject, {
            get(target, prop) {
              // Intercept getData calls and return pre-computed modified data
              if (prop === 'getData') {
                return () => modifiedData;
              }

              // Pass through all other property accesses
              const value = (target as any)[prop];
              return typeof value === 'function' ? value.bind(target) : value;
            },
          }) as AdkObject;
        }
      }

      return classObject;
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  /**
   * Get class include source by include type
   * Maps include types to ADT API endpoints
   */
  private async getClassIncludeSource(
    objectName: string,
    includeType: string
  ): Promise<string> {
    try {
      // Map include types to ADT API fragment names
      const fragmentMap: Record<string, string> = {
        main: 'source/main',
        definitions: 'source/definitions',
        implementations: 'source/implementations',
        macros: 'source/macros',
        testclasses: 'source/testclasses',
      };

      const fragment = fragmentMap[includeType];
      if (!fragment) {
        // Unknown include type, return empty
        return '';
      }

      const url = this.buildClassUrl(objectName, fragment);
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        // Include might not exist (e.g., no test classes), return empty
        return '';
      }

      return await response.text();
    } catch (error) {
      // If fetch fails, return empty string (include might not exist)
      return '';
    }
  }

  async getObjectSource(objectName: string): Promise<string> {
    try {
      const url = this.buildClassUrl(objectName, 'source/main');
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
      const url = this.buildClassUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.oo.classes.v2+xml' },
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
      const url = this.buildClassUrl(objectName);

      // Build class creation XML
      const classXml = this.buildClassCreationXml(objectName, metadata);

      const response = await this.connectionManager.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.oo.classes.v2+xml',
          Accept: 'application/vnd.sap.adt.oo.classes.v2+xml',
        },
        body: classXml,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      // After creating the class, set the source content
      if (content) {
        await this.updateObjectSource(objectName, content);
      }

      return {
        success: true,
        objectName,
        message: `Class ${objectName} created successfully`,
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
      const url = this.buildClassUrl(objectName);
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
        message: `Class ${objectName} deleted successfully`,
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
      const url = this.buildClassUrl(objectName, 'objectstructure');
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
      return this.parseClassOutline(xmlContent);
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

      // Get additional class-specific properties
      const url = this.buildClassUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.oo.classes.v2+xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const xmlContent = await response.text();
      const classProperties = this.parseClassProperties(xmlContent);

      return {
        ...metadata,
        ...classProperties,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  // Class-specific methods

  async getClassFragments(objectName: string): Promise<Record<string, string>> {
    const fragments: Record<string, string> = {};

    try {
      // Get class definition parts
      const definitionFragments = [
        'definitions',
        'implementations',
        'testclasses',
      ];

      for (const fragment of definitionFragments) {
        try {
          const url = this.buildClassUrl(objectName, `source/${fragment}`);
          const response = await this.connectionManager.request(url);

          if (response.ok) {
            fragments[fragment] = await response.text();
          }
        } catch (error) {
          // Fragment might not exist, continue with others
          continue;
        }
      }
    } catch (error) {
      // Return what we have, even if some fragments failed
    }

    return fragments;
  }

  async updateObjectSource(
    objectName: string,
    content: string
  ): Promise<UpdateResult> {
    try {
      const url = this.buildClassUrl(objectName, 'source/main');
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
        message: `Class ${objectName} source updated successfully`,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getClassMethods(objectName: string): Promise<string[]> {
    try {
      const url = this.buildClassUrl(objectName, 'methods');
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const xmlContent = await response.text();
      return XmlParser.parseClassMethods(xmlContent);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  protected buildClassUrl(objectName: string, fragment?: string): string {
    const baseUrl = `/sap/bc/adt/oo/classes/${objectName}`;
    return fragment ? `${baseUrl}/${fragment}` : baseUrl;
  }

  private parseClassOutline(xmlContent: string): ObjectOutlineElement[] {
    const outline: ObjectOutlineElement[] = [];

    try {
      const parsed = XmlParser.parse(xmlContent);
      const rootElement = parsed['abapsource:objectStructureElement'];

      if (rootElement) {
        this.extractOutlineElements(rootElement, outline);
      }
    } catch (error) {
      // Return empty outline if parsing fails
    }

    return outline;
  }

  private extractOutlineElements(
    element: any,
    outline: ObjectOutlineElement[],
    parentName = ''
  ): void {
    if (!element) return;

    const name = element['@_name'] || element.name || '';
    const type = element['@_type'] || element.type || 'unknown';
    const visibility = element['@_visibility'] || element.visibility;
    const description = element['@_description'] || element.description || '';

    if (name) {
      const outlineElement: ObjectOutlineElement = {
        name: parentName ? `${parentName}.${name}` : name,
        type,
        visibility: visibility as 'public' | 'protected' | 'private',
        description,
        children: [],
      };

      // Process children if they exist
      const children = element['abapsource:objectStructureElement'];
      if (children) {
        const childArray = Array.isArray(children) ? children : [children];
        for (const child of childArray) {
          this.extractOutlineElements(
            child,
            outlineElement.children!,
            outlineElement.name
          );
        }
      }

      outline.push(outlineElement);
    }
  }

  private parseClassProperties(xmlContent: string): ObjectProperties {
    const properties: ObjectProperties = {};

    try {
      const parsed = XmlParser.parse(xmlContent);
      const classElement = parsed['class:abapClass'] || parsed['abapClass'];

      if (classElement) {
        properties.final = classElement['@_final'] === 'true';
        properties.abstract = classElement['@_abstract'] === 'true';
        properties.visibility = classElement['@_visibility'] || 'public';
        properties.category = classElement['@_category'];
        properties.fixPointArithmetic =
          classElement['@_fixPointArithmetic'] === 'true';
        properties.unicode = classElement['@_unicode'] === 'true';
      }
    } catch (error) {
      // Return basic properties if parsing fails
    }

    return properties;
  }

  protected buildObjectUrl(objectName: string, fragment?: string): string {
    return this.buildClassUrl(objectName, fragment);
  }

  private buildClassCreationXml(
    objectName: string,
    metadata?: Partial<ObjectMetadata>
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<class:abapClass xmlns:class="http://www.sap.com/adt/oo/classes" 
                 xmlns:adtcore="http://www.sap.com/adt/core"
                 adtcore:type="CLAS/OC"
                 adtcore:name="${objectName}"
                 adtcore:description="${metadata?.description || ''}"
                 adtcore:language="${metadata?.language || 'EN'}"
                 adtcore:masterLanguage="${metadata?.masterLanguage || 'EN'}"
                 adtcore:masterSystem="${metadata?.masterSystem || ''}"
                 adtcore:responsible="${metadata?.responsible || ''}"
                 class:final="${metadata?.final ? 'true' : 'false'}"
                 class:visibility="${metadata?.visibility || 'public'}">
  <adtcore:packageRef adtcore:name="${metadata?.packageName || '$TMP'}"/>
</class:abapClass>`;
  }
}
