/**
 * adt cts get <TR> - Get transport details
 * 
 * Uses v2 client service layer for transport operations.
 * All business logic is in the service - CLI is just presentation.
 */

import { Command } from 'commander';
import { getAdtClientV2 } from '../../utils/adt-client-v2';

export const ctsGetCommand = new Command('get')
  .description('Get transport request details')
  .argument('<transport>', 'Transport number (e.g., BHFK900123)')
  .option('--objects', 'Show objects in transport', false)
  .option('--json', 'Output as JSON')
  .action(async (transport: string, options) => {
    try {
      const client = await getAdtClientV2();

      console.log(`🔍 Getting transport ${transport}...`);

      // Use the transport service to get specific transport
      const found = await client.services.transports.get(transport);
      
      if (!found) {
        console.error(`❌ Transport ${transport} not found`);
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(found, null, 2));
      } else {
        console.log('\n📋 Transport details:');
        console.log(`  Number:      ${found.number}`);
        console.log(`  Description: ${found.desc || 'N/A'}`);
        console.log(`  Owner:       ${found.owner || 'N/A'}`);
        console.log(`  Status:      ${found.status || 'N/A'}`);
        
        // Show tasks
        if (found.tasks.length > 0) {
          console.log(`\n  Tasks (${found.tasks.length}):`);
          for (const task of found.tasks) {
            console.log(`    - ${task.number}: ${task.desc || 'N/A'} (${task.owner || 'N/A'})`);
          }
        }
        
        // Show objects if --objects flag is set
        if (options.objects) {
          if (found.objects.length > 0) {
            console.log(`\n  Objects (${found.objects.length}):`);
            for (const obj of found.objects) {
              const objType = obj.type || obj.wbtype || 'UNKN';
              const objName = obj.name || 'N/A';
              const objDesc = obj.obj_desc || '';
              console.log(`    - ${obj.pgmid || 'R3TR'} ${objType} ${objName}${objDesc ? ` (${objDesc})` : ''}`);
            }
          } else {
            console.log('\n  Objects: None');
          }
        }
      }

      console.log('\n✅ Done');
    } catch (error) {
      console.error('❌ Get failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
