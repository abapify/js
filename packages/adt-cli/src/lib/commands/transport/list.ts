import { Command } from 'commander';
import { TransportService } from '../../services/transport';
import { adtClient } from '../../shared/clients';

export const transportListCommand = new Command('list')
  .alias('ls')
  .description('List transport requests')
  .option('-u, --user <user>', 'Filter by user')
  .option('-s, --status <status>', 'Filter by status')
  .option('-m, --max <number>', 'Maximum number of results', '50')
  .option('--debug', 'Enable debug output', false)
  .action(async (options) => {
    try {
      const transportService = new TransportService(adtClient);

      const filters = {
        user: options.user,
        status: options.status,
        maxResults: parseInt(options.max),
        debug: options.debug,
      };

      const result = await transportService.listTransports(filters);

      console.log(`\n📋 Found ${result.transports.length} transport requests:`);

      if (result.transports.length === 0) {
        console.log('No transport requests found.');
        return;
      }

      for (const transport of result.transports) {
        console.log(`\n🚛 ${transport.number}`);
        console.log(`   Description: ${transport.description}`);
        console.log(`   Status: ${transport.status}`);
        console.log(`   Owner: ${transport.owner}`);
        if (transport.created) {
          console.log(`   Created: ${transport.created}`);
        }
        if (transport.tasks && transport.tasks.length > 0) {
          console.log(`   Tasks: ${transport.tasks.length}`);
        }
      }
    } catch (error) {
      console.error(
        '❌ Transport list failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
