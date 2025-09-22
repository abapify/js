import { Command } from 'commander';
import { AdtClientImpl } from '@abapify/adt-client';

async function lockObject(objectName: string, options: any, command: any) {
  const logger = command.parent?.logger;

  try {
    console.log(`🔒 Locking object: ${objectName}`);

    // Create ADT client with logger (only for verbose mode)
    const client = new AdtClientImpl({
      logger: logger?.child({ component: 'cli' }),
    });

    // Search for the object using ADT client search function
    console.log(`🔍 Searching for object...`);

    const searchOptions = {
      operation: 'quickSearch' as const,
      query: objectName,
      maxResults: 2,
    };
    const result = await client.repository.searchObjectsDetailed(searchOptions);
    const searchResults = result.objects || [];

    if (searchResults.length === 0) {
      console.error(`❌ Object '${objectName}' not found in SAP system`);
      process.exit(1);
    }

    if (searchResults.length > 1) {
      console.error(
        `❌ Multiple objects found for '${objectName}'. Please be more specific:`
      );
      searchResults.forEach((obj: any, index: number) => {
        console.log(`   ${index + 1}. ${obj.name} (${obj.type}) - ${obj.uri}`);
      });
      console.log(
        `💡 Use a more specific name or add filters to narrow down the search`
      );
      process.exit(1);
    }

    const foundObject = searchResults[0];
    const objectUri = foundObject.uri;

    console.log(
      `✅ Found: ${foundObject.name} (${foundObject.type}) - ${foundObject.description}`
    );
    console.log(`🔒 Attempting lock...`);

    try {
      const lockHandle = await client.repository.lockObject(objectUri);

      console.log(`✅ SUCCESS! Object ${objectName} locked`);
      console.log(`🔑 Lock handle: ${lockHandle}`);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const statusCode = error?.statusCode || error?.context?.status;

      console.error(`❌ Lock failed: ${errorMessage} (Status: ${statusCode})`);

      // Show helpful error information
      if (errorMessage.includes('currently editing')) {
        console.log(
          `💡 The object is already locked by another user or session`
        );
        console.log(
          `   - Check transaction SM12 in SAP GUI to see who has the lock`
        );
        console.log(
          `   - Use 'npx adt unlock ${objectName}' to force unlock if it's your lock`
        );
      } else if (errorMessage.includes('not found')) {
        console.log(
          `💡 The object might not exist or you don't have access to it`
        );
      } else {
        console.log(`💡 The lock might have failed due to:`);
        console.log(`   - Insufficient permissions`);
        console.log(`   - Object is already locked`);
        console.log(`   - Network or system issues`);
      }

      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Lock failed:`, error);
    process.exit(1);
  }
}

export function createLockCommand(): Command {
  const command = new Command('lock');

  command
    .description('Lock a SAP object by name')
    .argument('<objectName>', 'Name of the object to lock (e.g., ZIF_PETSTORE)')
    .action(async (objectName: string, options: any, command: any) => {
      await lockObject(objectName, options, command);
    });

  return command;
}
