/**
 * Manual ts-xsd schema for transport find endpoint
 *
 * Endpoint: GET /sap/bc/adt/cts/transports?_action=FIND
 * Response format: ABAP XML with CTS_REQ_HEADER elements
 *
 * This is a manual schema because the endpoint is undocumented
 * and doesn't have an XSD definition in the SAP ADT SDK.
 *
 * XML structure:
 * <asx:abap xmlns:asx="http://www.sap.com/abapxml">
 *   <asx:values>
 *     <DATA>
 *       <CTS_REQ_HEADER>...</CTS_REQ_HEADER>
 *     </DATA>
 *   </asx:values>
 * </asx:abap>
 */

import schema from '../../speci';

export default schema({
  ns: 'http://www.sap.com/abapxml',
  prefix: 'asx',
  root: 'abap',
  elements: {
    abap: {
      sequence: [
        {
          name: 'values',
          type: 'values',
        },
      ],
      attributes: [
        {
          name: 'version',
          type: 'string',
        },
      ],
    },
    values: {
      sequence: [
        {
          name: 'DATA',
          type: 'DATA',
        },
      ],
    },
    DATA: {
      sequence: [
        {
          name: 'CTS_REQ_HEADER',
          type: 'CTS_REQ_HEADER',
          minOccurs: 0,
          maxOccurs: 'unbounded',
        },
      ],
    },
    CTS_REQ_HEADER: {
      sequence: [
        { name: 'TRKORR', type: 'string' },
        { name: 'TRFUNCTION', type: 'string' },
        { name: 'TRSTATUS', type: 'string' },
        { name: 'TARSYSTEM', type: 'string' },
        { name: 'AS4USER', type: 'string' },
        { name: 'AS4DATE', type: 'string' },
        { name: 'AS4TIME', type: 'string' },
        { name: 'AS4TEXT', type: 'string' },
        { name: 'CLIENT', type: 'string' },
        { name: 'REPOID', type: 'string' },
      ],
    },
  },
} as const);
