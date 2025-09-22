import { Command } from 'commander';
import { AdtClientImpl } from '@abapify/adt-client';

async function unlockObject(objectName: string, options: any, command: any) {
  const logger = command.parent?.logger;

  try {
    console.log(`🔓 Unlocking object: ${objectName}`);

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

    // Determine unlock method based on whether lock handle is provided
    if (options.lockHandle) {
      console.log(
        `🔓 Attempting unlock with lock handle: ${options.lockHandle}`
      );

      try {
        await client.repository.unlockObject(objectUri, options.lockHandle);

        console.log(
          `✅ SUCCESS! Object ${objectName} unlocked with lock handle`
        );
      } catch (error: any) {
        console.error(
          `❌ Unlock with lock handle failed, trying generic unlock...`
        );
        // Fall back to generic unlock
        try {
          await client.repository.unlockObject(objectUri);
          console.log(`✅ SUCCESS! Object ${objectName} unlocked`);
        } catch (genericError: any) {
          const errorMessage = genericError?.message || String(genericError);
          const statusCode =
            genericError?.statusCode || genericError?.context?.status;

          console.error(
            `❌ Generic unlock also failed: ${errorMessage} (Status: ${statusCode})`
          );

          console.log(`💡 The object might:`);
          console.log(`   - Already be unlocked`);
          console.log(`   - Be locked by another user`);
          console.log(`   - Require manual unlock via SM12 transaction`);
          throw genericError;
        }
      }
    } else {
      console.log(`🔓 Attempting generic unlock (no lock handle provided)...`);
      try {
        await client.repository.unlockObject(objectUri);
        console.log(`✅ SUCCESS! Object ${objectName} unlocked`);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        const statusCode = error?.statusCode || error?.context?.status;

        console.error(
          `❌ Generic unlock failed: ${errorMessage} (Status: ${statusCode})`
        );

        console.log(`💡 The object might:`);
        console.log(`   - Already be unlocked`);
        console.log(`   - Be locked by another user`);
        console.log(`   - Require manual unlock via SM12 transaction`);
        console.log(
          `   - Need a specific lock handle (use --lock-handle flag)`
        );
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Unlock failed:`, error);
    process.exit(1);
  }
}

export function createUnlockCommand(): Command {
  const command = new Command('unlock');

  command
    .description('Unlock a SAP object by name')
    .argument(
      '<objectName>',
      'Name of the object to unlock (e.g., ZIF_PETSTORE)'
    )
    .option(
      '--lock-handle <handle>',
      'Specific lock handle to unlock (more reliable than generic unlock)'
    )
    .action(async (objectName: string, options: any, command: any) => {
      await unlockObject(objectName, options, command);
    });

  return command;
}
