/**
 * DTEL (Data Element) object serializer for abapGit format
 * Maps ADK objects to abapGit XML structure
 */

import type { AdkObject } from '@abapify/adk';
import { createSerializer } from '../../lib/create-serializer.js';
import { AbapGitDtelValuesSchema } from './schema.js';
import type { Dd04vTable } from './types.js';

/**
 * Map ADK object to abapGit DD04V structure
 *
 * Note: DataElement doesn't have full ADK support yet, so we work with
 *       generic AdkObject and extract what we can from basic properties
 */
function mapDataElementToAbapGit(dtel: AdkObject): Dd04vTable {
  return {
    ROLLNAME: dtel.name || '',
    DDLANGUAGE: 'E',
    DDTEXT: dtel.description || '',
    HEADLEN: '55',
    SCRLEN1: '10',
    SCRLEN2: '20',
    SCRLEN3: '40',
    DTELMASTER: 'E',
  };
}

/**
 * Serialize ADK Data Element to abapGit XML
 */
export const serializeDataElement = createSerializer({
  valuesSchema: AbapGitDtelValuesSchema,
  mapper: mapDataElementToAbapGit,
  serializerClass: 'LCL_OBJECT_DTEL',
});
