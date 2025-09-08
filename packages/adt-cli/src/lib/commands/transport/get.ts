import { Command } from 'commander';
import { TransportService } from '../../services/transport';
import { adtClient } from '../../shared/clients';

async function displayTaskObjects(
  transportService: TransportService,
  result: any,
  debug: boolean
) {
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
      // Use the private method through reflection or create a public wrapper
      const taskObjects = await (transportService as any).getTaskObjects(
        task.number,
        { debug }
      );

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
            console.log(
              `${isLast ? '    ' : '│   '}   👤 Owner: ${task.owner}`
            );
            console.log(
              `${isLast ? '    ' : '│   '}   🔒 Status: ${
                task.status || 'Unknown'
              }`
            );
            console.log(
              `${isLast ? '    ' : '│   '}   🏷️  Type: ${
                task.type || 'Unknown'
              }`
            );

            if (index < (result.transport.tasks?.length || 0) - 1) {
              console.log('│');
            }
          });
        }

        // Display objects if requested
        if (options.objects || options.full) {
          await displayTaskObjects(transportService, result, options.debug);
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
