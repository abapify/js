/**
 * Data Element (DTEL) object handler for abapGit format
 * 
 * Note: DataElement doesn't have full ADK v2 support yet, using string type
 */

import { dtel } from '../schemas';
import { createHandler } from '../base';

export const dataElementHandler = createHandler('DTEL', {
  schema: dtel,

  toAbapGit: (obj) => ({
    ROLLNAME: obj.name ?? '',
    DDLANGUAGE: 'E',
    DDTEXT: obj.description ?? '',
    HEADLEN: '55',
    SCRLEN1: '10',
    SCRLEN2: '20',
    SCRLEN3: '40',
    DTELMASTER: 'E',
  }),
});
