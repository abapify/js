/**
 * ADT vit/wb — Basic Object Properties (classic Workbench metadata).
 *
 * Endpoint template (from ADT discovery):
 *   GET /sap/bc/adt/vit/wb/object_type/{type}/object_name/{name}
 *
 * Accept: application/vnd.sap.adt.basic.object.properties+xml
 * Response: adtcore:mainObject
 *
 * Classic BAdI uses vit types:
 *   sxsdxd — BAdI definition  (repository type SXSD/XD)
 *   sxcixi — BAdI implementation (repository type SXCI/XI)
 */

import { contract, http } from '../../../base';
import { adtcore, type InferTypedSchema } from '../../../schemas';

export const BASIC_OBJECT_PROPERTIES_MIME =
  'application/vnd.sap.adt.basic.object.properties+xml';

/** vit/wb object_type segment for classic BAdI definitions. */
export const CLASSIC_BADI_DEFINITION_VIT_TYPE = 'sxsdxd';

/** vit/wb object_type segment for classic BAdI implementations. */
export const CLASSIC_BADI_IMPLEMENTATION_VIT_TYPE = 'sxcixi';

export type BasicObjectPropertiesResponse = InferTypedSchema<typeof adtcore>;

function objectPropertiesPath(vitType: string, objectName: string): string {
  const normalizedType = vitType.trim().toLowerCase();
  const normalizedName = objectName.trim().toLowerCase();
  return `/sap/bc/adt/vit/wb/object_type/${encodeURIComponent(normalizedType)}/object_name/${encodeURIComponent(normalizedName)}`;
}

function getByVitType(vitType: string) {
  return (objectName: string) =>
    http.get(objectPropertiesPath(vitType, objectName), {
      responses: { 200: adtcore },
      headers: { Accept: BASIC_OBJECT_PROPERTIES_MIME },
    });
}

/**
 * /sap/bc/adt/vit/wb/object_type/{type}/object_name/{name}
 */
export const vitWbObjectPropertiesContract = contract({
  /** Generic read for any vit/wb object_type segment. */
  get: (params: { vitType: string; objectName: string }) =>
    http.get(objectPropertiesPath(params.vitType, params.objectName), {
      responses: { 200: adtcore },
      headers: { Accept: BASIC_OBJECT_PROPERTIES_MIME },
    }),

  /** Classic BAdI definition (SXSD/XD). */
  getDefinition: getByVitType(CLASSIC_BADI_DEFINITION_VIT_TYPE),

  /** Classic BAdI implementation (SXCI/XI). */
  getImplementation: getByVitType(CLASSIC_BADI_IMPLEMENTATION_VIT_TYPE),
});

export type VitWbObjectPropertiesContract =
  typeof vitWbObjectPropertiesContract;
