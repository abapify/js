/**
 * Fixture data returned by the mock ADT server.
 *
 * Shapes are kept minimal but realistic enough to exercise
 * the primary response-parsing paths in the MCP tools using
 * simplified JSON representations of typical ADT responses.
 */

export const fixtures = {
  discovery: {
    workspaces: [
      {
        title: 'ADT Core Services',
        collections: [
          { href: '/sap/bc/adt/core', title: 'Core' },
          { href: '/sap/bc/adt/repository', title: 'Repository' },
        ],
      },
      {
        title: 'CTS Services',
        collections: [
          {
            href: '/sap/bc/adt/cts/transportrequests',
            title: 'Transport Requests',
          },
        ],
      },
    ],
  },

  session: {
    session: {
      properties: {
        property: [
          { name: 'com.sap.adt.user', _text: 'DEVELOPER' },
          { name: 'com.sap.adt.language', _text: 'EN' },
          { name: 'com.sap.adt.client', _text: '100' },
        ],
      },
    },
  },

  systemInfo: {
    systemID: 'DEV',
    client: '100',
    userName: 'DEVELOPER',
    language: 'EN',
    release: '756',
    sapRelease: '2023',
  },

  searchResults: {
    objectReference: [
      {
        name: 'ZCL_EXAMPLE',
        type: 'CLAS/OC',
        uri: '/sap/bc/adt/oo/classes/zcl_example',
        description: 'Example class',
        packageName: 'ZPACKAGE',
      },
      {
        name: 'ZIF_EXAMPLE',
        type: 'INTF/OI',
        uri: '/sap/bc/adt/oo/interfaces/zif_example',
        description: 'Example interface',
        packageName: 'ZPACKAGE',
      },
    ],
  },

  transportList: {
    request: [
      {
        trkorr: 'DEVK900001',
        as4text: 'First transport',
        as4user: 'DEVELOPER',
        trstatus: 'D',
        trfunction: 'K',
        tarsystem: 'QAS',
      },
      {
        trkorr: 'DEVK900002',
        as4text: 'Second transport',
        as4user: 'DEVELOPER',
        trstatus: 'D',
        trfunction: 'K',
        tarsystem: 'QAS',
      },
    ],
  },

  transportGet: {
    request: {
      trkorr: 'DEVK900001',
      as4text: 'First transport',
      as4user: 'DEVELOPER',
      trstatus: 'D',
      trfunction: 'K',
      tarsystem: 'QAS',
      task: [{ trkorr: 'DEVK900001_T1', as4user: 'DEVELOPER', trstatus: 'D' }],
    },
  },

  atcRun: {
    worklistId: 'WL_001',
    id: 'RUN_001',
  },

  atcWorklist: {
    objects: [
      {
        uri: '/sap/bc/adt/oo/classes/zcl_example',
        type: 'CLAS',
        name: 'ZCL_EXAMPLE',
        findings: [
          {
            checkId: 'CL_CI_TEST_AMDP_HDB_MIGRATION',
            checkTitle: 'AMDP HDB Migration',
            messageTitle: 'Consider migrating to AMDP',
            priority: 2,
            uri: '/sap/bc/adt/oo/classes/zcl_example/source/main#start=10,0',
          },
        ],
      },
    ],
  },
};
