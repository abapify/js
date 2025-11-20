/**
 * ADT Configuration with Filters Example
 */

import { defineAdtConfig } from '@abapify/adt-codegen';
import {
  workspaceSplitterPlugin,
  extractCollectionsPlugin,
  generateTypesPlugin,
} from '@abapify/adt-codegen/plugins';

export default defineAdtConfig({
  codegen: {
    discovery: {
      path: './generated/discovery.xml',
    },

    output: {
      clean: true,
      baseDir: './generated',
    },

    // Filter to only process Message-related collections
    filters: {
      collection: {
        title: /Message/, // Only collections with "Message" in title
      },
    },

    plugins: [
      workspaceSplitterPlugin,
      extractCollectionsPlugin,
      generateTypesPlugin,
    ],
  },
});
