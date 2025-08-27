import { local, remote } from '@abapify/adt-cli/config/types';

export default {
  oat: {
    packageMapping: {
      // Static mappings: localName -> remoteName
      finance: 'ZTEAMA_FIN',
      basis: 'ZTEAMA_BASIS',
      utilities: 'ZTEAMA_UTIL',

      // You can even have a package literally named "import" or "export"
      import: 'ZTEAMA_IMPORT_PKG',
      export: 'ZTEAMA_EXPORT_PKG',

      // Transform functions for unmapped packages
      [local]: (remotePkg: string, context) => {
        // ZTEAMA_UNKNOWN -> unknown
        // ZDEV_SOMETHING -> something (for dev system)
        // ZPRD_FINANCE -> finance (for prod system)
        return remotePkg
          .toLowerCase()
          .replace(/^z(teama|dev|prd)_/, '')
          .replace(/_/g, '-'); // Convert underscores to hyphens
      },

      [remote]: (localPkg: string, context) => {
        // unknown -> ZTEAMA_UNKNOWN
        // finance -> ZTEAMA_FINANCE (default)
        // finance -> ZDEV_FINANCE (dev environment)
        const prefix =
          context?.teamPrefix ||
          process.env.TEAM_PREFIX ||
          (context?.targetEnv === 'DEV' ? 'ZDEV' : 'ZTEAMA');

        const normalizedPkg = localPkg.toUpperCase().replace(/-/g, '_');
        return `${prefix}_${normalizedPkg}`;
      },
    },

    objectFilters: {
      include: ['CLAS', 'INTF', 'FUGR', 'TABL'],
      exclude: ['DEVC'], // Don't import package objects themselves
    },

    deployment: {
      targetSystem: 'DEV100',
      transportLayer: 'ZDEV',
      createMissingPackages: true,
    },
  },
};
