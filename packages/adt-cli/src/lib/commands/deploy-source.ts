import { Command } from 'commander';
import { AdtClientImpl } from '@abapify/adt-client';
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';

interface ObjectTypeMapping {
  endpoint: string;
  description: string;
}

// Map file extensions/patterns to SAP ADT endpoints
const OBJECT_TYPE_MAPPINGS: Record<string, ObjectTypeMapping> = {
  // Interfaces
  intf: { endpoint: 'oo/interfaces', description: 'Interface' },
  if: { endpoint: 'oo/interfaces', description: 'Interface' },

  // Classes
  clas: { endpoint: 'oo/classes', description: 'Class' },
  cl: { endpoint: 'oo/classes', description: 'Class' },

  // Programs
  prog: { endpoint: 'programs/programs', description: 'Program' },
  rp: { endpoint: 'programs/programs', description: 'Program' },

  // Function Groups
  fugr: { endpoint: 'functions/groups', description: 'Function Group' },
  fg: { endpoint: 'functions/groups', description: 'Function Group' },

  // Includes
  incl: { endpoint: 'programs/includes', description: 'Include' },
  inc: { endpoint: 'programs/includes', description: 'Include' },
};

function detectObjectTypeFromFilename(filename: string): {
  type: string;
  name: string;
  endpoint: string;
  description: string;
} | null {
  const baseName = basename(filename).toLowerCase();

  // Remove common ABAP file extensions
  const cleanName = baseName
    .replace(/\.intf\.abap$/, '') // Interface files
    .replace(/\.clas\.abap$/, '') // Class files
    .replace(/\.prog\.abap$/, '') // Program files
    .replace(/\.fugr\.abap$/, '') // Function group files
    .replace(/\.incl\.abap$/, '') // Include files
    .replace(/\.abap$/, ''); // Generic .abap files

  // Try to match patterns like zif_petstore, zcl_something, etc.
  for (const [pattern, mapping] of Object.entries(OBJECT_TYPE_MAPPINGS)) {
    if (
      cleanName.startsWith(`z${pattern}_`) ||
      cleanName.startsWith(`y${pattern}_`)
    ) {
      return {
        type: pattern.toUpperCase(),
        name: cleanName.toUpperCase(),
        endpoint: mapping.endpoint,
        description: mapping.description,
      };
    }
  }

  // Try common prefixes
  if (cleanName.startsWith('zif_') || cleanName.startsWith('yif_')) {
    return {
      type: 'INTF',
      name: cleanName.toUpperCase(),
      endpoint: OBJECT_TYPE_MAPPINGS.intf.endpoint,
      description: OBJECT_TYPE_MAPPINGS.intf.description,
    };
  }

  if (cleanName.startsWith('zcl_') || cleanName.startsWith('ycl_')) {
    return {
      type: 'CLAS',
      name: cleanName.toUpperCase(),
      endpoint: OBJECT_TYPE_MAPPINGS.clas.endpoint,
      description: OBJECT_TYPE_MAPPINGS.clas.description,
    };
  }

  if (cleanName.startsWith('zfg_') || cleanName.startsWith('yfg_')) {
    return {
      type: 'FUGR',
      name: cleanName.toUpperCase(),
      endpoint: OBJECT_TYPE_MAPPINGS.fugr.endpoint,
      description: OBJECT_TYPE_MAPPINGS.fugr.description,
    };
  }

  return null;
}

async function deploySource(filePath: string, options: any, command: any) {
  const logger = command.parent?.logger;

  try {
    // Validate file exists
    if (!existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    // Lock handle is optional - we'll auto-lock if not provided
    let lockHandle = options.lockHandle;
    let shouldAutoUnlock = false;
    let foundObject: any = null;

    console.log(`📁 Deploying file: ${filePath}`);

    // Detect object type from filename
    const objectInfo = detectObjectTypeFromFilename(filePath);
    if (!objectInfo) {
      console.log(
        `❌ Cannot determine object type from filename: ${basename(filePath)}`
      );
      console.log(`💡 Supported patterns: zif_*, zcl_*, zfg_*, etc.`);
      process.exit(1);
    }

    console.log(`🔍 Detected: ${objectInfo.name} (${objectInfo.description})`);

    // Create ADT client
    const client = new AdtClientImpl({
      logger: logger?.child({ component: 'cli' }),
    });

    // Auto-lock if no lock handle provided
    if (!lockHandle) {
      console.log(`🔒 Auto-locking object ${objectInfo.name}...`);

      try {
        // Search for the object first
        const searchOptions = {
          operation: 'quickSearch' as const,
          query: objectInfo.name,
          maxResults: 2,
        };
        const result = await client.repository.searchObjectsDetailed(
          searchOptions
        );
        const searchResults = result.objects || [];

        if (searchResults.length === 0) {
          console.log(`❌ Object '${objectInfo.name}' not found in SAP system`);
          process.exit(1);
        }

        foundObject = searchResults[0];
        const objectUri = foundObject.uri;

        // Lock the object using repository operations
        lockHandle = await client.repository.lockObject(objectUri);
        shouldAutoUnlock = true;
        console.log(`🔑 Acquired lock handle: ${lockHandle}`);
      } catch (lockError: any) {
        console.log(`❌ Failed to lock object: ${lockError.message}`);

        // Attempt unlock even though lock failed (might help with stale locks)
        if (foundObject) {
          console.log(
            `🔓 Attempting unlock of object ${objectInfo.name} (cleanup after lock failure)...`
          );
          try {
            // Attempt generic unlock (might help with stale locks)
            await client.repository.unlockObject(foundObject.uri);
            console.log(`✅ Object unlocked successfully - retrying lock...`);

            // Retry lock after successful unlock
            try {
              lockHandle = await client.repository.lockObject(foundObject.uri);
              shouldAutoUnlock = true;
              console.log(`🔑 Lock acquired after cleanup: ${lockHandle}`);
            } catch (retryLockError: any) {
              console.log(`❌ Lock retry failed: ${retryLockError.message}`);
              console.log(
                `💡 You can manually lock first: npx adt lock ${objectInfo.name}`
              );
              process.exit(1);
            }
          } catch (unlockError) {
            console.log(`⚠️ Failed to unlock: ${unlockError}`);
            console.log(
              `💡 If lock is stale, use SAP transaction SM12 to remove it manually`
            );
            console.log(
              `💡 You can manually lock first: npx adt lock ${objectInfo.name}`
            );
            process.exit(1);
          }
        } else {
          console.log(
            `💡 You can manually lock first: npx adt lock ${objectInfo.name}`
          );
          process.exit(1);
        }
      }
    }

    // CRITICAL: Ensure we ALWAYS unlock if we have a lock, regardless of success/failure
    try {
      // Read file content
      let sourceCode: string;
      try {
        sourceCode = readFileSync(filePath, 'utf-8');
      } catch (error) {
        console.log(`❌ Failed to read file: ${error}`);
        throw error; // Re-throw to trigger finally block
      }

      console.log(`📄 Read ${sourceCode.length} characters from file`);

      // Construct ADT endpoint
      const endpoint = `/sap/bc/adt/${
        objectInfo.endpoint
      }/${objectInfo.name.toLowerCase()}/source/main?lockHandle=${lockHandle}`;
      console.log(`🚀 Deploying to: ${endpoint}`);

      const response = await client.request(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Accept: 'text/plain',
          'X-sap-adt-sessiontype': 'stateful',
          'x-sap-security-session': 'use',
        },
        body: sourceCode,
      });

      console.log(
        `✅ SUCCESS! ${objectInfo.description} ${objectInfo.name} deployed`
      );
      console.log(`📊 Response: ${response.status} ${response.statusText}`);

      // Show response body if available (usually contains compilation messages)
      if (response.body) {
        try {
          const responseText = await response.text();
          if (responseText.trim()) {
            console.log(`📋 Server response:`);
            console.log(responseText);
          }
        } catch (bodyError) {
          // Ignore body parsing errors
        }
      }
    } finally {
      // GUARANTEED UNLOCK: Always unlock if we have a lock, regardless of success/failure
      if (shouldAutoUnlock && lockHandle && foundObject) {
        console.log(`🔓 Auto-unlocking object ${objectInfo.name}...`);
        try {
          await client.repository.unlockObject(foundObject.uri, lockHandle);
          console.log(`✅ Object unlocked successfully`);
        } catch (unlockError) {
          console.log(`⚠️ Failed to auto-unlock: ${unlockError}`);
          console.log(
            `💡 You may need to manually unlock: npx adt unlock ${objectInfo.name}`
          );
        }
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const statusCode = error?.statusCode || error?.context?.status;

    console.log(`❌ Deploy failed: ${errorMessage} (Status: ${statusCode})`);

    // Show response body for debugging
    if (error?.context?.response) {
      console.log(`📋 Error response:`);
      console.log(error.context.response.substring(0, 500));
    }

    // Show helpful error information
    if (statusCode === 423) {
      console.log(`💡 Object is locked by another user or session`);
      console.log(`   - Check if the lock handle is still valid`);
      console.log(
        `   - Try locking the object again: npx adt lock ${objectInfo.name}`
      );
    } else if (statusCode === 400) {
      console.log(`💡 Bad request - possible issues:`);
      console.log(`   - Invalid lock handle`);
      console.log(`   - Syntax errors in the source code`);
      console.log(`   - Object name mismatch`);
    } else if (statusCode === 404) {
      console.log(`💡 Object not found:`);
      console.log(`   - Object might not exist in the system`);
      console.log(`   - Check the object name and type`);
    } else {
      console.log(`💡 Deploy might have failed due to:`);
      console.log(`   - Invalid lock handle (expired or wrong)`);
      console.log(`   - Syntax errors in source code`);
      console.log(`   - Insufficient permissions`);
      console.log(`   - Network or system issues`);
    }

    process.exit(1);
  }
}

export function createDeploySourceCommand(): Command {
  const command = new Command('deploy-source');

  command
    .description('Deploy source code to a SAP object (auto-locks if needed)')
    .argument('<file>', 'Path to the source file to deploy')
    .option(
      '--lock-handle <handle>',
      'Optional lock handle (will auto-lock if not provided)'
    )
    .action(async (file: string, options: any, command: any) => {
      await deploySource(file, options, command);
    });

  return command;
}
