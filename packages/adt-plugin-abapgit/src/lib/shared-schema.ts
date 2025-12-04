/**
 * Shared ts-xml schemas for abapGit XML format
 * These schemas are common across all object serializers
 */

import { tsxml, build } from 'ts-xml';
import type { ElementSchema } from 'ts-xml';

/**
 * asx:values wrapper schema (generic - content defined by caller)
 */
export function createAsxValuesSchema<S extends ElementSchema>(
  contentSchema: S
): ElementSchema {
  return tsxml.schema({
    tag: 'asx:values',
    fields: {
      content: { kind: 'elem', name: contentSchema.tag, schema: contentSchema },
    },
  });
}

/**
 * asx:abap envelope schema
 */
function createAsxAbapSchema(valuesSchema: ElementSchema): ElementSchema {
  return tsxml.schema({
    tag: 'asx:abap',
    ns: {
      asx: 'http://www.sap.com/abapxml',
    },
    fields: {
      version: { kind: 'attr', name: 'version', type: 'string' },
      values: { kind: 'elem', name: 'asx:values', schema: valuesSchema },
    },
  });
}

/**
 * Root abapGit element schema
 */
function createAbapGitRootSchema(asxAbapSchema: ElementSchema): ElementSchema {
  return tsxml.schema({
    tag: 'abapGit',
    fields: {
      version: { kind: 'attr', name: 'version', type: 'string' },
      serializer: { kind: 'attr', name: 'serializer', type: 'string' },
      serializer_version: {
        kind: 'attr',
        name: 'serializer_version',
        type: 'string',
      },
      asxAbap: { kind: 'elem', name: 'asx:abap', schema: asxAbapSchema },
    },
  });
}

/**
 * Build complete abapGit XML from inner values
 *
 * @param valuesSchema - The schema for the object-specific asx:values content
 * @param valuesData - The actual data for asx:values
 * @param serializer - The serializer class name (e.g., "LCL_OBJECT_DEVC")
 * @returns Complete abapGit XML string
 */
export function buildAbapGitXml<T>(
  valuesSchema: ElementSchema,
  valuesData: T,
  serializer: string
): string {
  // Build the schema hierarchy
  const asxValuesSchema = createAsxValuesSchema(valuesSchema);
  const asxAbapSchema = createAsxAbapSchema(asxValuesSchema);
  const rootSchema = createAbapGitRootSchema(asxAbapSchema);

  // Build the data structure
  const fullData = {
    version: 'v1.0.0',
    serializer,
    serializer_version: 'v1.0.0',
    asxAbap: {
      version: '1.0',
      values: {
        content: valuesData,
      },
    },
  };

  return build(rootSchema, fullData);
}

/**
 * Build complete abapGit XML for objects with multiple root elements under asx:values
 *
 * Some ABAP objects (like domains) have multiple root elements directly under <asx:values>
 * instead of a single wrapping element. This function builds each root element separately
 * and concatenates them.
 *
 * @param rootSchemas - Array of schemas for each root element
 * @param rootDataArray - Array of data objects corresponding to each schema
 * @param serializer - The serializer class name (e.g., "LCL_OBJECT_DOMA")
 * @returns Complete abapGit XML string
 *
 * @example
 * // For domains with DD01V and DD07V_TAB:
 * buildAbapGitXmlMultiRoot(
 *   [Dd01vTableSchema, Dd07vTabSchema],
 *   [dd01vData, dd07vTabData],
 *   'LCL_OBJECT_DOMA'
 * )
 */
export function buildAbapGitXmlMultiRoot(
  rootSchemas: ElementSchema[],
  rootDataArray: any[],
  serializer: string
): string {
  // Build each root element separately
  const valuesContent = rootSchemas
    .map((schema, index) => build(schema, rootDataArray[index]))
    .join('');

  // Manually construct the abapGit envelope
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="${serializer}" serializer_version="v1.0.0"><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"><asx:values>${valuesContent}</asx:values></asx:abap></abapGit>`;
}
