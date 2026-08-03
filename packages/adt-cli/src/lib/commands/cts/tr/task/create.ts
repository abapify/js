import { Command } from 'commander';
import { getAdtClientV2 } from '../../../../utils/adt-client-v2';
import { CtsTransportLifecycleService } from '../../../../services/cts';

export const ctsTaskCreateCommand = new Command('create')
  .description('Create a modifiable task under an existing transport request')
  .argument('<transport>', 'Parent transport request number')
  .argument('<owner>', 'SAP user who should own the new task')
  .option('--json', 'Output result as JSON')
  .action(
    async (transport: string, owner: string, options: { json: boolean }) => {
      try {
        const client = await getAdtClientV2();
        const result = await new CtsTransportLifecycleService(
          client,
        ).createTask({
          transport: transport.toUpperCase(),
          owner: owner.toUpperCase(),
        });
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(
            `✅ Task ${result.task} created under ${result.transport}`,
          );
          console.log(`   Owner: ${result.owner}`);
        }
      } catch (error) {
        console.error(
          '❌ Task creation failed:',
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    },
  );
