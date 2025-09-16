import type {
  CliConfig,
  PluginSpec,
  OatPluginOptions,
  AbapGitPluginOptions,
  CustomPluginOptions,
} from '../packages/adt-cli/src/lib/config/interfaces';

// Environment-specific configuration with TypeScript power
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Dynamic plugin configuration based on environment
const getPluginConfig = (): PluginSpec[] => {
  const basePlugins: PluginSpec[] = [
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

            // Dynamic mappings with functions
            transform: (remotePkg: string, context?: any) => {
              return remotePkg
                .toLowerCase()
                .replace(/^z(teama|dev|prd)_/, '')
                .replace(/_/g, '-');
            },
          },
          objectFilters: {
            include: ['CLAS', 'INTF', 'FUGR', 'TABL', 'DDLS'],
            exclude: ['DEVC'],
          },
        } as OatPluginOptions,
      },
    },
  ];

  // Add development-specific plugins
  if (isDev) {
    basePlugins.push({
      name: '@abapify/abapgit',
      config: {
        enabled: true,
        options: {
          xmlFormat: true,
          includeInactive: false,
          packageStructure: true,
        } as AbapGitPluginOptions,
      },
    });
  }

  // Add production-specific plugins
  if (isProduction) {
    basePlugins.push({
      name: '@company/enterprise-format',
      config: {
        enabled: true,
        options: {
          auditLogging: true,
          encryptSensitiveData: true,
          complianceMode: 'SOX',
        } as CustomPluginOptions,
      },
    });
  }

  return basePlugins;
};

// Type-safe configuration with intelligent defaults
const config: CliConfig = {
  auth: {
    type: (process.env.ADT_AUTH_TYPE as 'btp' | 'basic' | 'mock') || 'btp',
    btp:
      process.env.ADT_AUTH_TYPE === 'btp'
        ? {
            serviceKey:
              process.env.BTP_SERVICE_KEY_PATH || './service-key.json',
          }
        : undefined,
    basic:
      process.env.ADT_AUTH_TYPE === 'basic'
        ? {
            username: process.env.ADT_USERNAME!,
            password: process.env.ADT_PASSWORD!,
            host: process.env.ADT_HOST!,
          }
        : undefined,
    mock:
      process.env.ADT_AUTH_TYPE === 'mock'
        ? {
            enabled: true,
            mockData: './mock-data',
          }
        : undefined,
  },

  plugins: {
    formats: getPluginConfig(),
  },

  defaults: {
    format: isDev ? 'abapgit' : 'oat',
    outputPath: process.env.ADT_OUTPUT_PATH || './output',
    objectTypes: [
      'CLAS', // Classes
      'INTF', // Interfaces
      'FUGR', // Function Groups
      'DDLS', // CDS Views
      'TABL', // Tables
      ...(isDev ? ['PROG', 'FORM'] : []), // Additional types in dev
    ],
  },
};

export default config;
