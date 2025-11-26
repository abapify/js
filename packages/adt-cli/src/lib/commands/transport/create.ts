import { Command } from 'commander';
import { adtClient } from '../../shared/clients';

export const transportCreateCommand = new Command('create')
  .description('Create a new transport request')
  .option('-d, --description <desc>', 'Transport description')
  .option('-t, --type <type>', 'Transport type', 'K')
  .option('--target <target>', 'Transport target', 'LOCAL')
  .option('--project <project>', 'CTS project')
  .option('--owner <owner>', 'Task owner (default: current user)')
  .option('--json', 'Output as JSON', false)
  .action(async (options) => {
    try {
      if (!options.description) {
        console.error(
          '❌ Description is required. Use -d or --description option.'
        );
        process.exit(1);
      }

      console.log(`🚚 Creating transport request: "${options.description}"`);

      const result = await adtClient.cts.createTransport({
        description: options.description,
        type: options.type,
        target: options.target,
        project: options.project,
        owner: options.owner,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`\n✅ Transport request created successfully!`);
      console.log(`\n🚛 Transport Request: ${result.transport.number}`);
      console.log(`   Description: ${result.transport.description}`);
      console.log(`   Status: ${result.transport.status}`);
      console.log(`   Owner: ${result.transport.owner}`);
      console.log(`   Type: ${result.transport.type || 'K'}`);
      console.log(`   Target: ${result.transport.target || 'LOCAL'}`);

      if (result.transport.tasks && result.transport.tasks.length > 0) {
        console.log(`\n📋 Tasks created:`);
        for (const task of result.transport.tasks) {
          console.log(`\n📋 Task: ${task.number}`);
          console.log(`   Description: ${task.description}`);
          console.log(`   Owner: ${task.owner}`);
          console.log(`   Type: ${task.type}`);
        }
      }
    } catch (error) {
      console.error(
        '❌ Transport create failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
