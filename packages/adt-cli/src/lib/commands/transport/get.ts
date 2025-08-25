import { Command } from 'commander';
import { TransportService } from '../../services/transport';
import { adtClient } from '../../shared/clients';

export const transportGetCommand = new Command('get')
  .argument('<trNumber>', 'Transport request or task number')
  .description('Get details of a transport request or task')
  .option('--objects', 'Include objects in the transport', false)
  .option('--tasks', 'Include task details', false)
  .option('--full', 'Include all details (objects + tasks)', false)
  .option('--json', 'Output as JSON', false)
  .option('--debug', 'Enable debug output', false)
  .action(async (trNumber, options) => {
    try {
      const transportService = new TransportService(adtClient);

      console.log(`🚚 Fetching transport request: ${trNumber}`);
      const result = await transportService.getTransport(trNumber, {
        includeObjects: options.objects || options.full,
        includeTasks: options.tasks || options.full,
        debug: options.debug,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Check if requested number is a task, not the main transport
      const isTask = result.transport.number !== trNumber;
      const requestedTask = isTask
        ? result.transport.tasks?.find((t) => t.number === trNumber)
        : null;

      if (isTask && requestedTask) {
        console.log(`\n📋 Task Details:`);
        console.log(`🚛 Task: ${requestedTask.number}`);
        console.log(`   Description: ${requestedTask.description}`);
        console.log(`   Owner: ${requestedTask.owner}`);
        console.log(`   Type: ${requestedTask.type}`);
        console.log(`   Status: ${requestedTask.status}`);
        console.log(`\n🚛 Parent Transport: ${result.transport.number}`);
        console.log(`   Description: ${result.transport.description}`);
      } else {
        console.log(`\n🚛 Transport Request: ${result.transport.number}`);
        console.log(`   Description: ${result.transport.description}`);
        console.log(`   Status: ${result.transport.status}`);
        console.log(`   Owner: ${result.transport.owner}`);
        console.log(`   Type: ${result.transport.type || 'K'}`);
        console.log(`   Target: ${result.transport.target || 'LOCAL'}`);

        if (result.transport.tasks && result.transport.tasks.length > 0) {
          console.log(`\n📋 Tasks (${result.transport.tasks.length}):`);
          for (const task of result.transport.tasks) {
            console.log(`\n📋 Task: ${task.number}`);
            console.log(`   Description: ${task.description}`);
            console.log(`   Owner: ${task.owner}`);
            console.log(`   Type: ${task.type}`);
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Transport get failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
