/**
 * ADT Configuration
 *
 * Unified config for all ADT tools
 */

import { defineAdtConfig, type SchemaInfo } from '@abapify/adt-codegen';
import {
  workspaceSplitterPlugin,
  extractCollections,
  bootstrapSchemas,
  // generateTypesPlugin,
} from '@abapify/adt-codegen/plugins';

export default defineAdtConfig({
  // Codegen configuration
  codegen: {
    // Input discovery XML (relative to this file)
    discovery: {
      path: './generated/discovery.xml',
    },

    // Output directory (relative to this file)
    output: {
      clean: true,
      baseDir: './generated',
    },

    // Optional: Filter workspaces and collections
    // Uncomment to enable filtering
    // filters: {
    //   // Filter workspaces by title
    //   workspace: {
    //     title: [/Transport/, /Test/]  // Match any of these patterns
    //   },
    //   // Filter collections
    //   collection: {
    //     title: /DDIC/,                    // Regex match
    //     href: '/sap/bc/adt/ddic/*',       // Glob pattern
    //     category: {
    //       term: 'DDIC',                   // Exact match
    //       scheme: /schema/                // Regex
    //     }
    //   }
    // },

    // Or use array for OR condition (match any filter)
    // filters: [
    //   { workspace: { title: /Transport/ } },
    //   { workspace: { title: /Test/ } }
    // ],

    // Plugins with hooks
    plugins: [
      workspaceSplitterPlugin,
      extractCollections({
        output: ({ href, category }) =>
          `./generated/collections/${href}/${category.term}.json`,
        unique: true,
      }),
      bootstrapSchemas({
        // application/vnd.sap.adt.objecttypeconfiguration.v1+json
        // -> generated/schemas/application/vnd/sap/adt/objecttypeconfiguration/v1.json
        output: (info) => `./generated/schemas/${info.schemaPath}`,
        unique: true,
      }),
      // generateTypesPlugin,
    ],
  },

  // Future: Add other ADT tool configs here
  // cli: { ... },
  // transport: { ... },
});
