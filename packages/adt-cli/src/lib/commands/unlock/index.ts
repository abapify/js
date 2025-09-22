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
        const response = await client.request(
          `${objectUri}?_action=UNLOCK&lockHandle=${options.lockHandle}`,
          {
            method: 'POST',
            headers: {
              'X-sap-adt-sessiontype': 'stateful',
              'x-sap-security-session': 'use',
            },
          }
        );

        console.log(
          `✅ SUCCESS! Object ${objectName} unlocked with lock handle`
        );
        console.log(
          `📊 Response status: ${response.status} ${response.statusText}`
        );
      } catch (error: any) {
        console.error(
          `❌ Unlock with lock handle failed, trying generic unlock...`
        );
        // Fall back to generic unlock
        await performGenericUnlock(client, objectUri, objectName);
      }
    } else {
      console.log(`🔓 Attempting generic unlock (no lock handle provided)...`);
      await performGenericUnlock(client, objectUri, objectName);
    }
  } catch (error) {
    console.error(`❌ Unlock failed:`, error);
    process.exit(1);
  }
}

async function performGenericUnlock(
  client: any,
  objectUri: string,
  objectName: string
) {
  try {
    const response = await client.request(`${objectUri}?_action=UNLOCK`, {
      method: 'POST',
      headers: {
        'X-sap-adt-sessiontype': 'stateful',
        'x-sap-security-session': 'use',
      },
    });

    console.log(`✅ SUCCESS! Object ${objectName} unlocked`);
    console.log(
      `📊 Response status: ${response.status} ${response.statusText}`
    );

    // Try to extract any lock information from response
    try {
      const responseText = await response.text();
      console.log(`📋 Response body length: ${responseText.length}`);
      if (responseText.trim()) {
        console.log(
          `📋 Response content: ${responseText.substring(0, 300)}${
            responseText.length > 300 ? '...' : ''
          }`
        );
      } else {
        console.log(`📋 Response body is empty`);
      }
    } catch (bodyError) {
      console.log(`⚠️ Could not read response body: ${bodyError}`);
    }
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const statusCode = error?.statusCode || error?.context?.status;

    console.error(
      `❌ Generic unlock failed: ${errorMessage} (Status: ${statusCode})`
    );

    // Log response body if available for debugging
    if (error?.context?.response) {
      console.log(
        `📄 Error response: ${error.context.response.substring(0, 200)}...`
      );
    }

    console.log(`💡 The object might:`);
    console.log(`   - Already be unlocked`);
    console.log(`   - Be locked by another user`);
    console.log(`   - Require manual unlock via SM12 transaction`);
    console.log(`   - Need a specific lock handle (use --lock-handle flag)`);
    throw error;
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
