/**
 * Workspace Splitter Plugin
 *
 * Writes workspace.xml for each workspace
 */

import { XMLBuilder } from 'fast-xml-parser';
import { definePlugin } from '../plugin';

export const workspaceSplitterPlugin = definePlugin({
  name: 'workspace-splitter',

  hooks: {
    async workspace(ws) {
      ws.logger.info(`Writing ${ws.folderName}/workspace.xml`);

      // Build XML with namespaces
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        format: true,
        indentBy: '  ',
      });

      // Add namespace declarations
      const workspaceWithNs = {
        ...ws.xml,
        '@_xmlns:app': 'http://www.w3.org/2007/app',
        '@_xmlns:atom': 'http://www.w3.org/2005/Atom',
      };

      const workspaceXml = builder.build({
        'app:workspace': workspaceWithNs,
      });

      // Add XML declaration
      const fullXml = `<?xml version="1.0" encoding="utf-8"?>\n${workspaceXml}`;

      // Write file
      await ws.writeFile('workspace.xml', fullXml);
    },
  },
});
