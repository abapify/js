import { Command } from 'commander';
import { AdtClientImpl } from '@abapify/adt-client';

async function displayTaskObjects(result: any, adtClient: AdtClientImpl) {
  console.log(`\n📦 Objects in Transport:`);

  if (!result.transport.tasks || result.transport.tasks.length === 0) {
    console.log('   No tasks found');
    return;
  }

  for (const [taskIndex, task] of result.transport.tasks.entries()) {
    const isLastTask = taskIndex === result.transport.tasks.length - 1;
    const taskPrefix = isLastTask ? '└──' : '├──';
    const taskIndent = isLastTask ? '    ' : '│   ';

    try {
      // Use the client's getTransportObjects method
      const taskObjects = await adtClient.cts.getTransportObjects(task.number);

      console.log(
        `${taskPrefix} 📝 Task: ${task.number} (${taskObjects.length} objects)`
      );

      if (taskObjects.length === 0) {
        console.log(`${taskIndent}   └── (no objects)`);
      } else {
        taskObjects.forEach((obj: any, objIndex: number) => {
          const isLastObj = objIndex === taskObjects.length - 1;
          const objPrefix = isLastObj ? '└──' : '├──';

          console.log(
            `${taskIndent}   ${objPrefix} 📄 ${obj.name} (${obj.type}/${
              obj.package || 'K'
            })`
          );
        });
      }

      if (!isLastTask) {
        console.log('│');
      }
    } catch (error) {
      console.log(
        `${taskPrefix} 📝 Task: ${task.number} (error fetching objects)`
      );
      if (debug) {
        console.log(
          `${taskIndent}   Error: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }
}

export const transportGetCommand = new Command('get')
  .argument('<transportId>', 'Transport request ID')
  .description('Get details of a transport request')
  .option('--objects', 'Show objects in transport', false)
  .option('--json', 'Output as JSON', false)
  .action(async (transportId, options, command) => {
    const logger = command.parent?.parent?.logger;

    try {
      // Create ADT client with logger
      const adtClient = new AdtClientImpl({
        logger: logger?.child({ component: 'cli' }),
      });

      console.log(`🚚 Fetching transport request: ${transportId}`);

      // For now, use the transport list to get basic info
      // TODO: Implement getTransport method in client if needed
      const transportList = await adtClient.cts.listTransports({
        user: undefined,
        status: undefined,
        maxResults: 100,
      });

      const transport = transportList.transports.find(
        (t) => t.number === transportId
      );

      if (!transport) {
        console.error(`❌ Transport ${transportId} not found`);
        process.exit(1);
      }

      const result = { transport };

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`\n🚛 Transport Request: ${result.transport.number}`);
      console.log(`   Description: ${result.transport.description}`);
      console.log(`   Status: ${result.transport.status}`);
      console.log(`   Owner: ${result.transport.owner}`);
      console.log(`   Target: ${result.transport.target || 'LOCAL'}`);

      if (result.transport.tasks && result.transport.tasks.length > 0) {
        console.log(`\n📋 Tasks (${result.transport.tasks.length}):`);
        result.transport.tasks.forEach((task, index) => {
          const isLast = index === (result.transport.tasks?.length || 0) - 1;
          const prefix = isLast ? '└──' : '├──';

          console.log(`${prefix} 📝 Task: ${task.number}`);
          console.log(
            `${isLast ? '    ' : '│   '}   📄 ${
              task.description || 'No description'
            }`
          );
          console.log(`${isLast ? '    ' : '│   '}   👤 Owner: ${task.owner}`);
          console.log(
            `${isLast ? '    ' : '│   '}   🔒 Status: ${
              task.status || 'Unknown'
            }`
          );
          console.log(
            `${isLast ? '    ' : '│   '}   🏷️  Type: ${task.type || 'Unknown'}`
          );

          if (index < (result.transport.tasks?.length || 0) - 1) {
            console.log('│');
          }
        });
      }

      // Display objects if requested
      if (options.objects) {
        await displayTaskObjects(result, adtClient);
      }
    } catch (error) {
      console.error(
        '❌ Transport get failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
