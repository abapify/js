/**
 * DDIC Data Element Contract
 *
 * ADT endpoint: /sap/bc/adt/ddic/dataelements
 * Content-Type: application/vnd.sap.adt.dataelements.v2+xml
 * Object type: DTEL/DE (dtelde)
 */

import { crud } from '../../helpers/crud';
import {
  dataelements as dataelementsSchema,
  type InferTypedSchema,
} from '../../schemas';

/**
 * Data Element response type - exported for consumers (ADK, etc.)
 */
export type DataElementResponse = InferTypedSchema<typeof dataelementsSchema>;

export type DataelementsContract = typeof dataelementsContract;

export const dataelementsContract = crud({
  basePath: '/sap/bc/adt/ddic/dataelements',
  schema: dataelementsSchema,
  contentType: 'application/vnd.sap.adt.dataelements.v2+xml',
});
