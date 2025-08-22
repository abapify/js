export interface ADTDiscoveryService {
  workspaces: ADTWorkspace[];
}

export interface ADTWorkspace {
  title: string;
  collections: ADTCollection[];
}

export interface ADTCollection {
  title: string;
  href: string;
  accept?: string;
  category?: ADTCategory;
  templateLinks?: ADTTemplateLink[];
}

export interface ADTCategory {
  term: string;
  scheme: string;
}

export interface ADTTemplateLink {
  rel: string;
  template: string;
}
