import { XMLParser } from 'fast-xml-parser';
import {
  ADTDiscoveryService,
  ADTWorkspace,
  ADTCollection,
  ADTCategory,
  ADTTemplateLink,
} from './types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  parseAttributeValue: true,
  trimValues: true,
});

export function parseDiscoveryXml(xmlContent: string): ADTDiscoveryService {
  const result = parser.parse(xmlContent);

  const service = result['app:service'] || result.service;
  const workspaces = service['app:workspace'] || service.workspace;

  const parsedWorkspaces: ADTWorkspace[] = [];

  if (Array.isArray(workspaces)) {
    for (const workspace of workspaces) {
      parsedWorkspaces.push(parseWorkspace(workspace));
    }
  } else if (workspaces) {
    parsedWorkspaces.push(parseWorkspace(workspaces));
  }

  return {
    workspaces: parsedWorkspaces,
  };
}

function parseWorkspace(workspace: any): ADTWorkspace {
  const title = workspace['atom:title'] || workspace.title || 'Unknown';
  const collections = workspace['app:collection'] || workspace.collection || [];

  const parsedCollections: ADTCollection[] = [];

  if (Array.isArray(collections)) {
    for (const collection of collections) {
      parsedCollections.push(parseCollection(collection));
    }
  } else if (collections) {
    parsedCollections.push(parseCollection(collections));
  }

  return {
    title,
    collections: parsedCollections,
  };
}

function parseCollection(collection: any): ADTCollection {
  const title = collection['atom:title'] || collection.title || 'Unknown';
  const href = collection['@href'] || '';
  const accept = collection['app:accept'] || collection.accept;

  let category: ADTCategory | undefined;
  const categoryData = collection['atom:category'] || collection.category;
  if (categoryData) {
    category = {
      term: categoryData['@term'] || '',
      scheme: categoryData['@scheme'] || '',
    };
  }

  let templateLinks: ADTTemplateLink[] = [];
  const templateLinksData =
    collection['adtcomp:templateLinks'] || collection.templateLinks;
  if (templateLinksData) {
    const links =
      templateLinksData['adtcomp:templateLink'] ||
      templateLinksData.templateLink;
    if (Array.isArray(links)) {
      templateLinks = links.map((link) => ({
        rel: link['@rel'] || '',
        template: link['@template'] || '',
      }));
    } else if (links) {
      templateLinks = [
        {
          rel: links['@rel'] || '',
          template: links['@template'] || '',
        },
      ];
    }
  }

  return {
    title,
    href,
    accept,
    category,
    templateLinks: templateLinks.length > 0 ? templateLinks : undefined,
  };
}
