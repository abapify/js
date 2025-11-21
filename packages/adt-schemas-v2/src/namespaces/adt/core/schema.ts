import { createNamespace } from '../../../base/namespace';

export const adtcore = createNamespace({
  uri: 'http://www.sap.com/adt/core',
  prefix: 'adtcore',
});

export const AdtCoreObjectFields = {
  name: adtcore.attr('name'),
  uri: adtcore.attr('uri'),
  type: adtcore.attr('type'),
  description: adtcore.attr('description'),
  version: adtcore.attr('version'),
  language: adtcore.attr('language'),
  masterLanguage: adtcore.attr('masterLanguage'),
  masterSystem: adtcore.attr('masterSystem'),
  responsible: adtcore.attr('responsible'),
  changedBy: adtcore.attr('changedBy'),
  createdBy: adtcore.attr('createdBy'),
  changedAt: adtcore.attr('changedAt'),
  createdAt: adtcore.attr('createdAt'),
} as const;
