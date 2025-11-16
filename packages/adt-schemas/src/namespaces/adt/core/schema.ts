import { createNamespace } from "../../../base/namespace";

/**
 * ADT Core namespace schemas
 *
 * Namespace: http://www.sap.com/adt/core
 * Prefix: adtcore
 */

/**
 * ADT Core namespace object
 * Use adtcore.uri for namespace URI, adtcore.prefix for prefix
 */
export const adtcore = createNamespace({
  uri: "http://www.sap.com/adt/core",
  prefix: "adtcore",
});

/**
 * Common ADT Core attribute fields (reusable mixin)
 * Use these for simple object references
 */
export const AdtCoreFields = {
  uri: adtcore.attr("uri"),
  type: adtcore.attr("type"),
  name: adtcore.attr("name"),
  description: adtcore.attr("description"),
} as const;

/**
 * Full ADT Core object attribute fields
 * Use these for complete object representations
 */
export const AdtCoreObjectFields = {
  ...AdtCoreFields,
  version: adtcore.attr("version"),
  descriptionTextLimit: adtcore.attr("descriptionTextLimit"),
  language: adtcore.attr("language"),
  masterLanguage: adtcore.attr("masterLanguage"),
  masterSystem: adtcore.attr("masterSystem"),
  abapLanguageVersion: adtcore.attr("abapLanguageVersion"),
  responsible: adtcore.attr("responsible"),
  changedBy: adtcore.attr("changedBy"),
  createdBy: adtcore.attr("createdBy"),
  changedAt: adtcore.attr("changedAt"),
  createdAt: adtcore.attr("createdAt"),
} as const;

/**
 * Core ADT object schema
 */
export const AdtCoreSchema = adtcore.schema({
  tag: "adtcore:core",
  fields: AdtCoreObjectFields,
} as const);

/**
 * Package reference schema
 */
export const AdtCorePackageRefSchema = adtcore.schema({
  tag: "adtcore:packageRef",
  fields: AdtCoreFields,
} as const);
