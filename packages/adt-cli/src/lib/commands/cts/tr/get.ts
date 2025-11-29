/**
 * adt cts get <TR> - Get transport details
 * 
 * Uses v2 client service layer for transport operations.
 * All business logic is in the service - CLI is just presentation.
 * 
 * Response type is inferred from transportmanagmentSingle schema:
 * - root: rootSingle (extends root)
 * - request: requestExt (extends request with status_text, target_desc, etc.)
 */

import { Command } from 'commander';
import { getAdtClientV2 } from '../../../utils/adt-client-v2';

export const ctsGetCommand = new Command('get')
  .description('Get transport request details')
  .argument('<transport>', 'Transport number (e.g., BHFK900123)')
  .option('--json', 'Output as JSON')
  .option('--attributes', 'Show transport attributes')
  .option('--objects', 'Show list of objects')
  .action(async (transport: string, options) => {
    try {
      const client = await getAdtClientV2();

      process.stdout.write(`🔍 Getting transport ${transport}...`);

      // Use the transport service to get specific transport (direct API call)
      const response = await client.services.transports.get(transport);

      // Clear the "Getting..." line
      process.stdout.write('\r\x1b[K');

      if (options.json) {
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Human-readable tree format
        // Response type is inferred from transportmanagmentSingle schema
        const r = response.request;
        if (r) {
          console.log(`📋 Transport: ${r.number}`);
          console.log(`   Description: ${r.desc || '-'}`);
          console.log(`   Owner: ${r.owner || '-'}`);
          console.log(`   Status: ${r.status_text || r.status || '-'}`);
          if (r.target_desc || r.target) {
            console.log(`   Target: ${r.target_desc || r.target}`);
          }
          if (r.source_client) {
            console.log(`   Client: ${r.source_client}`);
          }
          
          // Attributes (optional)
          if (options.attributes && r.attributes && r.attributes.length > 0) {
            console.log(`\n   🏷️  Attributes:`);
            for (const attr of r.attributes) {
              console.log(`      ${attr.attribute}: ${attr.value} (${attr.description})`);
            }
          }
          
          // Tasks
          if (r.task && r.task.length > 0) {
            console.log(`\n   📁 Tasks (${r.task.length}):`);
            for (const task of r.task) {
              // Note: task uses base type but API returns extended fields
              const t = task as typeof task & { status_text?: string };
              console.log(`      └─ ${t.number}: ${t.desc || '-'} [${t.owner}] (${t.status_text || t.status})`);
              
              // Objects in task (optional)
              if (options.objects && task.abap_object && task.abap_object.length > 0) {
                for (const obj of task.abap_object) {
                  console.log(`         📦 ${obj.pgmid}/${obj.type} ${obj.name}`);
                }
              }
            }
          }
          
          // All objects (optional, shown if --objects and no tasks shown objects)
          if (options.objects && r.all_objects?.abap_object && r.all_objects.abap_object.length > 0 && !r.task?.length) {
            console.log(`\n   📦 Objects (${r.all_objects.abap_object.length}):`);
            for (const obj of r.all_objects.abap_object) {
              console.log(`      ${obj.pgmid}/${obj.type} ${obj.name}`);
            }
          }
        } else {
          console.log('📋 Transport response received (empty)');
        }
      }

    } catch (error) {
      console.error('❌ Get failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
