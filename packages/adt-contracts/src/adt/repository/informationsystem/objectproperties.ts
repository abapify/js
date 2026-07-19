/**
 * ADT Repository Information System — object properties.
 *
 * SAP supplies the canonical object URI through quick search or object
 * metadata.  This endpoint enriches it with generic facets such as package
 * and application component; it does not construct an object-specific URL.
 */

import { http } from '../../../base';
import { objectProperties } from '../../../schemas';
import { assertAdtRelativeUri } from '../sourceversions';

export const OBJECT_PROPERTIES_RESULT_MIME =
  'application/vnd.sap.adt.repository.objproperties.result.v1+xml';

export const objectPropertiesContract = {
  values: (params: { uri: string; facets?: string[] }) => {
    assertAdtRelativeUri(params.uri);

    const facets = [...new Set(params.facets ?? [])].filter(
      (facet) => facet.trim().length > 0,
    );

    return http.get(
      '/sap/bc/adt/repository/informationsystem/objectproperties/values',
      {
        query: {
          uri: params.uri,
          ...(facets.length > 0 ? { facet: facets } : {}),
        },
        responses: { 200: objectProperties },
        headers: { Accept: OBJECT_PROPERTIES_RESULT_MIME },
      },
    );
  },
};

export type ObjectPropertiesContract = typeof objectPropertiesContract;
