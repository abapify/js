/**
 * Manual schema for transport creation POST request.
 * 
 * POST /sap/bc/adt/cts/transportrequests
 * 
 * The create request has a simpler structure than list/get responses:
 * - root has useraction="newrequest" attribute
 * - request is direct child of root (not nested in workbench/modifiable)
 * - request has type, target, cts_project attributes (not in base schema)
 * - task has owner attribute
 */

import schema from '../../speci';

export default schema({
  ns: 'http://www.sap.com/cts/adt/tm',
  prefix: 'tm',
  root: 'root',
  // SAP ADT requires namespace prefix on attributes (non-standard XML)
  prefixedAttributes: true,
  elements: {
    root: {
      sequence: [
        {
          name: 'request',
          type: 'request',
          minOccurs: 0,
          maxOccurs: 1,
        },
      ],
      attributes: [
        {
          name: 'useraction',
          type: 'string',
        },
      ],
    },
    request: {
      sequence: [
        {
          name: 'task',
          type: 'task',
          minOccurs: 0,
          maxOccurs: 'unbounded',
        },
      ],
      attributes: [
        {
          name: 'desc',
          type: 'string',
        },
        {
          name: 'type',
          type: 'string',
        },
        {
          name: 'target',
          type: 'string',
        },
        {
          name: 'cts_project',
          type: 'string',
        },
      ],
    },
    task: {
      attributes: [
        {
          name: 'owner',
          type: 'string',
        },
      ],
    },
  },
} as const);
