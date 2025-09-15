import { ConnectionManager } from '../../client/connection-manager.js';
import {
  SystemInfo,
  ADTDiscoveryService,
  ADTWorkspace,
  ADTCollection,
  ADTCategory,
  ADTTemplateLink,
} from './types.js';
import { XmlParser } from '../../utils/xml-parser.js';
import { ErrorHandler } from '../../utils/error-handler.js';

export class DiscoveryService {
  constructor(private connectionManager: ConnectionManager) {}

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const url = '/sap/bc/adt/discovery';
      const response = await this.connectionManager.request(url);
      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response);
      }
      const xmlContent = await response.text();
      const parsed = XmlParser.parse(xmlContent);
      return this.parseSystemInfo(parsed);
    } catch (error) {
      if (error instanceof Error && 'category' in error) throw error;
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getDiscovery(): Promise<ADTDiscoveryService> {
    try {
      const url = '/sap/bc/adt/discovery';
      const response = await this.connectionManager.request(url);
      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response);
      }
      const xmlContent = await response.text();
      const parsed = XmlParser.parse(xmlContent);
      return this.parseDiscovery(parsed);
    } catch (error) {
      if (error instanceof Error && 'category' in error) throw error;
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  private parseSystemInfo(parsed: any): SystemInfo {
    const systemInfo: SystemInfo = {} as any;

    const service = parsed['app:service'] || parsed.service;
    if (!service) return systemInfo;

    // Try common attributes
    (systemInfo as any).systemId =
      XmlParser.extractAttribute(service, 'systemId') ||
      XmlParser.extractAttribute(service, 'id');
    (systemInfo as any).adtVersion = XmlParser.extractAttribute(
      service,
      'version'
    );

    // Supported features from collections hrefs
    const workspaces = service['app:workspace'] || service.workspace;
    const supported: string[] = [];
    const wsArray = Array.isArray(workspaces)
      ? workspaces
      : workspaces
      ? [workspaces]
      : [];
    for (const ws of wsArray) {
      const collections = ws['app:collection'] || ws.collection;
      const collArray = Array.isArray(collections)
        ? collections
        : collections
        ? [collections]
        : [];
      for (const coll of collArray) {
        const href = XmlParser.extractAttribute(coll, 'href');
        if (href) supported.push(href);
      }
    }
    (systemInfo as any).supportedFeatures = supported;

    return systemInfo;
  }

  private parseDiscovery(parsed: any): ADTDiscoveryService {
    const service = parsed['app:service'] || parsed.service;
    const workspaces = service?.['app:workspace'] || service?.workspace || [];
    const parsedWorkspaces: ADTWorkspace[] = [];

    const wsArray = Array.isArray(workspaces)
      ? workspaces
      : workspaces
      ? [workspaces]
      : [];
    for (const ws of wsArray) {
      parsedWorkspaces.push(this.parseWorkspace(ws));
    }

    return { workspaces: parsedWorkspaces };
  }

  private parseWorkspace(workspace: any): ADTWorkspace {
    const title = workspace['atom:title'] || workspace.title || 'Unknown';
    const collections =
      workspace['app:collection'] || workspace.collection || [];

    const parsedCollections: ADTCollection[] = [];
    const collArray = Array.isArray(collections)
      ? collections
      : collections
      ? [collections]
      : [];
    for (const coll of collArray) {
      parsedCollections.push(this.parseCollection(coll));
    }

    return { title, collections: parsedCollections };
  }

  private parseCollection(collection: any): ADTCollection {
    const title = collection['atom:title'] || collection.title || 'Unknown';
    const href = collection['@href'] || '';
    const accept = collection['app:accept'] || collection.accept;

    let category: ADTCategory | undefined;
    const cat = collection['atom:category'] || collection.category;
    if (cat) {
      category = {
        term: cat['@term'] || '',
        scheme: cat['@scheme'] || '',
      };
    }

    let templateLinks: ADTTemplateLink[] = [];
    const tlinks =
      collection['adtcomp:templateLinks'] || collection.templateLinks;
    if (tlinks) {
      const links = tlinks['adtcomp:templateLink'] || tlinks.templateLink;
      if (Array.isArray(links)) {
        templateLinks = links.map((l: any) => ({
          rel: l['@rel'] || '',
          template: l['@template'] || '',
        }));
      } else if (links) {
        templateLinks = [
          { rel: links['@rel'] || '', template: links['@template'] || '' },
        ];
      }
    }

    return {
      title,
      href,
      accept,
      category,
      templateLinks: templateLinks.length ? templateLinks : undefined,
    };
  }
}
