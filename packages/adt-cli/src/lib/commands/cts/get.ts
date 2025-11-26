/**
 * adt cts get <TR> - Get transport details
 * 
 * Uses v2 client with adt-contracts CTS contract.
 */

import { Command } from 'commander';
import { getAdtClientV2 } from '../../utils/adt-client-v2';

export const ctsGetCommand = new Command('get')
  .description('Get transport request details')
  .argument('<transport>', 'Transport number (e.g., BHFK900123)')
  .option('--json', 'Output as JSON')
  .action(async (transport: string, options) => {
    try {
      const client = await getAdtClientV2();

      console.log(`🔍 Getting transport ${transport}...`);

      // Use transports.get with specific transport number
      const result = await client.adt.cts.transports.get({
        transportNumber: transport,
      });

      if (options.json) {
        console.log(result);
      } else {
        console.log('\n📋 Transport details:');
        console.log(result);
      }

      console.log('\n✅ Done');
    } catch (error) {
      console.error('❌ Get failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
