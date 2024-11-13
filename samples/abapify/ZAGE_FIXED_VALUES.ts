import { Domain } from '../adt/objects/doma/domain';

export default {
  adtcore: {
    name: 'ZAGE_FIXED_VALUES',
    description: 'Fixed values (test)',
    createdBy: 'CB9980004611',
    createdAt: '2024-11-08T00:00:00Z',
    changedBy: 'CB9980004611',
    changedAt: '2024-11-08T14:48:16Z',
    language: 'EN',
    responsible: 'CB9980004611',
    masterSystem: 'TRL',
    masterLanguage: 'EN',
    abapLanguageVersion: 'cloudDevelopment',
    version: 'active',
    type: 'DOMA/DD',
    packageRef: {
      type: 'DEVC/K',
      name: 'ZABAPGIT_EXAMPLES_DDIC',
      description: 'DDIC components',
      uri: '/sap/bc/adt/packages/zabapgit_examples_ddic',
    },
  },
  content: {
    typeInformation: {
      datatype: 'CHAR',
      length: 1,
      decimals: 0,
    },
    outputInformation: {
      length: 1,
      style: '00',
      conversionExit: null,
      signExists: false,
      lowercase: false,
      ampmFormat: false,
    },
    valueInformation: {
      valueTableRef: null,
      appendExists: false,
      fixValues: [
        { position: 1, low: 'A', high: null, text: 'This is A' },
        { position: 2, low: 'B', high: null, text: 'This is B' },
      ],
    },
  },

  links: [
    {
      title: 'Historic versions',
      rel: 'http://www.sap.com/adt/relations/versions',
      href: 'versions',
    },
    {
      title: 'Representation in SAP Gui',
      type: 'application/vnd.sap.sapgui',
      rel: 'self',
      href: '/sap/bc/adt/vit/wb/object_type/domadd/object_name/ZAGE_FIXED_VALUES',
    },
    {
      title: 'Documentation',
      type: 'application/vnd.sap.sapgui',
      rel: 'http://www.sap.com/adt/relations/documentation',
      href: '/sap/bc/adt/vit/docu/object_type/do/object_name/zage_fixed_values?masterLanguage=E&mode=edit',
    },
    {
      title: 'Activation Log',
      type: 'application/vnd.sap.adt.logs+xml',
      rel: 'http://www.sap.com/adt/relations/ddic/activationlog',
      href: '/sap/bc/adt/ddic/logs/db/ACTDOMAZAGE_FIXED_VALUES',
    },
    {
      title: 'Landing Page (HTML)',
      type: 'text/html',
      rel: 'http://www.sap.com/adt/relations/source',
      href: './zage_fixed_values',
    },
  ],
} as Domain;
