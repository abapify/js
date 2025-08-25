import { Command } from 'commander';
import { SearchService } from '../services/search/service';
import { IconRegistry } from '../utils/icon-registry';
import { adtClient } from '../shared/clients';

export const searchCommand = new Command('search')
  .argument('[searchTerm]', 'Search term (optional)')
  .description('Search ABAP objects using ADT Repository Information System')
  .option('-p, --package <package>', 'Filter by package name')
  .option(
    '-t, --object-type <type>',
    'Filter by object type (CLAS, INTF, PROG, etc.)'
  )
  .option('-m, --max-results <number>', 'Maximum number of results', '100')
  .option('--no-description', 'Exclude descriptions from results')
  .option('--debug', 'Enable debug output', false)
  .action(async (searchTerm, options) => {
    try {
      const searchService = new SearchService(adtClient);

      console.log(`🔍 Searching ABAP objects...`);

      const searchOptions = {
        operation: 'quickSearch' as const,
        query: searchTerm,
        packageName: options.package,
        objectType: options.objectType,
        maxResults: parseInt(options.maxResults),
        noDescription: options.noDescription,
        debug: options.debug,
      };

      const result = await searchService.searchObjects(searchOptions);

      if (result.objects.length === 0) {
        console.log('No objects found matching the search criteria.');
        return;
      }

      console.log(`\n📋 Found ${result.totalCount} objects:\n`);

      // Group by object type for better display
      const groupedObjects = result.objects.reduce((groups, obj) => {
        const type = obj.type;
        if (!groups[type]) groups[type] = [];
        groups[type].push(obj);
        return groups;
      }, {} as Record<string, typeof result.objects>);

      for (const [objectType, objects] of Object.entries(groupedObjects)) {
        const icon = IconRegistry.getIcon(objectType);
        console.log(`${icon} ${objectType} (${objects.length} objects):`);
        for (const obj of objects) {
          console.log(`   ${obj.name}`);
          if (obj.description) {
            console.log(`     📝 ${obj.description}`);
          }
          console.log(`     📦 Package: ${obj.packageName}`);
          if (options.debug) {
            console.log(`     🔗 URI: ${obj.uri}`);
          }
          console.log();
        }
      }
    } catch (error) {
      console.error(
        `❌ Search failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
