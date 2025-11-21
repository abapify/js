import { Command } from 'commander';
import { createAdtClient } from '@abapify/adt-client-v2';
import { AuthManager } from '@abapify/adt-client';

export const searchCommand = new Command('search')
  .description('Search for ABAP objects in the repository')
  .argument('<query>', 'Search query (supports wildcards like *)')
  .option('-m, --max <number>', 'Maximum number of results', '50')
  .option('--json', 'Output results as JSON')
  .action(async (query: string, options) => {
    try {
      // Load session from v1 auth manager
      const authManager = new AuthManager();
      const session = authManager.loadSession();

      if (!session || !session.basicAuth) {
        console.error('❌ Not authenticated');
        console.error('💡 Run "npx adt auth login" to authenticate first');
        process.exit(1);
      }

      // Create v2 client
      const adtClient = createAdtClient({
        baseUrl: session.basicAuth.host,
        username: session.basicAuth.username,
        password: session.basicAuth.password,
        client: session.basicAuth.client,
      });

      const maxResults = parseInt(options.max, 10);

      console.log(`🔍 Searching for: "${query}" (max: ${maxResults} results)...\n`);

      // Perform search
      const results = await adtClient.adt.repository.informationsystem.search.quickSearch({
        query,
        maxResults,
      });

      // Handle results
      const objects = results.objectReference
        ? (Array.isArray(results.objectReference)
            ? results.objectReference
            : [results.objectReference])
        : [];

      if (objects.length === 0) {
        console.log('No objects found matching your query.');
        return;
      }

      if (options.json) {
        // Output as JSON
        console.log(JSON.stringify(objects, null, 2));
      } else {
        // Format as table
        console.log(`Found ${objects.length} object(s):\n`);

        objects.forEach((obj, index) => {
          console.log(`${index + 1}. ${obj.name} (${obj.type})`);
          if (obj.description) {
            console.log(`   ${obj.description}`);
          }
          if (obj.packageName) {
            console.log(`   Package: ${obj.packageName}`);
          }
          console.log(`   URI: ${obj.uri}`);
          console.log();
        });
      }

      console.log('✅ Search complete!');
    } catch (error) {
      console.error(
        '❌ Search failed:',
        error instanceof Error ? error.message : String(error)
      );
      if (error instanceof Error && error.stack) {
        console.error('\nStack trace:', error.stack);
      }
      process.exit(1);
    }
  });
