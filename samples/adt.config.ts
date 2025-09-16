import type { CliConfig } from '../packages/adt-cli/src/lib/config/interfaces';

// TypeScript configuration with full type safety and IntelliSense
const config: CliConfig = {
  auth: {
    type: 'btp',
    btp: {
      serviceKey: process.env.BTP_SERVICE_KEY_PATH || './service-key.json',
    },
  },

  plugins: {
    formats: [
      {
        name: '@abapify/oat',
        config: {
          enabled: true,
          options: {
            fileStructure: 'hierarchical',
            includeMetadata: true,
            packageMapping: {
              // Static mappings
              finance: 'ZTEAMA_FIN',
              basis: 'ZTEAMA_BASIS',
              utilities: 'ZTEAMA_UTIL',
              import: 'ZTEAMA_IMPORT_PKG',
              export: 'ZTEAMA_EXPORT_PKG',

              // Dynamic transform function
              transform: (remotePkg: string, context?: any) => {
                // ZTEAMA_UNKNOWN -> unknown
                // ZDEV_SOMETHING -> something (for dev system)
                // ZPRD_FINANCE -> finance (for prod system)
                return remotePkg
                  .toLowerCase()
                  .replace(/^z(teama|dev|prd)_/, '')
                  .replace(/_/g, '-');
              },
            },
            objectFilters: {
              include: ['CLAS', 'INTF', 'FUGR', 'TABL'],
              exclude: ['DEVC'], // Don't import package objects themselves
            },
          },
        },
      },
    ],
  },

  defaults: {
    format: 'oat',
    outputPath: './output',
    objectTypes: ['CLAS', 'INTF', 'FUGR', 'TABL'],
  },
};

export default config;
